import { Change, Fiber, Props } from './types'

const isEvent = (key: string) => key.startsWith('on')
const isProperty = (key: string) => key !== 'children' && !isEvent(key)
const isNew = (prev: Props, next: Props) => (key: string) => prev[key] !== next[key]
const isGone = (_: Props, next: Props) => (key: string) => !(key in next)
function updateDom(dom: HTMLElement, prevProps: Props = {}, nextProps: Props = {}) {
  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.removeEventListener(eventType, prevProps[name])
    })

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = ''
    })

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      if (name === 'ref') {
        nextProps[name].current = dom
        return
      }
      if (dom.setAttribute) {
        if (name === 'style') {
          Object.assign(dom.style, nextProps[name])
        } else {
          dom.setAttribute(name, nextProps[name])
        }
      } else {
        dom[name] = nextProps[name]
      }
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, nextProps[name])
    })
}

export function createDom(fiber: Fiber): HTMLElement {
  if (!fiber.type) return undefined // Ignore fragments.

  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type as any)

  updateDom(dom, {}, fiber.props)

  return dom
}

function commitDeletion(fiber: Fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom)
  } else {
    commitDeletion(fiber.child, domParent)
  }
}

export function commitWork(fiber: Fiber) {
  if (!fiber) {
    return
  }

  let domParentFiber = fiber.parent
  let maxTries = 100
  while (!domParentFiber.dom && maxTries > 0) {
    maxTries -= 1
    domParentFiber = domParentFiber.parent
  }
  if (maxTries === 0) {
    console.error('Ran out of tries at commitWork.')
  }
  const domParent = domParentFiber.dom

  if (fiber.change === Change.add && fiber.dom) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.change === Change.update && fiber.dom) {
    updateDom(fiber.dom, fiber.previous.props, fiber.props)
  } else if (fiber.change === Change.delete) {
    commitDeletion(fiber, domParent)
  }

  if (fiber.afterListeners) {
    fiber.afterListeners.forEach((callback) => callback.call(fiber.component))
    fiber.afterListeners = []
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}
