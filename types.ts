import type { Properties } from 'csstype'

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
  afterListeners?: Function[]
  component?: Component
  previous?: Fiber
  change?: Change
  unmount?: () => void
  svg?: boolean
}

export interface Context {
  pending: Fiber[] // Roots of trees to be rendered.
  rendered: Fiber[] // Roots of rendered and reconciled trees to be committed.
  root?: Fiber // Root fully committed to the view engine.
  deletions: Fiber[]
  current?: Fiber
  dependencies: Map<Function, any[]>
}

export type NestedHtmlElement = Array<HTMLElement | Text | NestedHtmlElement>

export interface Component {
  id: number
  root: Fiber
  context: Context
  rerender: () => void
  after: (callback: () => void) => void
  refs: HTMLElement[]
  refsNested: NestedHtmlElement
  refsByTag: (tag: keyof HTMLElementTagNameMap) => HTMLElement[]
}

export interface Ref<T> {
  readonly current: T | null
}

// biome-ignore lint/style/useNamingConvention: React default.
export interface CSSProperties extends Properties<string | number> {
  // Taken from React, allows for compatibility with editor JSX built-ins.
}

// Slightly simpler variant I often use.
export type CssProperties = { [Key in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[Key] extends string ? string | number : never }

// ReactElement declaration from React, compatible with React in Editor.
// Extracted from @types/react JSX.Element
// Class component support required to keep compatibility.
interface ReactPortal extends ReactElement {
  children: ReactNode
}

export type ReactNode = ReactElement | string | number | Iterable<ReactNode> | boolean | null | undefined | ReactPortal // Portal support unlikely any time soon.
// biome-ignore lint/style/useNamingConvention: React default.
interface NewLifecycle<P, S, SS> {
  getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null
  componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void
}
interface DeprecatedLifecycle<P, S> {
  componentWillMount?(): void
  // biome-ignore lint/style/useNamingConvention: React default.
  UNSAFE_componentWillMount?(): void
  componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void
  // biome-ignore lint/style/useNamingConvention: React default.
  UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void
  componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void
  // biome-ignore lint/style/useNamingConvention: React default.
  UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void
}
interface ErrorInfo {
  componentStack?: string | null
  digest?: string | null
}
// biome-ignore lint/style/useNamingConvention: React default.
interface ComponentLifecycle<P, S, SS = any> extends NewLifecycle<P, S, SS>, DeprecatedLifecycle<P, S> {
  componentDidMount?(): void
  shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean
  componentWillUnmount?(): void
  componentDidCatch?(error: Error, errorInfo: ErrorInfo): void
}
// biome-ignore lint/style/useNamingConvention: React default.
interface ReactComponent<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> {}
// biome-ignore lint/style/useNamingConvention: React default.
type ReactJSXElementConstructor<P> =
  | ((props: P, deprecatedLegacyContext?: any) => ReactNode)
  | (new (
      props: P,
      deprecatedLegacyContext?: any,
    ) => ReactComponent<any, any>)

export interface ReactElement<P = any, T extends string | ReactJSXElementConstructor<any> = string | ReactJSXElementConstructor<any>> {
  type: T
  props: P
  key: string | null
}
// biome-ignore lint/style/useNamingConvention: React default.
export interface JSX extends ReactElement<any, any> {}

export interface FunctionComponent<P = {}> {
  (props: P, deprecatedLegacyContext?: any): ReactNode
  displayName?: string | undefined
}
// biome-ignore lint/style/useNamingConvention: React default.
export type FC<P = {}> = FunctionComponent<P>
