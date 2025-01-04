import { afterEach, expect, mock, test } from 'bun:test'
import { type Component, unmountAll } from '../index'
import { Renderer } from '../index'
import { render, run, serializeElement } from '../test'
import { mapNestedArray } from './helper'

afterEach(unmountAll)

test('Can trigger a component rerender.', () => {
  let count = 0
  function Component(this: Component) {
    return (
      <div>
        Count: {count}
        <button
          type="button"
          onClick={() => {
            count += 1
            this.rerender()
          }}
        >
          Rerender
        </button>
      </div>
    )
  }

  const { serialized, tree } = render(<Component />)

  expect(serialized).toEqual('<body><div>Count: 0<button type="button">Rerender</button></div></body>')

  const button = tree.children[0]?.children[0]?.children[2]?.getElement() as HTMLButtonElement

  button.click()
  expect(count).toBe(1) // click increments and calls rerender (without immediate effect)

  expect(serializeElement()).toEqual('<body><div>Count: 0<button type="button">Rerender</button></div></body>')

  run()

  expect(serializeElement()).toEqual('<body><div>Count: 1<button type="button">Rerender</button></div></body>')
})

test('Component can access refs.', () => {
  let context: Component

  function Component(this: Component) {
    context = this
    return (
      <>
        <div id="first">first</div>
        <div id="second">second</div>
      </>
    )
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual('<body><div id="first">first</div><div id="second">second</div></body>')

  const { refs } = context

  expect(refs.length).toBe(2)
  expect(refs[0].id).toBe('first')
  expect(refs[0].tagName.toLowerCase()).toBe('div')
  expect(refs[1].id).toBe('second')
})

test('Component can access refs.', () => {
  let context: Component

  function Component(this: Component) {
    context = this
    return (
      <>
        <div id="first">first</div>
        <div id="second">second</div>
      </>
    )
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual('<body><div id="first">first</div><div id="second">second</div></body>')

  const { refs } = context

  expect(refs.length).toBe(2)
  expect(refs[0].id).toBe('first')
  expect(refs[0].tagName.toLowerCase()).toBe('div')
  expect(refs[1].id).toBe('second')
})

test('After lifecycle listeners will be called after render.', () => {
  let context: any
  const afterMock = mock(function AfterMock() {
    context = this
  })
  let arrowFunctionContext: Component

  function Component(this: Component) {
    this.after(afterMock)
    this.after(() => {
      arrowFunctionContext = this
    })
    this.after(() => {
      // Ensures refs are present during rendering.
      expect(this.refs.length).toBe(2)
    })
    return (
      <>
        <div id="first">first</div>
        <div id="second">second</div>
      </>
    )
  }

  render(<Component />)

  expect(afterMock).toHaveBeenCalled()
  expect(afterMock.mock.calls.length).toBe(1)

  const { refs } = context

  expect(refs.length).toBe(2)
  expect(refs[1].id).toBe('second')

  // @ts-ignore
  expect(arrowFunctionContext.refs.length).toBe(2)
})

test('Nested refs are flattened out by default.', () => {
  let context: Component

  function Component(this: Component) {
    context = this
    return (
      <>
        <div id="first">
          <div id="second">
            <div id="third">third</div>
          </div>
        </div>
        <div id="fourth">fourth</div>
      </>
    )
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual(
    '<body><div id="first"><div id="second"><div id="third">third</div></div></div><div id="fourth">fourth</div></body>',
  )

  const { refs } = context

  expect(refs.length).toBe(4)
  // child elements before siblings.
  expect(refs[0]?.id).toBe('first')
  expect(refs[1]?.id).toBe('second')
  expect(refs[2]?.id).toBe('third')
  expect(refs[3]?.id).toBe('fourth')
})

test("Refs from inside child components aren't listed.", () => {
  let context: Component

  const Second = () => <div id="second">second</div>

  function Component(this: Component) {
    context = this
    return (
      <>
        <div id="first">
          <Second />
        </div>
        <div id="third">third</div>
      </>
    )
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual('<body><div id="first"><div id="second">second</div></div><div id="third">third</div></body>')

  const { refs } = context

  expect(refs.length).toBe(2)
  expect(refs[0].id).toBe('first')
  expect(refs[1].id).toBe('third')
})

test('Refs can be accessed nested.', () => {
  let context: Component

  function Component(this: Component) {
    context = this
    return (
      <>
        <div id="first">
          <div id="second">
            <p id="third">third</p>
          </div>
        </div>
        <span id="fourth">fourth</span>
      </>
    )
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual(
    '<body><div id="first"><div id="second"><p id="third">third</p></div></div><span id="fourth">fourth</span></body>',
  )

  const { refsNested } = context

  expect(refsNested.length).toBe(3)
  expect((refsNested[0] as HTMLElement).id).toBe('first')
  expect((refsNested[2] as HTMLElement).id).toBe('fourth')
  expect(refsNested[1][0].id).toBe('second')
  expect(refsNested[1][1][0].id).toBe('third')

  const tagsMapped = mapNestedArray(refsNested, (element: HTMLElement) => element.tagName?.toLowerCase())

  expect(tagsMapped).toEqual(['div', ['div', ['p']], 'span'])
})

test('Refs can be accessed by a specific tag.', () => {
  let context: Component | undefined

  function Component(this: Component) {
    context = this
    return (
      <>
        <div id="first">
          <div id="second">
            <p id="third">third</p>
          </div>
        </div>
        <span id="fourth">fourth</span>
      </>
    )
  }

  render(<Component />)

  const divs = context?.refsByTag('div')
  const paragraph = context?.refsByTag('p')
  const span = context?.refsByTag('span')

  expect(divs?.length).toBe(2)
  expect(paragraph?.length).toBe(1)
  expect(span?.length).toBe(1)

  // @ts-ignore
  expect(paragraph[0].tagName.toLowerCase()).toBe('p')
})

test('Elements can be conditionally rendered.', () => {
  let context: Component | undefined
  let counter = 0

  function Component(this: Component) {
    context = this
    counter += 1
    return (
      <>
        <p id="first">first</p>
        {counter % 2 === 0 ? <p id="second">second</p> : undefined}
        <p id="third">third</p>
      </>
    )
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual('<body><p id="first">first</p><p id="third">third</p></body>')

  context?.rerender()
  run()

  expect(serializeElement()).toEqual('<body><p id="first">first</p><p id="second">second</p><p id="third">third</p></body>')

  context?.rerender()
  run()

  expect(serializeElement()).toEqual('<body><p id="first">first</p><p id="third">third</p></body>')
})

test('Elements and components no longer present will be removed.', () => {
  const NestedComponent = ({ children }: { children: any }) => <p>{children}</p>
  let context: Component | undefined
  let counter = 0

  function Component(this: Component) {
    context = this
    counter += 1
    return (
      <>
        <p>first</p>
        {counter % 2 === 0 ? <p>second</p> : undefined}
        {counter % 2 === 1 ? <p>third</p> : undefined}
        {counter % 2 === 0 ? <p>fourth</p> : undefined}
        {counter % 2 === 0 ? <NestedComponent>fifth</NestedComponent> : undefined}
        {counter % 2 === 1 ? (
          <svg>
            <path />
          </svg>
        ) : undefined}
      </>
    )
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual('<body><p>first</p><p>third</p><svg><path/></svg></body>')

  context?.rerender()
  run()

  expect(serializeElement()).toEqual('<body><p>first</p><p>second</p><p>fourth</p><p>fifth</p></body>')

  context?.rerender()
  run()

  expect(serializeElement()).toEqual('<body><p>first</p><p>third</p><svg><path/></svg></body>')
})

test('Currently rendered component is reflected on the Renderer.', () => {
  let context: Component | undefined

  function Component(this: Component, { name, check, children }: { name: string; check: Function; children?: any }) {
    context = this
    check()
    return (
      <div>
        <p>{name}</p>
        {children}
      </div>
    )
  }

  function NestedComponent(this: Component, { name, check }: { name: string; check: Function }) {
    context = this
    check()
    return <p>{name}</p>
  }

  expect(Renderer.current).not.toBeDefined()

  render(
    <>
      <Component name="First" check={() => expect(Renderer.current?.type).toBe(Component)} />
      {/* @ts-ignore */}
      {expect(Renderer.current).toBe(undefined) && undefined}
      <Component name="Second" check={() => expect(Renderer.current?.type).toBe(Component)}>
        {/* @ts-ignore */}
        {expect(Renderer.current).toBe(undefined) && undefined}
        <NestedComponent name="Nested" check={() => expect(Renderer.current?.type).toBe(NestedComponent)} />
      </Component>
    </>,
  )

  expect(Renderer.current).not.toBeDefined()

  // Same result after rerender.
  context?.rerender()
  run()
})

test('Renderer.current is set on root component render already.', () => {
  function Component({ check }: { check: Function }) {
    check()
    return <p>hey</p>
  }

  render(<Component check={() => expect(Renderer.current?.type).toBe(Component)} />)
})
