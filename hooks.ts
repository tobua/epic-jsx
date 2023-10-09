import { Renderer, Ref } from './types'
import { log, schedule, shallowArrayEqual } from './helper'
import { process } from './render'

export function useState<T extends any>(initial: T) {
  if (!Renderer.context) {
    log('Hooks can only be used inside a JSX component.', 'warning')
  }

  const hookIndex = Renderer.context.current.hooks.length
  // useState is only called during the render when the wipFiber matches the current component where the setState call is made.
  const previousHook = Renderer.context.current.previous?.hooks[hookIndex]
  const hook = { state: previousHook ? previousHook.state : initial } as {
    state: T
    setState: (value: T) => void
  }

  const { context } = Renderer
  const {
    context: { pending, current },
  } = Renderer

  const setState = (value: T) => {
    // Ensure newest version of setState is called.
    // TODO recursively travels through whole chain.
    if (current.hooks[hookIndex] && setState !== current.hooks[hookIndex].setState) {
      current.hooks[hookIndex].setState(value)
      return
    }

    // NOTE new state will be returned on next render when useState is called again.
    hook.state = value

    if (pending.find((currentValue) => currentValue.previous === current)) {
      // Rerender already registered.
      return
    }

    pending.push({
      native: current.native, // TODO components never have native elements, make optional.
      props: current.props,
      type: current.type,
      hooks: [],
      previous: current,
      parent: current.parent,
    })

    schedule((deadline) => process(deadline, context))
  }

  hook.setState = setState
  current.hooks.push(hook)
  // Also update previous hooks to get the most recent one from old scopes.
  if (Renderer.context.current.previous) {
    Renderer.context.current.previous.hooks[hookIndex] = hook
  }

  return [hook.state, setState] as const
}

export function useRef<T extends HTMLElement>() {
  return { current: undefined } as Ref<T>
}

export function useEffect(callback: () => void, dependencies: any[] = []) {
  if (!Renderer.context) {
    log('Hooks can only be used inside a JSX component.', 'warning')
  }

  const previousDependencies = Renderer.context.dependencies.get(callback)

  if (!previousDependencies || !shallowArrayEqual(dependencies, previousDependencies)) {
    Renderer.effects.push(callback)
  }

  Renderer.context.dependencies.set(callback, dependencies)
}

export function useCallback<T extends (...args: any) => any>(
  callback: T,
  dependencies: any[] = [],
) {
  return callback
}

export function useMemo<T extends any>(method: () => T, dependencies: any[] = []) {
  return method()
}
