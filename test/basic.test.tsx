// @vitest-environment happy-dom

import { test, expect, afterEach } from 'vitest'
import { run } from './mock'
import * as React from '../index'
import { serializeDocumentNode, unmount } from './helper'

afterEach(unmount)

test('Renders regular JSX tags.', () => {
  React.render(
    <div>
      <p>Hello</p> World
    </div>
  )

  expect(React.getRoot()).toBe(null)

  run() // requestIdleCallback

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

test('Works with nested components.', () => {
  const First = () => <p>first</p>
  const Nested = () => <span>nested</span>
  const Second = () => (
    <p>
      second
      <Nested />
    </p>
  )
  const Third = () => <p>third</p>

  React.render(
    <div>
      <First />
      <Second />
      <Third />
    </div>
  )

  run()

  expect(serializeDocumentNode()).toEqual(
    '<body><div><p>first</p><p>second<span>nested</span></p><p>third</p></div></body>'
  )
})
