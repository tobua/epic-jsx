import { Renderer } from '.'
import { log, schedule, shallowArrayEqual } from './helper'
import { process } from './render'
import type { Ref } from './types'

export function useState<T>(initial: T) {
  if (!Renderer.context) {
    log('Hooks can only be used inside a JSX component.', 'warning')
  }

  const hookIndex = Renderer.context?.current?.hooks?.length as number

  const { context } = Renderer

  if (!context) {
    return
  }

  const { pending, current } = context

  if (!current) {
    return
  }

  const hooks = current.previous?.hooks ?? []

  // useState is only called during the render when the wipFiber matches the current component where the setState call is made.
  const previousHook = hooks[hookIndex]
  const hook = { state: previousHook ? previousHook.state : initial } as {
    state: T
    setState: (value: T) => void
  }

  const setState = (value: T) => {
    const hook = current.hooks?.[hookIndex]
    // Ensure newest version of setState is called.
    // TODO recursively travels through whole chain.
    if (hook && setState !== hook.setState) {
      hook.setState(value)
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
  current.hooks?.push(hook)
  // Also update previous hooks to get the most recent one from old scopes.
  const previous = Renderer.context?.current?.previous
  if (previous?.hooks) {
    previous.hooks[hookIndex] = hook
  }

  return [hook.state, setState] as const
}

export function useRef<T extends HTMLElement>() {
  return { current: undefined } as unknown as Ref<T>
}

export function useEffect(callback: () => void, dependencies: any[] = []) {
  if (!Renderer.context) {
    log('Hooks can only be used inside a JSX component.', 'warning')
  }

  const currentDependencies = Renderer.context?.dependencies
  const previousDependencies = currentDependencies?.get(callback)

  if (!(previousDependencies && shallowArrayEqual(dependencies, previousDependencies))) {
    Renderer.effects.push(callback)
  }

  currentDependencies?.set(callback, dependencies)
}

export function useCallback<T extends (...args: any) => any>(callback: T, _dependencies: any[] = []) {
  return callback
}

export function useMemo<T>(method: () => T, _dependencies: any[] = []) {
  return method()
}
