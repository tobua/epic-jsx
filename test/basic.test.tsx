// @vitest-environment happy-dom

import { test, expect, afterEach } from 'vitest'
import { run } from './mock'
import * as React from '../index'
import { serializeDocumentNode } from './helper'

afterEach(() => {
  const root = React.getRoot()

  if (root && root.unmount) {
    root.unmount()
  }
})

test('Renders a basic component.', () => {
  function Counter() {
    const [state, setState] = React.useState(1)
    return <h1 onClick={() => setState((c) => c + 1)}>Count: {state}</h1>
  }

  const element = <Counter />
  React.render(element)

  expect(React.getRoot()).toBe(null)

  run() // requestIdleCallback

  expect(React.getRoot()).toBeDefined()
})

test('Renders regular JSX tags.', () => {
  React.render(
    <div>
      <p>Hello</p> World
    </div>
  )

  run()

  expect(serializeDocumentNode()).toEqual('<body><div><p>Hello</p> World</div></body>')
})

test('Renders DOM attributes.', () => {
  React.render(
    <div aria-label="labelled">
      <button type="button" tabIndex={-1}>
        Hello
      </button>{' '}
      World
    </div>
  )

  run()

  expect(serializeDocumentNode()).toEqual(
    '<body><div aria-label="labelled"><button type="button" tabindex="-1">Hello</button> World</div></body>'
  )
})

test('Works with fragments.', () => {
  React.render(
    <>
      <p>first</p>
      <>
        <p>second</p>
        <p>third</p>
      </>
    </>
  )

  run()

  expect(serializeDocumentNode()).toEqual('<body><p>first</p><p>second</p><p>third</p></body>')
})
