import { Renderer } from '.'
import { commitFiber, createNativeElement } from './browser'
import { getComponentRefsFromTree, getComponentRefsFromTreeByTag, log, schedule } from './helper'
import { Change, type Context, type Fiber, type JSX } from './types'

function commit(context: Context, fiber: Fiber) {
  context.deletions.forEach(commitFiber)
  context.deletions.length = 0
  if (fiber.child) {
    commitFiber(fiber.child)
  }

  // TODO check if dependencies changed.
  if (Renderer.effects.length > 0) {
    for (const effect of Renderer.effects) {
      effect()
    }
    Renderer.effects.length = 0
  }
}

function deleteAllFiberSiblings(context: Context, node?: Fiber) {
  if (!node) {
    return
  }
  node.change = Change.Delete
  context.deletions.push(node)

  if (node?.sibling) {
    deleteAllFiberSiblings(context, node.sibling)
  }
}

// Loops flat through all the siblings of the previous child of the node passed.
function reconcileChildren(context: Context, current: Fiber, children: JSX[] = []) {
  let index = 0
  let previous = current.previous?.child
  let prevSibling: Fiber | undefined
  let maxTries = 500

  // TODO compare children.length to previous element length.
  while ((index < children.length || previous) && maxTries > 0) {
    maxTries -= 1
    const element = children[index]
    let newFiber: Fiber | undefined

    // TODO also compare props.
    const fragment = element === null || previous === null
    const isSameType = !fragment && element?.type === previous?.type

    if (isSameType && previous) {
      newFiber = createUpdatedFiber(current, previous, element)
    }

    if (element && isSameType && !previous) {
      newFiber = createNewFiber(current, element, previous)
    }

    // Newly added (possibly unnecessary).
    if (element && !isSameType) {
      newFiber = createNewFiber(current, element, previous)
    }

    if (previous && !isSameType) {
      deleteChildren(context, previous)
    }

    const item = previous

    if (previous) {
      previous = previous.sibling
    }

    if (index === 0) {
      current.child = newFiber
    } else if (element && prevSibling) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index += 1

    // NOTE added to prevent endless loop after state update to component.
    if (index > children.length) {
      // Remove additional nodes no longer present in tree.
      deleteAllFiberSiblings(context, previous ?? item)
      previous = undefined
    }
  }

  if (maxTries === 0) {
    log('Ran out of tries at reconcileChildren.', 'warning')
  }
}

const createUpdatedFiber = (current: Fiber, previous: Fiber, element?: JSX): Fiber => ({
  type: previous.type,
  props: element?.props,
  native: previous.native,
  parent: current,
  previous,
  hooks: previous.hooks,
  svg: previous.svg || previous.type === 'svg',
  change: Change.Update,
})

const createNewFiber = (current: Fiber, element: JSX, previous: Fiber | undefined): Fiber => ({
  type: element.type,
  props: element.props,
  native: undefined,
  parent: current,
  previous: undefined,
  hooks: typeof element.type === 'function' ? (previous ? previous.hooks : []) : undefined,
  svg: current.svg || element.type === 'svg',
  change: Change.Add,
})

function deleteChildren(context: Context, fiber: Fiber) {
  if (fiber.change === Change.Delete) {
    return
  }

  fiber.change = Change.Delete
  context.deletions.push(fiber)

  if (fiber.child) {
    deleteChildren(context, fiber.child)
  }

  if (fiber.sibling) {
    deleteChildren(context, fiber.sibling)
  }
}

function rerender(context: Context, fiber: Fiber) {
  context.pending.push({
    ...fiber,
    sibling: undefined, // Not rerendering siblings.
    previous: fiber,
  })
}

function updateFunctionComponent(context: Context, fiber: Fiber) {
  if (typeof fiber.type !== 'function') {
    return
  }
  if (typeof fiber.hooks === 'undefined') {
    fiber.hooks = []
  }
  fiber.hooks.length = 0
  Renderer.context = context
  fiber.afterListeners = []
  // TODO id in fiber shouldn't be optional, assign during creation.
  if (!fiber.id) {
    fiber.id = fiber.previous?.id ?? Math.floor(Math.random() * 1000000)
  }
  fiber.component = {
    id: fiber.id,
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
      fiber.afterListeners?.push(callback)
    },
  }
  Renderer.current = fiber
  if (Array.isArray(fiber.props.children) && fiber.props.children.length === 0) {
    // biome-ignore lint/performance/noDelete: Clean up meaningless props.
    delete fiber.props.children
  }
  const children = [fiber.type.call(fiber.component, fiber.props)]
  Renderer.current = undefined
  Renderer.context = undefined
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
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber: Fiber | undefined = fiber
  let maxTries = 500
  while (nextFiber && maxTries > 0) {
    maxTries -= 1
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
  if (maxTries === 0) {
    log('Ran out of tries at render.', 'warning')
  }
  return undefined
}

export function process(deadline: IdleDeadline, context: Context) {
  if (!context.current && context.pending.length === 0) {
    log('Trying to process an empty queue')
    return
  }

  if (!context.current) {
    context.current = context.pending.shift()
    if (context.current) {
      context.rendered.push(context.current) // Rendered state only final when current empty.
    }
  }

  let shouldYield = false
  let maxTries = 500
  while (context.current && !shouldYield && maxTries > 0) {
    maxTries -= 1
    // Render current fiber.
    context.current = render(context, context.current)
    // Add next fiber if previous tree finished.
    if (!context.current && context.pending.length > 0) {
      context.current = context.pending.shift()
      if (context.current) {
        context.rendered.push(context.current)
      }
    }
    // Yield current rendering cycle if out of time.
    shouldYield = deadline.timeRemaining() < 1
  }
  if (maxTries === 0) {
    log('Ran out of tries at process.', 'warning')
  }

  // Yielded if context.current not empty.
  if (!context.current && context.rendered.length > 0) {
    for (const fiber of context.rendered) {
      commit(context, fiber)
    }
    context.rendered.length = 0
  }

  if (context.current || context.pending.length > 0) {
    schedule((nextDeadline) => process(nextDeadline, context))
  }
}

export const processNow = (context: Context) => process({ timeRemaining: () => 99999, didTimeout: false }, context)
