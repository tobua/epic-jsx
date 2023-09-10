import { create } from 'logua'
import { Fiber, NestedHTMLElement } from './types'

export const log = create('epic-jsx', 'blue')

export function shallowArrayEqual(first: any[], second: any[]) {
  if (first.length !== second.length) {
    return false
  }

  for (let index = 0; index < first.length; index += 1) {
    if (first[index] !== second[index]) {
      return false
    }
  }

  return true
}

export function getComponentRefsFromTree(
  node: Fiber,
  result: NestedHTMLElement,
  flat: boolean,
  root = true
) {
  if (node.type === 'TEXT_ELEMENT' || (!root && typeof node.type === 'function')) {
    return result
  }

  if (node.dom) {
    result.push(node.dom)
  }

  if (node.child) {
    const nested = getComponentRefsFromTree(node.child, flat ? result : [], flat, false)

    if (!flat && nested.length) {
      if (result.length > 0) {
        result.push(nested)
      } else {
        result.push(...nested)
      }
    }
  }

  // !root to ignore siblings of the component itself.
  if (!root && node.sibling) {
    getComponentRefsFromTree(node.sibling, result, flat, false)
  }

  return result
}

export function getComponentRefsFromTreeByTag(
  node: Fiber,
  result: HTMLElement[],
  tagName: keyof HTMLElementTagNameMap,
  root = true
) {
  if (node.type === 'TEXT_ELEMENT' || (!root && typeof node.type === 'function')) {
    return result
  }

  if (node.dom && node.dom.tagName.toLowerCase() === tagName.toLowerCase()) {
    result.push(node.dom)
  }

  // !root to ignore siblings of the component itself.
  if (!root && node.sibling) {
    getComponentRefsFromTreeByTag(node.sibling, result, tagName, false)
  }

  if (node.child) {
    getComponentRefsFromTreeByTag(node.child, result, tagName, false)
  }

  return result
}
