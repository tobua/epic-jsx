import { commitFiber, createNativeElement } from './browser'
import { addFiber, createComponent, updateFiber } from './component'
import { Constants, log, schedule } from './helper'
import { Change, type Context, type Fiber } from './types'
import type React from './types/index'

export const Renderer: { context?: Context; effects: Function[]; current?: Fiber } = {
  context: undefined,
  effects: [],
  current: undefined,
}

function commit(context: Context, fiber: Fiber) {
  for (const currentFiber of context.deletions) {
    commitFiber(currentFiber)
    if (typeof currentFiber.type === 'function' && typeof currentFiber.endListener === 'function') {
      currentFiber.endListener()
    }
  }
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
function reconcileChildren(context: Context, current: Fiber, children: React.JSX.Element[] = []) {
  let index = 0
  let previous = current.previous?.child
  let previousSibling: Fiber | undefined
  let maxTries = 500

  // TODO compare children.length to previous element length.
  while ((index < children.length || previous) && maxTries > 0) {
    maxTries -= 1
    const element = children[index]
    let newFiber: Fiber | undefined

    // TODO also compare props.
    const fragment = element === null || previous === null
    const isSameType = !fragment && element?.type === previous?.type

    if (previous && !isSameType) {
      // Delete the old node and its children when types don't match
      deleteChildren(context, previous)
    }

    if (isSameType && previous) {
      newFiber = updateFiber(current, previous, element)
    } else if (element) {
      // Create new fiber for different types or new elements
      newFiber = addFiber(current, element, previous)
    }

    const item = previous

    if (previous) {
      previous = previous.sibling
    }

    if (index === 0) {
      current.child = newFiber
    } else if (element && previousSibling) {
      previousSibling.sibling = newFiber
    }

    previousSibling = newFiber
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

function propsChanged(nextProps: { [key: string]: any }, previousProps?: { [key: string]: any }): boolean {
  if (!previousProps) {
    return true
  }

  const nextKeys = Object.keys(nextProps).filter((key) => key !== 'children')
  const prevKeys = Object.keys(previousProps).filter((key) => key !== 'children')

  if (nextKeys.length !== prevKeys.length) {
    return true
  }

  for (const key of nextKeys) {
    const nextVal = nextProps[key]
    const prevVal = previousProps[key]

    // Handle functions - compare by reference
    if (typeof nextVal === 'function') {
      if (nextVal !== prevVal) {
        return true
      }
      continue
    }

    // Handle objects and arrays
    if (typeof nextVal === 'object' && nextVal !== null) {
      if (Array.isArray(nextVal)) {
        if (!Array.isArray(prevVal) || nextVal.length !== prevVal.length) {
          return true
        }
        for (let i = 0; i < nextVal.length; i++) {
          if (nextVal[i] !== prevVal[i]) {
            return true
          }
        }
      } else if (!propsChanged(nextVal, prevVal)) {
        return true
      }
      continue
    }

    // Handle primitives
    if (nextVal !== prevVal) {
      return true
    }
  }

  // Deep child comparison.
  const nextChildren = nextProps.children
  const prevChildren = previousProps.children

  // Handle undefined/null cases
  if (!nextChildren !== !prevChildren) {
    return true
  }

  // Compare arrays of children
  if (Array.isArray(nextChildren) && Array.isArray(prevChildren)) {
    if (nextChildren.length !== prevChildren.length) {
      return true
    }
    return nextChildren.some((nextChild, index): boolean => {
      const prevChild = prevChildren[index]
      // Handle null/undefined cases
      if (!nextChild !== !prevChild) {
        return true
      }

      // If both are objects (likely Fibers or Elements), compare their properties
      if (typeof nextChild === 'object' && typeof prevChild === 'object' && nextChild && prevChild) {
        if (typeof nextChild.type === 'string' && typeof prevChild.type === 'string') {
          return true
        }
        return nextChild.type !== prevChild.type || propsChanged(nextChild.props || {}, prevChild.props || {})
      }
      // Fallback to reference equality for primitives
      return nextChild !== prevChild
    })
  }

  // Compare single child with deep comparison
  if (typeof nextChildren === 'object' && typeof prevChildren === 'object' && nextChildren && prevChildren) {
    return nextChildren.type !== prevChildren.type || propsChanged(nextChildren.props || {}, prevChildren.props || {})
  }

  return nextChildren !== prevChildren
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
  const componentData = createComponent({ fiber, context })
  fiber.component = componentData.component
  Renderer.current = fiber
  if (Array.isArray(fiber.props.children) && fiber.props.children.length === 0) {
    // biome-ignore lint/performance/noDelete: Clean up meaningless props.
    delete fiber.props.children
  }
  let children: React.JSX.Element[] = []
  try {
    children = [fiber.type.call(fiber.component, fiber.props)]
  } catch (error: any) {
    if (error.message === 'plugin' && componentData.pluginResult) {
      children = [componentData.pluginResult]
    }
  }
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

function render(context: Context, fiber: Fiber, isFirst = false) {
  const isFunctionComponent = fiber.type instanceof Function
  if (isFunctionComponent) {
    if (isFirst || propsChanged(fiber.props, fiber.previous?.props)) {
      updateFunctionComponent(context, fiber)
    }
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
  return
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
  context.afterListeners = []

  let shouldYield = false
  let maxTries = Constants.maxTriesProcess // Prevent infinite loop, long lists can take a lot of tries.
  while (context.current && !shouldYield && maxTries > 0) {
    maxTries -= 1
    // Render current fiber.
    context.current = render(context, context.current, maxTries === Constants.maxTriesProcess - 1)
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
    if (context.afterListeners) {
      for (const callback of context.afterListeners) {
        callback.call(null)
      }
      context.afterListeners = []
    }
    context.rendered.length = 0
  }

  if (context.current || context.pending.length > 0) {
    schedule((nextDeadline) => process(nextDeadline, context))
  }
}

export const processNow = (context: Context) => process({ timeRemaining: () => Number.MAX_SAFE_INTEGER, didTimeout: false }, context)
