import { Props, Type, JSX } from './types'

function createTextElement(text: string) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

export function createElement(type: Type, props: Props, ...children: JSX[]) {
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
