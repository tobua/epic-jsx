import { render as baseRender, getRoot } from 'epic-jsx'
import { Fiber, Props, Type } from './types'

export const serializeElement = (node: Element = document.body) => {
  const serializer = new XMLSerializer()
  return serializer.serializeToString(node)
}

type ReadableNode = {
  tag?: Type
  getElement?: () => Element
  props?: Props
  child?: ReadableNode
}

export const toReadableTree = (root: Fiber) => {
  const result: ReadableNode = {}

  if (root.props) {
    result.props = root.props
  }

  if (root.child) {
    result.child = toReadableTree(root.child)
  }

  if (root.dom) {
    result.tag = root?.dom.tagName?.toLowerCase() as keyof HTMLElementTagNameMap
  }

  if (root.dom) {
    result.getElement = () => root?.dom
  }
  return result
}

// eslint-disable-next-line import/no-mutable-exports
export let run: Function

if (typeof requestIdleCallback === 'undefined') {
  global.requestIdleCallback = (callback: IdleRequestCallback) => {
    run = () => callback({ timeRemaining: () => 10, didTimeout: false })
    return 1
  }
}

export function render(
  element: JSX.Element,
  { container, skipRun = false }: { container?: HTMLElement | null; skipRun?: boolean } = {}
) {
  baseRender(element, container)
  if (!skipRun) {
    run() // requestIdleCallback
  }
  const root = getRoot()
  return { root, tree: toReadableTree(root), serialized: serializeElement() }
}
