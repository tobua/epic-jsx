import { type Fiber, type Props, type Context, type Component, type JSX, Renderer } from './types'
import { process } from './render'
import * as React from './jsx'
import { log, schedule } from './helper'

export * from './jsx'
export * from './hooks'
export { Fiber, Props, Context, Component, Renderer }

export default React

const roots = new Map<HTMLElement, Context>()

// Imported by regular React runtime, implementation is guess.
export const Fragment = undefined // Symbol.for('react.fragment')

export const getRoot = (container: HTMLElement) => {
  if (!roots.has(container)) return undefined
  const context = roots.get(container)
  // Ensure all work has passed.
  if (context.pending.length || context.rendered.length) {
    process({ timeRemaining: () => 10, didTimeout: false }, context)
  }
  return context
}

export const getRoots = () => {
  const contexts = [...roots.values()]
  // Ensure all work has passed.
  contexts.forEach((context) => {
    if (context.pending.length || context.rendered.length) {
      process({ timeRemaining: () => 10, didTimeout: false }, context)
    }
  })
  return contexts
}

export const unmount = (container: HTMLElement) => {
  if (!container) {
    log('Trying to unmount empty container', 'warning')
    return
  }

  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  const context = getRoot(container)

  context.root = undefined
  context.deletions = []
  context.current = undefined
  context.dependencies = new Map<Function, any[]>()
  context.pending = []
  context.rendered = []

  roots.delete(container)
}

export const unmountAll = () => roots.forEach((_, container) => unmount(container))

export function render(element: JSX, container?: HTMLElement | null) {
  if (!container) {
    // eslint-disable-next-line no-param-reassign
    container = document.body // Default assignment in args wouldn't override null.
  }

  if (roots.has(container)) {
    unmount(container)
  }

  const root = {
    native: container,
    props: {
      children: [element],
    },
    previous: undefined,
    unmount: () => unmount(container),
  }

  const context: Context = {
    root,
    deletions: [],
    current: undefined,
    dependencies: new Map<Function, any[]>(),
    pending: [root],
    rendered: [],
  }

  roots.set(container, context)

  context.deletions = []

  schedule((deadline) => process(deadline, context))

  return context
}
