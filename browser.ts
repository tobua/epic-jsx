import { svgTagNames } from 'svg-tag-names'
import { Change, Fiber, Props } from './types'

const sizeStyleProperties = [
  'width',
  'height',
  'border',
  'margin',
  'padding',
  'top',
  'right',
  'bottom',
  'left',
  'gap',
  'rowGap',
  'columnGap',
]

function startsWithSizeProperty(propertyName: string) {
  return sizeStyleProperties.some((prop) => propertyName.startsWith(prop))
}

function convertStylesToPixels(styleObject: CSSStyleDeclaration) {
  const convertedStyles = {}
  for (const key in styleObject) {
    if (styleObject.hasOwnProperty(key)) {
      const value = styleObject[key]
      if (typeof value === 'number' && startsWithSizeProperty(key)) {
        convertedStyles[key] = `${value}px`
      } else {
        convertedStyles[key] = value
      }
    }
  }
  return convertedStyles
}

const isEvent = (key: string) => key.startsWith('on')
const isProperty = (key: string) => key !== 'children' && !isEvent(key)
const isNew = (prev: Props, next: Props) => (key: string) => prev[key] !== next[key]
const isGone = (_: Props, next: Props) => (key: string) => !(key in next)

function updateNativeElement(
  element: HTMLElement | Text,
  prevProps: Props = {},
  nextProps: Props = {}
) {
  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      element.removeEventListener(eventType, prevProps[name])
    })

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      element[name] = ''
    })

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      if (name === 'ref') {
        nextProps[name].current = element
        return
      }
      if (typeof (element as HTMLElement).setAttribute === 'function') {
        if (name === 'style') {
          Object.assign((element as HTMLElement).style, convertStylesToPixels(nextProps[name]))
        } else {
          ;(element as HTMLElement).setAttribute(name, nextProps[name])
        }
      } else {
        element[name] = nextProps[name]
      }
    })

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      element.addEventListener(eventType, nextProps[name])
    })
}

export function createNativeElement(fiber: Fiber) {
  if (!fiber.type) return undefined // Ignore fragments.

  let element: HTMLElement | Text

  if (fiber.type === 'TEXT_ELEMENT') {
    element = document.createTextNode('')
  } else if (svgTagNames.includes(fiber.type as any)) {
    // Necessary to properly render SVG elements, createElement will not work.
    element = document.createElementNS('http://www.w3.org/2000/svg', fiber.type as any)
  } else {
    element = document.createElement(fiber.type as any)
  }

  updateNativeElement(element, {}, fiber.props)

  return element
}

function commitDeletion(fiber: Fiber, nativeParent: HTMLElement | Text) {
  if (fiber.native) {
    nativeParent.removeChild(fiber.native)
  } else {
    commitDeletion(fiber.child, nativeParent)
  }
}

export function commitFiber(fiber: Fiber) {
  if (!fiber) {
    return
  }

  let parent = fiber.parent
  let maxTries = 500
  while (!parent.native && parent.parent && maxTries > 0) {
    maxTries -= 1
    parent = parent.parent
  }
  if (maxTries === 0) {
    console.error('Ran out of tries at commitWork.')
  }

  if (fiber.change === Change.add && fiber.native) {
    parent.native.appendChild(fiber.native)
  } else if (fiber.change === Change.update && fiber.native) {
    updateNativeElement(fiber.native, fiber.previous.props, fiber.props)
  } else if (fiber.change === Change.delete) {
    commitDeletion(fiber, parent.native)
  }

  if (fiber.afterListeners) {
    fiber.afterListeners.forEach((callback) => callback.call(fiber.component))
    fiber.afterListeners = []
  }

  commitFiber(fiber.child)
  commitFiber(fiber.sibling)
}
