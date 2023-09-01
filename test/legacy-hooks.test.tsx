// @vitest-environment happy-dom

import { test, expect, afterEach, vi } from 'vitest'
import { render, run, serializeElement } from '../test'
import * as React from '../index'
import { getRoot, useRef, useState, useEffect } from '../index'
import { unmount } from './helper'

afterEach(unmount)

test('Renders a basic component and rerenders after state update.', () => {
  function Counter() {
    const [count, setCount] = useState(1)
    return (
      <button type="button" onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    )
  }

  const { tree, serialized } = render(<Counter />)

  expect(serialized).toEqual('<body><button type="button">Count: 1</button></body>')

  expect(tree.tag).toBe('body')
  expect(tree.children[0].children[0].tag).toBe('button')

  const heading = tree.children[0].children[0].getElement() as HTMLButtonElement

  heading.click()
  run()

  expect(serializeElement()).toEqual('<body><button type="button">Count: 2</button></body>')
})

test('Accessing the root will process the current work in progress before returning the context.', () => {
  function Counter() {
    const [count, setCount] = useState(1)
    return (
      <button type="button" onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    )
  }

  const { tree, serialized } = render(<Counter />)

  expect(serialized).toEqual('<body><button type="button">Count: 1</button></body>')

  expect(tree.tag).toBe('body')
  expect(tree.children[0].children[0].tag).toBe('button')

  const heading = tree.children[0].children[0].getElement() as HTMLButtonElement

  heading.click()

  expect(serializeElement()).toEqual('<body><button type="button">Count: 1</button></body>')

  getRoot(document.body)

  expect(serializeElement()).toEqual('<body><button type="button">Count: 2</button></body>')
})

test('A ref can be assigned to any tag and is accessible in the effect.', () => {
  const effectMock = vi.fn()

  function Component() {
    const ref = useRef<HTMLDivElement>()
    useEffect(() => {
      effectMock(ref?.current)
    })
    return <div ref={ref}>Bye Legacy Hooks 👋</div>
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual('<body><div>Bye Legacy Hooks 👋</div></body>')

  expect(effectMock).toHaveBeenCalled()
  expect(effectMock.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement)
})

test('Multiple setState calls are batched into one render cycle.', () => {
  let renderCount = 0
  function Counter() {
    const [count, setCount] = useState(1)
    renderCount += 1
    return (
      <button
        type="button"
        onClick={() => {
          setCount(count + 1)
          setCount(count + 1)
        }}
      >
        Count: {count}
      </button>
    )
  }

  const { tree, serialized } = render(<Counter />)

  expect(serialized).toEqual('<body><button type="button">Count: 1</button></body>')

  expect(renderCount).toBe(1)

  const button = tree.children[0].children[0].getElement() as HTMLButtonElement

  button.click()
  run()

  expect(renderCount).toBe(2)

  expect(serializeElement()).toEqual('<body><button type="button">Count: 2</button></body>')
})
