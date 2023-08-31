import { Context, Fiber } from './types'
import { commitWork, createDom } from './browser'

function commitRoot(context: Context) {
  context.deletions.forEach(commitWork)
  commitWork(context.wipRoot.child)
  context.currentRoot = context.wipRoot
  context.wipRoot = undefined
}

function reconcileChildren(context: Context, currentFiber: Fiber, elements: JSX.Element[] = []) {
  let index = 0
  let oldFiber = currentFiber.alternate && currentFiber.alternate.child
  let prevSibling = null

  while (index < elements.length || oldFiber !== null) {
    const element = elements[index]
    let newFiber = null

    const sameType = oldFiber && element && element.type === oldFiber.type

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: currentFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      }
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: currentFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      }
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION'
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
}

function updateFunctionComponent(context: Context, fiber: Fiber) {
  if (typeof fiber.type !== 'function') return
  context.wipFiber = fiber
  context.hookIndex = 0
  context.wipFiber.hooks = []
  const children = [fiber.type.call({ context }, fiber.props)]
  reconcileChildren(context, fiber, children)
}

function updateHostComponent(context: Context, fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  reconcileChildren(context, fiber, fiber.props?.children)
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
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling
    nextFiber = nextFiber.parent
  }
  return undefined
}

export function workLoop(deadline: IdleDeadline, context: Context) {
  let shouldYield = false
  while (context.nextUnitOfWork && !shouldYield) {
    context.nextUnitOfWork = performUnitOfWork(context, context.nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!context.nextUnitOfWork && context.wipRoot) {
    commitRoot(context)
  }

  requestIdleCallback((nextDeadline) => workLoop(nextDeadline, context))
}
