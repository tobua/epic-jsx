import { create } from 'logua'
import type { Fiber, NestedHtmlElement } from './types'

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

// NOTE unused.
export function getAllFiberSiblings(node: Fiber, result: Fiber[] = []) {
  if (node?.sibling) {
    result.push(node.sibling)
    return getAllFiberSiblings(node.sibling)
  }
  return result
}

export function getComponentRefsFromTree(node: Fiber, result: NestedHtmlElement, flat: boolean, root = true) {
  if (node.type === 'TEXT_ELEMENT' || (!root && typeof node.type === 'function')) {
    return result
  }

  if (node.native) {
    result.push(node.native)
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

export function getComponentRefsFromTreeByTag(node: Fiber, result: HTMLElement[], tagName: keyof HTMLElementTagNameMap, root = true) {
  if (node.type === 'TEXT_ELEMENT' || (!root && typeof node.type === 'function')) {
    return result
  }

  if (node.native && (node.native as HTMLElement).tagName && (node.native as HTMLElement).tagName.toLowerCase() === tagName.toLowerCase()) {
    result.push(node.native as HTMLElement)
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

export function schedule(callback: IdleRequestCallback) {
  if (window.requestIdleCallback) {
    return window.requestIdleCallback(callback)
  }

  // requestIdleCallback polyfill (not supported in Safari)
  // https://github.com/pladaria/requestidlecallback-polyfill
  // See react scheduler for better implementation.
  window.requestIdleCallback =
    window.requestIdleCallback ||
    function idleCallbackPolyfill(
      innerCallback: IdleRequestCallback,
      // biome-ignore lint/correctness/noUnusedVariables: Default API, might be needed.
      options?: IdleRequestOptions,
    ) {
      const start = Date.now()
      setTimeout(() => {
        innerCallback({
          didTimeout: false,
          timeRemaining() {
            return Math.max(0, 50 - (Date.now() - start))
          },
        })
      }, 1)
      return 0
    }

  window.cancelIdleCallback =
    window.cancelIdleCallback ||
    function cancelIdleCallbackPolyfill(id) {
      clearTimeout(id)
    }

  return schedule(callback)
}

export function multipleInstancesWarning() {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  // Ensure plugin is only loaded once from a single source (will not work properly otherwise).
  if (typeof global.__epicJsx !== 'undefined') {
    log('Multiple instances of epic-jsx have been loaded, plugin might not work as expected', 'warning')
  } else {
    global.__epicJsx = true
  }
}
