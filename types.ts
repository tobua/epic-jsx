export type Action = (value: any) => any

export interface Hook {
  state: any
  queue: Action[]
}

export type Props = { [key: string]: any }

export type Type = keyof HTMLElementTagNameMap | undefined // undefined if Fragment

export interface Fiber {
  // keyof HTMLElementTagNameMap
  type?: Function | 'TEXT_ELEMENT' // keyof JSX.IntrinsicElements // Coming from @types/react
  child?: Fiber
  sibling?: Fiber
  parent?: Fiber
  dom: Element
  props: Props
  hooks?: any[]
  alternate: Fiber
  effectTag?: 'DELETION' | 'PLACEMENT' | 'UPDATE'
  unmount?: () => void
}
