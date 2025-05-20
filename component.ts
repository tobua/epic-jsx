import { createRef, log } from './helper'
import { Change, type Component, type Context, type Fiber, type Plugin } from './types'
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

function printProps(props: { children?: any }) {
  if (typeof props !== 'object') {
    return ''
  }

  const { children, ...filtered } = props

  if (Object.keys(filtered).length === 0) {
    return ''
  }

  return ` ${JSON.stringify(filtered)}`
}

const printFiber = (fiber: Fiber) => {
  const type = fiber.type

  if (type === 'TEXT_ELEMENT') {
    return `"${fiber.props.nodeValue}"`
  }

  return `${typeof type === 'function' ? type.name : type}${printProps(fiber.props)}`
}

export function addFiber(current: Fiber, element: React.JSX.Element, previous: Fiber | undefined): Fiber {
  const fiber = {
    type: element.type,
    props: element.props,
    native: undefined,
    parent: current,
    previous: undefined,
    hooks: typeof element.type === 'function' ? (previous ? previous.hooks : []) : undefined,
    svg: current.svg || element.type === 'svg',
    change: Change.Add,
    print() {
      return printFiber(fiber)
    },
  }
  return fiber
}

export function updateFiber(current: Fiber, previous: Fiber, element?: React.JSX.Element): Fiber {
  const fiber = {
    type: previous.type,
    props: element?.props,
    native: previous.native,
    parent: current,
    previous,
    hooks: previous.hooks,
    svg: previous.svg || previous.type === 'svg',
    change: Change.Update,
    print() {
      return printFiber(fiber)
    },
  }
  return fiber
}

export function createRerenderRoot(current: Fiber): Fiber {
  const fiber = {
    native: current.native, // TODO components never have native elements, make optional.
    props: current.props,
    type: current.type,
    hooks: [],
    previous: current,
    parent: current.parent,
    print() {
      return printFiber(fiber)
    },
  }
  return fiber
}

export function createRoot(container: HTMLElement, element: React.JSX.Element, unmount: (container: HTMLElement) => void): Fiber {
  const fiber = {
    native: container,
    props: {
      children: [element],
    },
    previous: undefined,
    unmount: () => unmount(container),
    print() {
      return `Root <${container.tagName.toLowerCase()}>`
    },
  }
  return fiber
}
