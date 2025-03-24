import { Renderer } from '.'
import { createRerenderRoot } from './component'
import { log, schedule, shallowArrayEqual } from './helper'
import { process } from './render'
import type { LegacyRef } from './types'

export function useState<T>(initial: T) {
  if (!Renderer.context) {
    log('Hooks can only be used inside a JSX component.', 'warning')
  }

  const hookIndex = Renderer.context?.current?.hooks?.length as number

  const { context } = Renderer

  if (!context) {
    log('useState used outside component', 'warning')
    return []
  }

  const { pending, current } = context

  if (!current) {
    log('useState used outside component', 'warning')
    return []
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

    pending.push(createRerenderRoot(current))

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
  return { current: undefined } as unknown as LegacyRef<T>
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

export function useDeferredValue<T>(value: T) {
  return value
}

declare const UNDEFINED_VOID_ONLY: unique symbol
// biome-ignore lint/suspicious/noConfusingVoidType: Official react types.
type VoidOrUndefinedOnly = void | { [UNDEFINED_VOID_ONLY]: never }
export type TransitionFunction = () => VoidOrUndefinedOnly | Promise<VoidOrUndefinedOnly>

export function useTransition() {
  const [isPending, setPending] = useState(false)

  const startTransition = (callback: TransitionFunction) => {
    setPending(true)
    setTimeout(() => {
      callback()
      setPending(false)
    }, 100)
  }

  return [isPending, startTransition] as const
}
