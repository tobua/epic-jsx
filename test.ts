import { render as baseRender, unmount } from './index'
import { processNow } from './render'
import type { Component } from './types'
import type { Fiber, JSX, Props, Type } from './types'

export const serializeElement = (node: Element = document.body) => {
  const serializer = new XMLSerializer()
  const serialized = serializer.serializeToString(node)
  return serialized.replaceAll(/\s+xmlns="[^"]*"/g, '') // Remove newly added XHTML default definition.
}

type ReadableNode = {
  tag?: Type
  getElement: () => HTMLElement | Text | undefined
  getFiber: () => Fiber
  getComponent: () => Component | undefined
  props?: Props
  children: ReadableNode[]
  text?: string
}

const getProps = (node: Fiber) => {
  const { children, ...props } = node?.props ?? {} // This ensures that props is copied and children remains on original.
  return props
}

const getTag = (node: Fiber) => {
  const htmlTag = (node?.native as HTMLElement)?.tagName?.toLowerCase() as keyof HTMLElementTagNameMap

  if (htmlTag) {
    return htmlTag
  }

  if (typeof node?.type === 'function') {
    return node.type
  }

  if (node?.type === 'TEXT_ELEMENT') {
    return node.type
  }

  return undefined
}

export const toReadableTree = (node: Fiber, options = { skipFragments: true }, parent?: ReadableNode) => {
  let result: ReadableNode = {
    children: [],
    getElement: () => node?.native,
    getFiber: () => node,
    getComponent: () => node?.component,
    tag: getTag(node),
    props: getProps(node),
  }

  if (result.tag === 'TEXT_ELEMENT') {
    result.text = result.props?.nodeValue
  }

  let currentChild = node?.child
  let skipped = false

  if (!result.tag && options.skipFragments && parent) {
    result = parent
    skipped = true
  }

  while (currentChild) {
    const nextNode = toReadableTree(currentChild, options, result)
    if (nextNode) {
      result.children.push(nextNode)
    }
    currentChild = currentChild.sibling
  }

  if (!skipped) {
    return result
  }
  return null
}

export let run: Function

// Manually callable polyfill for requestIdleCallback usually not present in testing environments.
if (typeof requestIdleCallback === 'undefined') {
  global.requestIdleCallback = (callback: IdleRequestCallback) => {
    run = () => callback({ timeRemaining: () => 10, didTimeout: false })
    return 1
  }
}

export function render(
  element: JSX,
  { container, skipRun = false, skipFragments = true }: { container?: HTMLElement | null; skipRun?: boolean; skipFragments?: boolean } = {},
) {
  const context = baseRender(element, container)
  if (!skipRun) {
    if (run) {
      run() // requestIdleCallback
    } else {
      processNow(context)
    }
  }
  if (!context.root) {
    return
  }
  // NOTE make sure to not destruct context before run(), context not useful for user.
  return {
    root: context.root,
    tree: toReadableTree(context.root, { skipFragments }) as ReadableNode,
    serialized: serializeElement(),
  }
}

export function clear(container: HTMLElement = document.body) {
  unmount(container)
}
