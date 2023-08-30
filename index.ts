import { Fiber, Props, Type } from './types'

export { Fiber, Props }

let nextUnitOfWork = null
let currentRoot: Fiber = null
let wipRoot: Fiber = null
let deletions = null
let wipFiber: Fiber = null
let hookIndex = null
let idleCallback = null

// TODO wait until return if still WIP
export const getRoot = () => currentRoot

export const unmount = (container: Element) => {
  while (container.firstChild) {
    container.removeChild(container.firstChild)
  }

  nextUnitOfWork = null
  currentRoot = null
  wipRoot = null
  deletions = null
  wipFiber = null
  hookIndex = null
  idleCallback = null
}

function createTextElement(text: string) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

export function createElement(type: Type, props: Props, ...children: JSX.Element[]) {
  // NOTE needed for browser JSX runtime
  if (props?.children) {
    // eslint-disable-next-line no-param-reassign
    children = Array.isArray(props.children) ? props.children : [props.children]
    delete props.children
  }

  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  }
}

// JSX environment specific runtime aliases.
export const jsxDEV = createElement
export const jsx = createElement
export const jsxs = createElement

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

function createDom(fiber: Fiber): HTMLElement {
  if (!fiber.type) return null // Ignore fragments.

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

function commitWork(fiber: Fiber) {
  if (!fiber) {
    return
  }

  let domParentFiber = fiber.parent
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function commitRoot() {
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function reconcileChildren(currentFiber: Fiber, elements: JSX.Element[] = []) {
  let index = 0
  let oldFiber = currentFiber.alternate && currentFiber.alternate.child
  let prevSibling = null

  while (index < elements.length || oldFiber !== null) {
    const element = elements[index]
    let newFiber = null

    const sameType = oldFiber && element && element.type === oldFiber.type

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: currentFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      }
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: currentFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      }
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION'
      deletions.push(oldFiber)
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (index === 0) {
      currentFiber.child = newFiber
    } else if (element) {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index += 1

    // NOTE added to prevent endless loop after state update to component.
    if (index > elements.length) {
      oldFiber = null
    }
  }
}

function updateFunctionComponent(fiber: Fiber) {
  if (typeof fiber.type !== 'function') return
  wipFiber = fiber
  hookIndex = 0
  wipFiber.hooks = []
  const children = [fiber.type(fiber.props)]
  reconcileChildren(fiber, children)
}

function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }
  reconcileChildren(fiber, fiber.props?.children)
}

function performUnitOfWork(fiber: Fiber) {
  const isFunctionComponent = fiber.type instanceof Function
  if (isFunctionComponent) {
    updateFunctionComponent(fiber)
  } else {
    updateHostComponent(fiber)
  }
  if (fiber.child) return fiber.child
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling
    nextFiber = nextFiber.parent
  }
  return null
}

function workLoop(deadline: IdleDeadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
  }

  if (!idleCallback) {
    idleCallback = requestIdleCallback(workLoop)
  }
}

export function render(element: JSX.Element, container?: HTMLElement | null) {
  if (wipRoot || currentRoot) {
    unmount(wipRoot?.dom ?? currentRoot?.dom)
  }

  wipRoot = {
    dom: container ?? document.body,
    props: {
      children: [element],
    },
    alternate: currentRoot,
    unmount: () => unmount(container ?? document.body),
  }
  deletions = []
  nextUnitOfWork = wipRoot

  if (!idleCallback) {
    idleCallback = requestIdleCallback(workLoop)
  }
}

export function useState<T extends any>(initial: T) {
  const oldHook =
    wipFiber.alternate && wipFiber.alternate.hooks && wipFiber.alternate.hooks[hookIndex]
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  } as { state: T; queue: ((value: T) => T)[] }

  const actions: ((value: T) => T)[] = oldHook ? oldHook.queue : []
  actions.forEach((action) => {
    hook.state = action(hook.state)
  })

  const setState = (action: (value: T) => T) => {
    hook.queue.push(action)
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    }
    nextUnitOfWork = wipRoot
    deletions = []
  }

  wipFiber.hooks.push(hook)
  hookIndex += 1
  return [hook.state, setState] as const
}
