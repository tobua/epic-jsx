import { Fiber, Props, Context, Component } from './types'
import { workLoop } from './render'

export * from './jsx'
export { Fiber, Props }

const roots = new Map<HTMLElement, Context>()

// TODO wait until return if still WIP
export const getRoot = (container: HTMLElement) => roots.get(container)
export const getRoots = () => [...roots.values()]

export const unmount = (container: HTMLElement) => {
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  const root = getRoot(container)

  root.nextUnitOfWork = null
  root.currentRoot = null
  root.wipRoot = null
  root.deletions = null
  root.wipFiber = null
  root.hookIndex = null
}

export const unmountAll = () => roots.forEach((_, container) => unmount(container))

export function render(element: JSX.Element, container?: HTMLElement | null) {
  if (!container) {
    // eslint-disable-next-line no-param-reassign
    container = document.body // Default assignment in args wouldn't override null.
  }

  if (roots.has(container)) {
    const { wipRoot, currentRoot } = roots.get(container)
    unmount(wipRoot?.dom ?? currentRoot?.dom)
  }

  const context = {
    nextUnitOfWork: null,
    currentRoot: null,
    wipRoot: null,
    deletions: null,
    wipFiber: null,
    hookIndex: null,
  }

  roots.set(container, context)

  context.wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: context.currentRoot,
    unmount: () => unmount(container),
  }
  context.deletions = []
  context.nextUnitOfWork = context.wipRoot

  requestIdleCallback((deadline) => workLoop(deadline, context))

  return context
}

export function useState<T extends any>(initial: T) {
  const { context } = this as Component

  if (!context) {
    console.log('Warning: Hooks can only be used inside a React component.')
  }

  const oldHook =
    context.wipFiber.alternate &&
    context.wipFiber.alternate.hooks &&
    context.wipFiber.alternate.hooks[context.hookIndex]
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  } as { state: T; queue: ((value: T) => T)[] }

  const actions: ((value: T) => T)[] = oldHook ? oldHook.queue : []
  actions.forEach((action) => {
    hook.state = action(hook.state)
  })

  const setState = (action: (value: T) => T) => {
    hook.queue.push(action)
    context.wipRoot = {
      dom: context.currentRoot.dom,
      props: context.currentRoot.props,
      alternate: context.currentRoot,
    }
    context.nextUnitOfWork = context.wipRoot
    context.deletions = []
  }

  context.wipFiber.hooks.push(hook)
  context.hookIndex += 1
  return [hook.state, setState] as const
}
