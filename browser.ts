import { convertSvgPropsToDashCase, log, possibleStandardNames, sizeStyleProperties } from './helper'
import { Change, type Component, type CssProperties, type Fiber, type Props } from './types'

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

function getPropertyValue(property: string, value: string) {
  // Write disabled="disabled", as boolean not supported.
  if (['disabled', 'checked'].includes(property)) {
    return value ? property : undefined
  }

  return value
}

const isEvent = (key: string) => key.startsWith('on')
const isProperty = (key: string) => key !== 'children' && !isEvent(key)
const isNew = (prev: Props, next: Props) => (key: string) => prev[key] !== next[key]
const isGone = (_: Props, next: Props) => (key: string) => !(key in next)
// Listeners on new props might not have reference equality, so they need to be stored on assignment.
const eventListeners = new Map<HTMLElement | Text, Map<string, EventListenerOrEventListenerObject>>()

function updateNativeElement(element: HTMLElement | Text, previousProps: Props = {}, nextProps: Props = {}) {
  // Remove old or changed event listeners
  // biome-ignore lint/complexity/noForEach: Chained expression.
  Object.keys(previousProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(previousProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2) // Remove the "on" from onClick.
      const previousHandler = eventListeners.get(element)?.get(eventType)
      if (previousHandler) {
        element.removeEventListener(eventType, previousHandler)
      }
    })

  // Remove old properties
  // biome-ignore lint/complexity/noForEach: Chained expression.
  Object.keys(previousProps)
    .filter(isProperty)
    .filter(isGone(previousProps, nextProps))
    .forEach((name) => {
      // @ts-ignore Filtered for valid properties, maybe more checks necessary.
      element[name] = ''
    })

  // Set new or changed properties
  // biome-ignore lint/complexity/noForEach: Chained expression.
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(previousProps, nextProps))
    .forEach((name) => {
      if (name === 'ref' && typeof nextProps[name] === 'object') {
        nextProps[name].current = element
        return
      }
      if (name === 'ref' && typeof nextProps[name] === 'string') {
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
          const value = getPropertyValue(name, nextProps[name])
          if (value !== undefined && (name.toLowerCase() in possibleStandardNames || name.startsWith('aria-'))) {
            ;(element as HTMLElement).setAttribute(name, value)
          }
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
    .filter(isNew(previousProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      element.addEventListener(eventType, nextProps[name])
      if (!eventListeners.has(element)) {
        eventListeners.set(element, new Map())
      }
      eventListeners.get(element)?.set(eventType, nextProps[name])
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

function addRefs(fiber: Fiber, component?: Component) {
  // Add refs to component.
  if (fiber.props?.id && fiber.native && component) {
    component.ref.addRef(fiber.props.id, {
      tag: (fiber.native as HTMLElement).tagName.toLowerCase() as any,
      native: fiber.native as HTMLElement,
    })
  }

  if (fiber.props?.ref && fiber.native && component) {
    component.ref.addRef(fiber.props.ref, {
      tag: (fiber.native as HTMLElement).tagName.toLowerCase() as any,
      native: fiber.native as HTMLElement,
    })
  }
}

function findNativeParent(fiber: Fiber): Fiber | undefined {
  let parent = fiber.parent
  let maxTries = 500
  while (!parent?.native && parent?.parent && maxTries > 0) {
    maxTries -= 1
    parent = parent.parent
  }
  if (maxTries === 0) {
    log('Ran out of tries finding native parent.', 'warning')
  }
  return parent
}

export function createNativeElement(fiber: Fiber) {
  if (!fiber.type) {
    return undefined // Ignore fragments.
  }

  mapLegacyProps(fiber)

  let element: HTMLElement | Text

  if (fiber.type === 'TEXT_ELEMENT') {
    element = document.createTextNode('')
  } else if (fiber.svg) {
    convertSvgPropsToDashCase(fiber.props)
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
      if (nativeParent.isConnected && fiber.native.isConnected) {
        nativeParent.removeChild(fiber.native)
      } else if (fiber.native.isConnected) {
        log("Trying to remove a node from a parent that's no longer in the DOM", 'warning')
      } else {
        log("Trying to remove a node that's no longer in the DOM", 'warning')
      }
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

export function commitFiber(fiber: Fiber, currentComponent?: Component) {
  if (!fiber) {
    return
  }

  if (fiber.component?.root) {
    // biome-ignore lint/style/noParameterAssign: Much easier in this case.
    currentComponent = fiber.component?.root.component
  }

  const parent = findNativeParent(fiber)

  if (fiber.change === Change.Add && fiber.native) {
    parent?.native?.appendChild(fiber.native)
  } else if (fiber.change === Change.Update && fiber.native) {
    updateNativeElement(fiber.native, fiber.previous?.props, fiber.props)
  } else if (fiber.change === Change.Delete && parent) {
    if (fiber.native && eventListeners.has(fiber.native)) {
      eventListeners.delete(fiber.native) // Clean up event listener tracking.
    }
    if (parent.native) {
      commitDeletion(fiber, parent.native)
    }
  }

  addRefs(fiber, currentComponent)

  if (fiber.child) {
    commitFiber(fiber.child, currentComponent)
  }
  if (fiber.sibling) {
    commitFiber(fiber.sibling, currentComponent)
  }
}
