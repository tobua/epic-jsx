import { State, Ref } from './types'
import { log, shallowArrayEqual } from './helper'
import { process } from './render'

export function useState<T extends any>(initial: T) {
  if (!State.context) {
    log('Hooks can only be used inside a JSX component.', 'warning')
  }

  // useState is only called during the render when the wipFiber matches the current component where the setState call is made.
  const previousHook = State.context.current.previous?.hooks[State.context.current.hooks.length]
  const hook = { state: previousHook ? previousHook.state : initial } as { state: T }

  const { context } = State
  const {
    context: { pending, current, deletions },
  } = State

  const setState = (value: T) => {
    // NOTE new state will be returned on next render when useState is called again.
    hook.state = value

    if (pending.find((value) => value.previous === current)) {
      // Rerender already registered.
      return
    }

    pending.push({
      native: current.native, // TODO components never have native elements
      props: current.props,
      type: current.type,
      previous: current,
    })

    deletions.length = 0

    requestIdleCallback((deadline) => process(deadline, context))
  }

  current.hooks.push(hook)

  return [hook.state, setState] as const
}

export function useRef<T extends HTMLElement>() {
  // TODO where does the ref come from... State.context.current.native
  return { current: undefined } as Ref<T>
}

export function useEffect(callback: () => void, dependencies: any[] = []) {
  if (!State.context) {
    log('Hooks can only be used inside a JSX component.', 'warning')
  }

  const previousDependencies = State.context.dependencies.get(callback)

  if (!previousDependencies || !shallowArrayEqual(dependencies, previousDependencies)) {
    State.effects.push(callback)
  }

  State.context.dependencies.set(callback, dependencies)
}

export function useCallback<T extends (...args: any) => any>(
  callback: T,
  dependencies: any[] = []
) {
  return callback
}

export function useMemo<T extends any>(method: () => T, dependencies: any[] = []) {
  return method()
}
