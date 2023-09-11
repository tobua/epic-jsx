import { State, Ref } from './types'
import { log, shallowArrayEqual } from './helper'

export function useState<T extends any>(initial: T) {
  if (!State.context) {
    log('Hooks can only be used inside a React component.', 'warning')
  }

  const oldHook =
    State.context.wipFiber.previous &&
    State.context.wipFiber.previous.hooks &&
    State.context.wipFiber.previous.hooks[State.context.hookIndex]
  const hook = {
    state: oldHook ? oldHook.state : initial,
  } as { state: T }

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
  State.context.hookIndex += 1
  return [hook.state, setState] as const
}

export function useRef<T extends HTMLElement>() {
  return { current: undefined } as Ref<T>
}

export function useEffect(callback: () => void, dependencies: any[] = []) {
  if (!State.context) {
    log('Hooks can only be used inside a React component.', 'warning')
  }

  const previousDependencies = State.context.dependencies.get(callback)

  if (!previousDependencies || !shallowArrayEqual(dependencies, previousDependencies)) {
    State.effects.push(callback)
  }

  State.context.dependencies.set(callback, dependencies)
}
