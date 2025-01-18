import type { JSX, Props, ReactNode, Type } from './types'
import type { jsxDEV as jsxDevType } from './types/jsx-dev-runtime'
import type { jsx as jsxType, jsxs as jsxsType } from './types/jsx-runtime'

function createTextElement(text: string) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: typeof text === 'boolean' ? '' : text,
      children: [],
    },
  }
}

export function createElement(type: Type, props: Props, ...children: JSX[]) {
  // NOTE needed for browser JSX runtime
  if (props?.children) {
    // biome-ignore lint/style/noParameterAssign: Much easier in this case.
    children = Array.isArray(props.children) ? props.children : [props.children]
    props.children = undefined
  }

  return {
    type,
    props: {
      ...props,
      children: children
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
export function cloneElement(element: JSX, props?: Partial<any>, ...children: ReactNode[]) {
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
