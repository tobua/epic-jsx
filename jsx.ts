import type { JSX, Props, Type } from './types'

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
export const jsxDEV = createElement
export const jsx = createElement
export const jsxs = createElement
