import { Change, Context, Fiber, State, JSX } from './types'
import { commitWork, createDom } from './browser'
import { getComponentRefsFromTree, getComponentRefsFromTreeByTag } from './helper'

function commitRoot(context: Context) {
  context.deletions.forEach(commitWork)
  commitWork(context.wipRoot.child)
  context.currentRoot = context.wipRoot
  context.wipRoot = undefined

  // TODO check if dependencies changed.
  if (State.effects.length) {
    State.effects.forEach((effect) => effect())
    State.effects = []
  }
}

function reconcileChildren(context: Context, currentFiber: Fiber, elements: JSX[] = []) {
  let index = 0
  let oldFiber = currentFiber.previous && currentFiber.previous.child
  let prevSibling: Fiber
  let maxTries = 100

  while ((index < elements.length || oldFiber) && maxTries > 0) {
    maxTries -= 1
    const element = elements[index]
    let newFiber: Fiber

    const sameType = oldFiber && element && element.type === oldFiber.type

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: currentFiber,
        previous: oldFiber,
        change: Change.update,
      }
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: undefined,
        parent: currentFiber,
        previous: undefined,
        change: Change.add,
      }
    }
    if (oldFiber && !sameType) {
      oldFiber.change = Change.delete
      context.deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      currentFiber.child = newFiber
    } else if (element) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index += 1

    // NOTE added to prevent endless loop after state update to component.
    if (index > elements.length) {
      oldFiber = undefined
    }
  }

  if (maxTries === 0) {
    console.error('Ran out of tries at reconcileChildren.', elements)
  }
}

function updateFunctionComponent(context: Context, fiber: Fiber) {
  if (typeof fiber.type !== 'function') return
  context.wipFiber = fiber
  context.wipFiber.hooks = []
  State.context = context
  fiber.afterListeners = []
  fiber.component = {
    id: '123', // TODO
    root: fiber,
    context,
    rerender: () => {
      // Same as setState
      context.wipRoot = {
        dom: context.currentRoot.dom,
        props: context.currentRoot.props,
        previous: context.currentRoot,
      }
      context.nextUnitOfWork = context.wipRoot
    },
    // TODO memoize.
    get refs() {
      return getComponentRefsFromTree(fiber, [], true) as HTMLElement[]
    },
    get refsNested() {
      return getComponentRefsFromTree(fiber, [], false)
    },
    refsByTag(tag: keyof HTMLElementTagNameMap) {
      return getComponentRefsFromTreeByTag(fiber, [], tag)
    },
    after(callback: () => void) {
      fiber.afterListeners.push(callback)
    },
  }
  const children = [fiber.type.call(fiber.component, fiber.props)]
  State.context = undefined
  reconcileChildren(context, fiber, children.flat())
}

function updateHostComponent(context: Context, fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  // Flattening children to make arrays work.
  reconcileChildren(context, fiber, fiber.props?.children.flat())
}

function performUnitOfWork(context: Context, fiber: Fiber) {
  const isFunctionComponent = fiber.type instanceof Function
  if (isFunctionComponent) {
    updateFunctionComponent(context, fiber)
  } else {
    updateHostComponent(context, fiber)
  }
  if (fiber.child) return fiber.child
  let nextFiber: Fiber | undefined = fiber
  let maxTries = 100
  while (nextFiber && maxTries > 0) {
    maxTries -= 1
    if (nextFiber.sibling) return nextFiber.sibling
    nextFiber = nextFiber.parent
  }
  if (maxTries === 0) {
    console.error('Ran out of tries at performUnitOfWork.')
  }
  return undefined
}

export function workLoop(deadline: IdleDeadline, context: Context) {
  let shouldYield = false
  let maxTries = 100
  while (context.nextUnitOfWork && !shouldYield && maxTries > 0) {
    maxTries -= 1
    context.nextUnitOfWork = performUnitOfWork(context, context.nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  if (maxTries === 0) {
    console.error('Ran out of tries at workLoop.')
  }

  if (!context.nextUnitOfWork && context.wipRoot) {
    commitRoot(context)
  }

  requestIdleCallback((nextDeadline) => workLoop(nextDeadline, context))
}
