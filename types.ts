import type { JSX } from './types/index'

declare global {
  // Avoids loading plugin multiple times in development mode.
  var __epicJsx: boolean
}

export type Action = (value: any) => any

// TODO unused
export interface Hook {
  state: any
  queue: Action[]
}

export enum Change {
  Update = 0,
  Add = 1,
  Delete = 2,
}

export type Props = { [key: string]: any }
// biome-ignore lint/correctness/noUnusedVariables: Not yet specified.
export type ComponentPropsWithoutRef<T = 'div'> = { [key: string]: any }

export type Type = keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap | Function | 'TEXT_ELEMENT' | undefined // undefined if Fragment

// JSX.IntrinsicElements includes list of all React tags with their respecitive props available.

export interface Fiber {
  id?: number
  type?: Type
  child?: Fiber
  sibling?: Fiber
  parent?: Fiber
  native?: HTMLElement | Text
  props: Props
  hooks?: any[]
  component?: Component
  previous?: Fiber
  change?: Change
  unmount?: () => void
  svg?: boolean
  print: () => string
}

export interface Context {
  pending: Fiber[] // Roots of trees to be rendered.
  rendered: Fiber[] // Roots of rendered and reconciled trees to be committed.
  root?: Fiber // Root fully committed to the view engine.
  deletions: Fiber[]
  current?: Fiber
  dependencies: Map<Function, any[]>
  afterListeners: Function[]
}

export type Ref = { tag: keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap; native: HTMLElement }
export type Refs<R extends string> = {
  byTag: (tag: keyof HTMLElementTagNameMap | keyof SVGElementTagNameMap) => Ref[]
  addRef: (id: string, ref: Ref) => void
  clear: () => void
  hasRef: (id: string) => boolean
  size: number
} & Record<R, Ref>
export type NestedHtmlElement = Array<HTMLElement | Text | NestedHtmlElement>

export interface Component<T extends object | undefined = undefined, R extends string = never> {
  id: number
  root: Fiber
  context: Context
  rerender: () => void
  each: (callback: (this: Component<T>) => void) => void
  /** @deprecated Use `once` or `each` instead. */
  after: (callback: (this: Component<T>) => void) => void
  once: (callback: (this: Component<T>) => void) => void
  ref: Refs<R>
  plugin: (plugins: Plugin[]) => void
  state: T
  print: () => string
}

export type Plugin = false | '' | JSX.Element

export interface LegacyRef<T> {
  readonly current: T | null
}

// Slightly simpler variant I often use.
export type CssProperties = { [Key in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[Key] extends string ? string | number : never }
