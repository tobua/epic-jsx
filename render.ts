import { Change, Context, Fiber, State, JSX } from './types'
import { commitFiber, createNativeElement } from './browser'
import { getComponentRefsFromTree, getComponentRefsFromTreeByTag, log } from './helper'
import { toReadableTree } from './test'

function commit(context: Context, fiber: Fiber) {
  context.deletions.forEach(commitFiber)
  commitFiber(fiber.child)

  // TODO check if dependencies changed.
  if (State.effects.length) {
    State.effects.forEach((effect) => effect())
    State.effects.length = 0
  }
}

function reconcileChildren(context: Context, current: Fiber, elements: JSX[] = []) {
  let index = 0
  let previous = current.previous?.child
  let prevSibling: Fiber
  let maxTries = 500

  while ((index < elements.length || previous) && maxTries > 0) {
    maxTries -= 1
    const element = elements[index]
    let newFiber: Fiber

    const sameType = element?.type === previous?.type

    if (sameType && previous) {
      newFiber = {
        type: previous.type,
        props: element.props,
        native: previous.native,
        parent: current,
        previous: previous,
        hooks: previous.hooks,
        change: Change.update,
      }
    }

    // Newly added (possibly unnecessary).
    if (sameType && !previous) {
      newFiber = {
        type: element.type,
        props: element.props,
        native: undefined,
        parent: current,
        previous: undefined,
        hooks: typeof element.type === 'function' ? previous.hooks : undefined,
        change: Change.add,
      }
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        native: undefined,
        parent: current,
        previous: undefined,
        hooks: typeof element.type === 'function' ? [] : undefined,
        change: Change.add,
      }
    }

    if (previous && !sameType) {
      previous.change = Change.delete
      context.deletions.push(previous)
    }

    if (previous) {
      previous = previous.sibling
    }

    if (index === 0) {
      current.child = newFiber
    } else if (element) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index += 1

    // NOTE added to prevent endless loop after state update to component.
    if (index > elements.length) {
      previous = undefined
    }
  }

  if (maxTries === 0) {
    console.error('Ran out of tries at reconcileChildren.', elements)
  }
}

function rerender(context: Context, fiber: Fiber) {
  context.pending.push({
    native: fiber.native,
    props: fiber.props,
    type: fiber.type,
    previous: fiber,
    parent: fiber.parent,
  })
}

function updateFunctionComponent(context: Context, fiber: Fiber) {
  if (typeof fiber.type !== 'function') return
  if (typeof fiber.hooks === 'undefined') {
    fiber.hooks = []
  }
  fiber.hooks.length = 0
  State.context = context
  fiber.afterListeners = []
  fiber.component = {
    id: '123', // TODO
    root: fiber,
    context,
    rerender: () => rerender(context, fiber),
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
  if (!fiber.native) {
    fiber.native = createNativeElement(fiber)
  }
  // Flattening children to make arrays work.
  reconcileChildren(context, fiber, fiber.props?.children.flat())
}

function render(context: Context, fiber: Fiber) {
  const isFunctionComponent = fiber.type instanceof Function
  if (isFunctionComponent) {
    updateFunctionComponent(context, fiber)
  } else {
    updateHostComponent(context, fiber)
  }
  if (fiber.child) return fiber.child
  let nextFiber: Fiber | undefined = fiber
  let maxTries = 500
  while (nextFiber && maxTries > 0) {
    maxTries -= 1
    if (nextFiber.sibling) return nextFiber.sibling
    nextFiber = nextFiber.parent
  }
  if (maxTries === 0) {
    console.error('Ran out of tries at render.')
  }
  return undefined
}

export function process(deadline: IdleDeadline, context: Context) {
  if (!context.current && context.pending.length === 0) {
    return log('Trying to process an empty queue')
  }

  if (!context.current) {
    context.current = context.pending.shift()
    context.rendered.push(context.current) // Rendered state only final when current empty.
  }

  let shouldYield = false
  let maxTries = 500
  while (context.current && !shouldYield && maxTries > 0) {
    maxTries -= 1
    // Render current fiber.
    context.current = render(context, context.current)
    // Add next fiber if previous tree finished.
    if (!context.current && context.pending.length) {
      context.current = context.pending.shift()
      context.rendered.push(context.current)
    }
    // Yield current rendering cycle if out of time.
    shouldYield = deadline.timeRemaining() < 1
  }
  if (maxTries === 0) {
    console.error('Ran out of tries at process.')
  }

  // Yielded if context.current not empty.
  if (!context.current && context.rendered.length) {
    context.rendered.forEach((fiber) => commit(context, fiber))
    context.rendered.length = 0
  }

  requestIdleCallback((nextDeadline) => process(nextDeadline, context))
}
