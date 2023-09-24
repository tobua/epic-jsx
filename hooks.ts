import { State, Ref } from './types'
import { log, schedule, shallowArrayEqual } from './helper'
import { process } from './render'

export function useState<T extends any>(initial: T) {
  if (!State.context) {
    log('Hooks can only be used inside a JSX component.', 'warning')
  }

  const hookIndex = State.context.current.hooks.length
  // useState is only called during the render when the wipFiber matches the current component where the setState call is made.
  const previousHook = State.context.current.previous?.hooks[hookIndex]
  const hook = { state: previousHook ? previousHook.state : initial } as {
    state: T
    setState: (value: T) => void
  }

  const { context } = State
  const {
    context: { pending, current },
  } = State

  const setState = (value: T) => {
    // Ensure newest version of setState is called.
    // TODO recursively travels through whole chain.
    if (current.hooks[hookIndex] && setState !== current.hooks[hookIndex].setState) {
      return current.hooks[hookIndex].setState(value)
    }

    // NOTE new state will be returned on next render when useState is called again.
    hook.state = value

    if (pending.find((value) => value.previous === current)) {
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
  if (State.context.current.previous) {
    State.context.current.previous.hooks[hookIndex] = hook
  }

  return [hook.state, setState] as const
}

export function useRef<T extends HTMLElement>() {
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
