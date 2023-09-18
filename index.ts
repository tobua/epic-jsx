import { Fiber, Props, Context, Component, JSX } from './types'
import { workLoop } from './render'
import * as React from './jsx'

export * from './jsx'
export * from './hooks'
export { Fiber, Props, Context, Component }

export default React

const roots = new Map<HTMLElement, Context>()

export const getRoot = (container: HTMLElement) => {
  if (!roots.has(container)) return undefined
  const context = roots.get(container)
  // Ensure all work has passed.
  if (context.wipRoot) {
    workLoop({ timeRemaining: () => 10, didTimeout: false }, context)
  }
  return context
}
export const getRoots = () => {
  const contexts = [...roots.values()]
  // Ensure all work has passed.
  contexts.forEach((context) => {
    if (context.wipRoot) {
      workLoop({ timeRemaining: () => 10, didTimeout: false }, context)
    }
  })
  return contexts
}

export const unmount = (container: HTMLElement) => {
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  const root = getRoot(container)

  root.nextUnitOfWork = undefined
  root.currentRoot = undefined
  root.wipRoot = undefined
  root.deletions = undefined
  root.wipFiber = undefined
  root.hookIndex = undefined
}

export const unmountAll = () => roots.forEach((_, container) => unmount(container))

export function render(element: JSX, container?: HTMLElement | null) {
  if (!container) {
    // eslint-disable-next-line no-param-reassign
    container = document.body // Default assignment in args wouldn't override null.
  }

  if (roots.has(container)) {
    const { wipRoot, currentRoot } = roots.get(container)
    unmount(wipRoot?.dom ?? currentRoot?.dom)
  }

  const context = {
    nextUnitOfWork: undefined,
    currentRoot: undefined,
    wipRoot: undefined,
    deletions: undefined,
    wipFiber: undefined,
    hookIndex: undefined,
    dependencies: new Map<Function, any[]>(),
  }

  roots.set(container, context)

  context.wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    previous: context.currentRoot,
    unmount: () => unmount(container),
  }
  context.deletions = []
  context.nextUnitOfWork = context.wipRoot

  requestIdleCallback((deadline) => workLoop(deadline, context))

  return context
}
