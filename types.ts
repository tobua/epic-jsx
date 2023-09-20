export const State: { context: Context | null; effects: Function[] } = {
  context: null,
  effects: [],
}

export type Action = (value: any) => any

export interface Hook {
  state: any
  queue: Action[]
}

export enum Change {
  update,
  add,
  delete,
}

export type Props = { [key: string]: any }

export type Type = keyof HTMLElementTagNameMap | Function | 'TEXT_ELEMENT' | undefined // undefined if Fragment

// JSX.IntrinsicElements includes list of all React tags with their respecitive props available.

export interface Fiber {
  type?: Type
  child?: Fiber
  sibling?: Fiber
  parent?: Fiber
  native: HTMLElement
  props: Props
  hooks?: any[]
  afterListeners?: Function[]
  component?: Component
  previous?: Fiber
  change?: Change
  unmount?: () => void
}

export interface Context {
  pending: Fiber[] // Roots of trees to be rendered.
  rendered: Fiber[] // Roots of rendered and reconciled trees to be committed.
  root?: Fiber // Root fully committed to the view engine.
  deletions: Fiber[]
  current: Fiber
  dependencies: Map<Function, any[]>
}

export type NestedHTMLElement = Array<HTMLElement | NestedHTMLElement>

export interface Component {
  id: string
  root: Fiber
  context: Context
  rerender: () => void
  after: (callback: () => void) => void
  refs: HTMLElement[]
  refsNested: NestedHTMLElement
  refsByTag: (tag: keyof HTMLElementTagNameMap) => HTMLElement[]
}

export interface Ref<T> {
  readonly current: T | null
}

// Extracted from @types/react JSX.Element
// Removed support for class based components.
type Key = string | number | bigint

interface ReactPortal extends ReactElement {
  key: Key | null
  children: ReactNode
}

type ReactNode =
  | ReactElement
  | string
  | number
  | Iterable<ReactNode>
  | boolean
  | null
  | undefined
  // Portal support unlikely any time soon.
  | ReactPortal

type JSXElementConstructor<P> = (props: P) => ReactNode

interface ReactElement<
  P = any,
  T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>,
> {
  type: T
  props: P
  key: Key | null
}

export interface JSX extends ReactElement<any, any> {}
