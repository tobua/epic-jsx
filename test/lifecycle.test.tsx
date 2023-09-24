// @vitest-environment happy-dom

import { test, expect, afterEach, vi } from 'vitest'
import { render, run, serializeElement } from '../test'
import * as React from '../index'
import { mapNestedArray } from './helper'

afterEach(React.unmountAll)

test('Can trigger a component rerender.', () => {
  let count = 0
  function Component(this: React.Component) {
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

  expect(serialized).toEqual(
    '<body><div>Count: 0<button type="button">Rerender</button></div></body>'
  )

  const button = tree.children[0].children[0].children[2].getElement() as HTMLButtonElement

  button.click()
  expect(count).toBe(1) // click increments and calls rerender (without immediate effect)

  expect(serializeElement()).toEqual(
    '<body><div>Count: 0<button type="button">Rerender</button></div></body>'
  )

  run()

  expect(serializeElement()).toEqual(
    '<body><div>Count: 1<button type="button">Rerender</button></div></body>'
  )
})

test('Component can access refs.', () => {
  let context

  function Component(this: React.Component) {
    context = this
    return (
      <>
        <div id="first">first</div>
        <div id="second">second</div>
      </>
    )
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual(
    '<body><div id="first">first</div><div id="second">second</div></body>'
  )

  const { refs } = context

  expect(refs.length).toBe(2)
  expect(refs[0].id).toBe('first')
  expect(refs[0].tagName.toLowerCase()).toBe('div')
  expect(refs[1].id).toBe('second')
})

test('Component can access refs.', () => {
  let context

  function Component(this: React.Component) {
    context = this
    return (
      <>
        <div id="first">first</div>
        <div id="second">second</div>
      </>
    )
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual(
    '<body><div id="first">first</div><div id="second">second</div></body>'
  )

  const { refs } = context

  expect(refs.length).toBe(2)
  expect(refs[0].id).toBe('first')
  expect(refs[0].tagName.toLowerCase()).toBe('div')
  expect(refs[1].id).toBe('second')
})

test('After lifecycle listeners will be called after render.', () => {
  let context
  const afterMock = vi.fn(function AfterMock() {
    context = this
  })
  let arrowFunctionContext

  function Component(this: React.Component) {
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

  expect(arrowFunctionContext.refs.length).toBe(2)
})

test('Nested refs are flattened out by default.', () => {
  let context

  function Component(this: React.Component) {
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
    '<body><div id="first"><div id="second"><div id="third">third</div></div></div><div id="fourth">fourth</div></body>'
  )

  const { refs } = context

  expect(refs.length).toBe(4)
  // child elements before siblings.
  expect(refs[0].id).toBe('first')
  expect(refs[1].id).toBe('second')
  expect(refs[2].id).toBe('third')
  expect(refs[3].id).toBe('fourth')
})

test("Refs from inside child components aren't listed.", () => {
  let context

  const Second = () => <div id="second">second</div>

  function Component(this: React.Component) {
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

  expect(serialized).toEqual(
    '<body><div id="first"><div id="second">second</div></div><div id="third">third</div></body>'
  )

  const { refs } = context

  expect(refs.length).toBe(2)
  expect(refs[0].id).toBe('first')
  expect(refs[1].id).toBe('third')
})

test('Refs can be accessed nested.', () => {
  let context

  function Component(this: React.Component) {
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
    '<body><div id="first"><div id="second"><p id="third">third</p></div></div><span id="fourth">fourth</span></body>'
  )

  const { refsNested } = context

  expect(refsNested.length).toBe(3)
  expect(refsNested[0].id).toBe('first')
  expect(refsNested[2].id).toBe('fourth')
  expect(refsNested[1][0].id).toBe('second')
  expect(refsNested[1][1][0].id).toBe('third')

  const tagsMapped = mapNestedArray(
    refsNested,
    (element: HTMLElement) => element.tagName?.toLowerCase()
  )

  expect(tagsMapped).toEqual(['div', ['div', ['p']], 'span'])
})

test('Refs can be accessed by a specific tag.', () => {
  let context: React.Component | undefined

  function Component(this: React.Component) {
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
  let context: React.Component | undefined
  let counter = 0

  function Component(this: React.Component) {
    context = this
    counter++
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

  expect(serializeElement()).toEqual(
    '<body><p id="first">first</p><p id="second">second</p><p id="third">third</p></body>'
  )

  context?.rerender()
  run()

  expect(serializeElement()).toEqual('<body><p id="first">first</p><p id="third">third</p></body>')
})

test('Elements and components no longer present will be removed.', () => {
  const NestedComponent = ({ children }) => <p>{children}</p>
  let context: React.Component | undefined
  let counter = 0

  function Component(this: React.Component) {
    context = this
    counter++
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

  expect(serialized).toEqual('<body><p>first</p><p>third</p><svg><path></path></svg></body>')

  context?.rerender()
  run()

  expect(serializeElement()).toEqual(
    '<body><p>first</p><p>second</p><p>fourth</p><p>fifth</p></body>'
  )

  context?.rerender()
  run()

  expect(serializeElement()).toEqual(
    '<body><p>first</p><p>third</p><svg><path></path></svg></body>'
  )
})
