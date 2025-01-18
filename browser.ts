import { svgTagNames } from 'svg-tag-names'
import { log } from './helper'
import { Change, type CssProperties, type Fiber, type Props } from './types'

const svgAndRegularTags = ['a', 'canvas', 'audio', 'iframe', 'video']

// TODO this is a workaround, better to pass SVG context down the fiber tree as soon as an SVG tag is encountered.
const isSvgTag = (tag: string) => {
  if (!svgTagNames.includes(tag)) {
    return false
  }
  if (svgAndRegularTags.includes(tag)) {
    return false
  }
  return true
}

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
  const convertedStyles: CssProperties = {}
  for (const key in styleObject) {
    if (Object.hasOwn(styleObject, key)) {
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

function updateNativeElement(element: HTMLElement | Text, prevProps: Props = {}, nextProps: Props = {}) {
  // Remove old or changed event listeners
  // biome-ignore lint/complexity/noForEach: Chained expression.
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      element.removeEventListener(eventType, prevProps[name])
    })

  // Remove old properties
  // biome-ignore lint/complexity/noForEach: Chained expression.
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      // @ts-ignore Filtered for valid properties, maybe more checks necessary.
      element[name] = ''
    })

  // Set new or changed properties
  // biome-ignore lint/complexity/noForEach: Chained expression.
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      if (name === 'ref') {
        nextProps[name].current = element
        return
      }
      if (name === 'value') {
        ;(element as HTMLInputElement).value = nextProps[name]
        return
      }
      if (typeof (element as HTMLElement).setAttribute === 'function') {
        if (name === 'style') {
          Object.assign((element as HTMLElement).style, convertStylesToPixels(nextProps[name]))
        } else {
          ;(element as HTMLElement).setAttribute(name, nextProps[name])
        }
      } else {
        // @ts-ignore Filtered for valid properties, maybe more checks necessary.
        element[name] = nextProps[name]
      }
    })

  // Add event listeners
  // biome-ignore lint/complexity/noForEach: Chained expression.
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      element.addEventListener(eventType, nextProps[name])
    })
}

function mapLegacyProps(fiber: Fiber) {
  if (Object.hasOwn(fiber.props, 'className')) {
    if (Object.hasOwn(fiber.props, 'class')) {
      fiber.props.class = `${fiber.props.class} ${fiber.props.className}`
    } else {
      fiber.props.class = fiber.props.className
    }
    fiber.props.className = undefined
  }
}

export function createNativeElement(fiber: Fiber) {
  if (!fiber.type) {
    return undefined // Ignore fragments.
  }

  mapLegacyProps(fiber)

  let element: HTMLElement | Text

  if (fiber.type === 'TEXT_ELEMENT') {
    element = document.createTextNode('')
  } else if (isSvgTag(fiber.type as any)) {
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
    try {
      nativeParent.removeChild(fiber.native)
    } catch (_error) {
      // NOTE indicates a plugin error, should not happen.
      log('Failed to remove node from the DOM', 'warning')
    }
    fiber.change = undefined
  } else if (fiber.child) {
    // Avoid another delete when visiting though siblings.
    fiber.change = undefined
    fiber.child.change = Change.Delete
    commitDeletion(fiber.child, nativeParent)
  }
}

export function commitFiber(fiber: Fiber) {
  if (!fiber) {
    return
  }

  let { parent } = fiber
  let maxTries = 500
  while (!parent?.native && parent?.parent && maxTries > 0) {
    maxTries -= 1
    parent = parent.parent
  }
  if (maxTries === 0) {
    console.error('Ran out of tries at commitWork.')
  }

  if (fiber.change === Change.Add && fiber.native) {
    parent?.native?.appendChild(fiber.native)
  } else if (fiber.change === Change.Update && fiber.native) {
    updateNativeElement(fiber.native, fiber.previous?.props, fiber.props)
  } else if (fiber.change === Change.Delete && parent) {
    if (parent.native) {
      commitDeletion(fiber, parent.native)
    }
  }

  if (fiber.afterListeners) {
    for (const callback of fiber.afterListeners) {
      callback.call(fiber.component)
    }
    fiber.afterListeners = []
  }

  if (fiber.child) {
    commitFiber(fiber.child)
  }
  if (fiber.sibling) {
    commitFiber(fiber.sibling)
  }
}
