import { getRoot } from '../index'
import { Fiber, Props, Type } from '../types'

export const serializeDocumentNode = (node: Element = document.body) => {
  const serializer = new XMLSerializer()
  return serializer.serializeToString(node)
}

export const unmount = () => {
  const root = getRoot()

  if (root && root.unmount) {
    root.unmount()
  }
}

type ReadableNode = {
  tag?: Type
  getElement?: () => Element
  props?: Props
  child?: ReadableNode
}

export const readableTree = (root: Fiber) => {
  const result: ReadableNode = {}

  if (root.props) {
    result.props = root.props
  }

  if (root.child) {
    result.child = readableTree(root.child)
  }

  if (root.dom) {
    result.tag = root?.dom.tagName?.toLowerCase() as keyof HTMLElementTagNameMap
  }

  if (root.dom) {
    result.getElement = () => root?.dom
  }
  return result
}
