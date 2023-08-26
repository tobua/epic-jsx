export interface Hook {
  state: any
  queue: Function[]
}

export type Props = { [key: string]: any }

export interface Fiber {
  // keyof HTMLElementTagNameMap
  type: Function | 'TEXT_ELEMENT' // keyof JSX.IntrinsicElements // Coming from @types/react
  child: Fiber
  sibling: Fiber
  parent: Fiber
  dom: Element
  props: Props
  hooks: Hook[]
  alternate: Fiber
  effectTag: 'DELETION' | 'PLACEMENT' | 'UPDATE'
}
