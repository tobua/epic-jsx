export type Action = (value: any) => any

export interface Hook {
  state: any
  queue: Action[]
}

export type Props = { [key: string]: any }

export type Type = keyof HTMLElementTagNameMap | Function | undefined // undefined if Fragment

export interface Fiber {
  // keyof HTMLElementTagNameMap
  type?: Function | 'TEXT_ELEMENT' // keyof JSX.IntrinsicElements // Coming from @types/react
  child?: Fiber
  sibling?: Fiber
  parent?: Fiber
  dom: HTMLElement
  props: Props
  hooks?: any[]
  alternate: Fiber
  effectTag?: 'DELETION' | 'PLACEMENT' | 'UPDATE'
  unmount?: () => void
}
