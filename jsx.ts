import type { CreateElementPlugin, Props, Type } from './types'
import type React from './types/index'
import type { jsxDEV as jsxDevType } from './types/jsx-dev-runtime'
import type { jsxs as jsxsType, jsx as jsxType } from './types/jsx-runtime'

const createElementPlugins: CreateElementPlugin[] = []

export function addCreateElementPlugin(plugin: CreateElementPlugin) {
  if (typeof plugin !== 'function') {
    throw new Error('Plugin must be a function')
  }
  createElementPlugins.push(plugin)
}

export function resetCreateElementPlugins() {
  createElementPlugins.length = 0
}

function createTextElement(text: string) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: typeof text === 'boolean' ? '' : text,
      children: [],
    },
  }
}

// Official signature (not working yet).
// createElement<P>(type: React.ElementType<P>, props: P & { children?: React.ReactNode }, ...children: React.ReactNode[]): React.ReactElement<P> | null;
export function createElement(type: Type, props: Props, ...children: React.JSX.Element[]) {
  for (const plugin of createElementPlugins) {
    plugin(type, props, children)
  }
  let mappedChildren = children
  // NOTE needed for browser JSX runtime
  // NOTE existence check, not truthiness: a falsy-but-valid single child (e.g. 0) must still count.
  if (props?.children !== undefined) {
    mappedChildren = Array.isArray(props.children) ? props.children : [props.children]
    props.children = undefined
  }

  // Required for successful rendering with markdown-to-jsx.
  if (Array.isArray(children[0]) && children[0].length === 1 && typeof children[0][0] === 'string') {
    mappedChildren = children[0]
  } else if (Array.isArray(children[0]) && children[0].length > 1) {
    mappedChildren = children[0]
  }

  return {
    type,
    props: {
      ...props,
      children: mappedChildren
        // Clear out falsy values.
        .filter(
          // @ts-ignore
          (item) => item !== undefined && item !== null && item !== false && item !== '',
        )
        // Add text elements.
        .map((child) => (typeof child === 'object' ? child : createTextElement(child))),
    },
  }
}

// JSX environment specific runtime aliases.
// biome-ignore lint/style/useNamingConvention: React default for compatibility.
export const jsxDEV = createElement as unknown as typeof jsxDevType
export const jsx = createElement as unknown as typeof jsxType
export const jsxs = createElement as unknown as typeof jsxsType
// Should be compatible with React.cloneElement.
export function cloneElement(element: React.JSX.Element, props?: Partial<any>, ...children: React.ReactNode[]) {
  const newProps = {
    ...element.props,
    ...props,
    children: children.length > 0 ? children : element.props.children,
  }

  return {
    ...element,
    props: newProps,
  }
}
