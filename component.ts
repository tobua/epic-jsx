import { createRef, log } from './helper'
import { Change, type Component, type Context, Fiber, type Plugin } from './types'
import type React from './types/index'

function rerender(context: Context, fiber: Fiber) {
  fiber.sibling = undefined
  fiber.previous = fiber
  context.pending.push(fiber)
}

export function createComponent({ fiber, context }: { fiber: Fiber; context: Context }) {
  const isFirstRender = !fiber.id

  // TODO id in fiber shouldn't be optional, assign during creation.
  if (!fiber.id) {
    fiber.id = fiber.previous?.id ?? Math.floor(Math.random() * 1000000)
  }

  const data = {
    component: {
      id: fiber.id,
      root: fiber,
      context,
      rerender: () => rerender(context, fiber),
      // TODO implement and test ref clearing on rerenders.
      ref: createRef(),
      each(callback: () => void) {
        context.afterListeners.push(() => callback.call(fiber.component))
      },
      once(callback: () => void) {
        if (isFirstRender) {
          context.afterListeners.push(() => callback.call(fiber.component))
        }
      },
      after(callback: () => void) {
        log('this.after() lifecycle is deprecated, use this.once() or this.each()', 'warning')
        if (isFirstRender) {
          context.afterListeners.push(() => callback.call(fiber.component))
        }
      },
      end(callback: () => void) {
        fiber.endListener = () => callback.call(fiber.component)
      },
      plugin(plugins: Plugin[]) {
        for (const plugin of plugins) {
          if (plugin) {
            data.pluginResult = plugin
            throw new Error('plugin') // early-return approach.
          }
        }
      },
      state: undefined,
      print() {
        const type = String(typeof fiber.type === 'function' ? fiber.type.name : fiber.type)
        return `${type} #${fiber.id}`
      },
    } as Component,
    pluginResult: undefined as React.JSX.Element | undefined,
  }
  return data
}

export function addFiber(current: Fiber, element: React.JSX.Element, previous: Fiber | undefined): Fiber {
  return new Fiber({
    props: element.props,
    type: element.type,
    parent: current,
    hooks: typeof element.type === 'function' ? (previous ? previous.hooks : []) : undefined,
    svg: current.svg || element.type === 'svg',
    change: Change.Add,
  })
}

export function updateFiber(current: Fiber, previous: Fiber, element?: React.JSX.Element): Fiber {
  return new Fiber({
    props: element?.props,
    type: previous.type,
    native: previous.native,
    parent: current,
    hooks: previous.hooks,
    previous,
    svg: previous.svg || previous.type === 'svg',
    change: Change.Update,
  })
}

export function createRerenderRoot(current: Fiber): Fiber {
  return new Fiber({
    props: current.props,
    type: current.type,
    native: current.native, // TODO components never have native elements, make optional.
    parent: current.parent,
    hooks: [],
    previous: current,
  })
}

export function createRoot(container: HTMLElement, element: React.JSX.Element, unmount: (container: HTMLElement) => void): Fiber {
  return new Fiber({
    props: { children: [element] },
    native: container,
    unmount: () => unmount(container),
    print: function (this: Fiber): string {
      return `Root <${container.tagName.toLowerCase()}>`
    },
  })
}
