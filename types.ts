export const State: { context: Context | null; effects: Function[] } = {
  context: null,
  effects: [],
}

export type Action = (value: any) => any

export interface Hook {
  state: any
  queue: Action[]
}

export type Props = { [key: string]: any }

export type Type = keyof HTMLElementTagNameMap | Function | 'TEXT_ELEMENT' | undefined // undefined if Fragment

export interface Fiber {
  // keyof HTMLElementTagNameMap
  type?: Type // keyof JSX.IntrinsicElements // Coming from @types/react
  child?: Fiber
  sibling?: Fiber
  parent?: Fiber
  dom: HTMLElement
  props: Props
  hooks?: any[]
  afterListeners?: Function[]
  component?: Component
  alternate: Fiber
  effectTag?: 'DELETION' | 'PLACEMENT' | 'UPDATE'
  unmount?: () => void
}

export interface Context {
  nextUnitOfWork?: Fiber
  currentRoot?: Fiber
  wipRoot?: Fiber
  deletions: Fiber[]
  wipFiber: Fiber
  hookIndex: number
  dependencies: Map<Function, any[]>
}

export interface Component {
  id: string
  root: Fiber
  context: Context
  rerender: Function
  after: (callback: () => void) => void
  refs: HTMLElement[] // Flat vs. nested refs?
}

export interface Ref<T> {
  readonly current: T | null
}
