// @vitest-environment happy-dom

import { test, expect, afterEach } from 'vitest'
import { render, serializeElement } from '../test'
import * as React from '../index'
import { unmount } from './helper'

afterEach(unmount)

test('Renders regular JSX tags.', () => {
  expect(React.getRoots().length).toBe(0)

  const { serialized } = render(
    <div>
      <p>Hello</p> World
    </div>
  )

  expect(serialized).toEqual('<body><div><p>Hello</p> World</div></body>')
})

test('Renders DOM attributes.', () => {
  const { serialized } = render(
    <div aria-label="labelled">
      <button type="button" tabIndex={-1}>
        Hello
      </button>{' '}
      World
    </div>
  )

  expect(serialized).toEqual(
    '<body><div aria-label="labelled"><button type="button" tabindex="-1">Hello</button> World</div></body>'
  )
})

test('Works with fragments.', () => {
  const { serialized } = render(
    <>
      <p>first</p>
      <>
        <p>second</p>
        <p>third</p>
      </>
    </>
  )

  expect(serialized).toEqual('<body><p>first</p><p>second</p><p>third</p></body>')
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

  const { serialized } = render(
    <div>
      <First />
      <Second />
      <Third />
    </div>
  )

  expect(serialized).toEqual(
    '<body><div><p>first</p><p>second<span>nested</span></p><p>third</p></div></body>'
  )
})

test('null as the container will also lead to fallback being used.', () => {
  const { serialized } = render(<p>fallback</p>, { container: document.getElementById('missing') })
  expect(serialized).toEqual('<body><p>fallback</p></body>')
})

test('Can render multiple times.', () => {
  render(<p>first</p>)
  render(<p>second</p>)

  expect(serializeElement()).toEqual('<body><p>second</p></body>')
})

test('Can render multiple times.', () => {
  render(<p>first</p>)
  render(<p>second</p>)

  expect(serializeElement()).toEqual('<body><p>second</p></body>')
})

test('Can render into different elements.', () => {
  ;['first', 'second'].forEach((name) => {
    const div = document.createElement('div')
    div.id = name
    document.body.appendChild(div)
    render(<p>{name}</p>, { container: document.getElementById(name) })
  })

  // TODO bug, <p>second</p> at first shouldn't be there.
  expect(serializeElement()).toEqual(
    '<body><p>second</p><div id="first"><p>first</p></div><div id="second"><p>second</p></div></body>'
  )
})

test('Can render object styles as inline-styles.', () => {
  const { serialized } = render(<div style={{ display: 'flex', justifyContent: 'center' }} />)
  expect(serialized).toEqual(
    '<body><div style="display: flex; justify-content: center;"></div></body>'
  )
})

test('Tree includes all nodes.', () => {
  const MyInput = ({ placeholder }: { placeholder: string }) => (
    <input value="Hello" placeholder={placeholder} />
  )

  const { tree } = render(
    <div>
      <p>first</p>
      <span>second</span>
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      <>
        <p>third</p>
        <button type="button">fourth</button>
        <MyInput placeholder="World" />
      </>
    </div>
  )

  expect(tree.tag).toBe('body')
  expect(tree.children.length).toBe(1)
  expect(tree.children[0].tag).toBe('div')
  expect(tree.children[0].children.length).toBe(3) // p, span, <>
  expect(tree.children[0].children[1].tag).toBe('span')
  expect(tree.children[0].children[2].tag).toBe(undefined) // <>
  expect(tree.children[0].children[2].children.length).toBe(3)
  expect(tree.children[0].children[2].children[1].tag).toBe('button')
  expect(typeof tree.children[0].children[2].children[2].tag).toBe('function')
  expect(tree.children[0].children[2].children[2].props).toEqual({
    placeholder: 'World',
  })
  expect(tree.children[0].children[2].children[2].props).toEqual({ placeholder: 'World' })
  expect(tree.children[0].children[2].children[2].children[0].tag).toBe('input')
})
