import { render as baseRender } from 'epic-jsx'
import { Fiber, Props, Type, JSX } from './types'

export const serializeElement = (node: Element = document.body) => {
  const serializer = new XMLSerializer()
  return serializer.serializeToString(node)
}

type ReadableNode = {
  tag?: Type
  getElement: () => Element
  props?: Props
  children: ReadableNode[]
}

const getProps = (node: Fiber) => {
  const { children, ...props } = node?.props ?? {} // This ensures that props is copied and children remains on original.
  return props
}

const getTag = (node: Fiber) => {
  const htmlTag = node?.native?.tagName?.toLowerCase() as keyof HTMLElementTagNameMap

  if (htmlTag) {
    return htmlTag
  }

  if (typeof node?.type === 'function') {
    return node.type
  }

  return undefined
}

export const toReadableTree = (node: Fiber) => {
  const result: ReadableNode = {
    children: [],
    getElement: () => node?.native,
    tag: getTag(node),
    props: getProps(node),
  }

  let currentChild = node?.child

  while (currentChild) {
    result.children.push(toReadableTree(currentChild))
    currentChild = currentChild.sibling
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
  element: JSX,
  { container, skipRun = false }: { container?: HTMLElement | null; skipRun?: boolean } = {}
) {
  const context = baseRender(element, container)
  if (!skipRun) {
    run() // requestIdleCallback
  }
  // NOTE make sure to not destruct context before run(), context not useful for user.
  return {
    root: context.root,
    tree: toReadableTree(context.root),
    serialized: serializeElement(),
  }
}
