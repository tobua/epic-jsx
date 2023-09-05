import { create } from 'logua'
import { Fiber } from './types'

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

export function getComponentRefsFromTree(node: Fiber, result = [], root = true) {
  if (node.type === 'TEXT_ELEMENT' || (!root && typeof node.type === 'function')) {
    return result
  }

  if (node.dom) {
    result.push(node.dom)
  }

  // !root to ignore siblings of the component itself.
  if (!root && node.sibling) {
    getComponentRefsFromTree(node.sibling, result, false)
  }

  if (node.child) {
    getComponentRefsFromTree(node.child, result, false)
  }

  return result
}
