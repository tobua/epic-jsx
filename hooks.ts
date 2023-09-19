import { State, Ref } from './types'
import { log, shallowArrayEqual } from './helper'

export function useState<T extends any>(initial: T) {
  if (!State.context) {
    log('Hooks can only be used inside a JSX component.', 'warning')
  }

  // useState is only called during the render when the wipFiber matches the current component where the setState call is made.
  const previousHook = State.context.wipFiber.previous?.hooks[State.context.wipFiber.hooks.length]
  const hook = { state: previousHook ? previousHook.state : initial } as { state: T }

  const { context } = State

  const setState = (value: T) => {
    // NOTE new state will be returned on next render when useState is called again.
    hook.state = value
    context.wipRoot = {
      dom: context.currentRoot.dom,
      props: context.currentRoot.props,
      previous: context.currentRoot,
    }
    context.nextUnitOfWork = context.wipRoot
    context.deletions = []
  }

  State.context.wipFiber.hooks.push(hook)

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
