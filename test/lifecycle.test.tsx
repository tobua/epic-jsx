// @vitest-environment happy-dom

import { test, expect, afterEach, vi } from 'vitest'
import { render, run, serializeElement } from '../test'
import * as React from '../index'
import { unmount } from './helper'

afterEach(unmount)

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
