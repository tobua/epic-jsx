// @vitest-environment happy-dom

import { test, expect, afterEach, vi } from 'vitest'
import { render, run, serializeElement } from '../test'
import * as React from '../index'
import { getRoot, useRef, useState, useEffect, useCallback, useMemo } from '../index'

afterEach(React.unmountAll)

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

test('Elements can be conditionally rendered.', () => {
  function Counter() {
    const [count, setCount] = useState(1)
    return (
      <>
        <p id="first">first</p>
        <button type="button" onClick={() => setCount(count + 1)}>
          Count: {count}
        </button>
        {count % 2 === 0 ? <p id="second">second</p> : undefined}
        <p id="third">third</p>
      </>
    )
  }

  const { tree, serialized } = render(<Counter />)

  expect(serialized).toEqual(
    '<body><p id="first">first</p><button type="button">Count: 1</button><p id="third">third</p></body>'
  )

  expect(tree.tag).toBe('body')
  expect(tree.children[0].children[0].children[1].tag).toBe('button')

  const heading = tree.children[0].children[0].children[1].getElement() as HTMLButtonElement

  heading.click()
  run()

  expect(serializeElement()).toEqual(
    '<body><p id="first">first</p><button type="button">Count: 2</button><p id="second">second</p><p id="third">third</p></body>'
  )

  heading.click()
  run()

  expect(serializeElement()).toEqual(
    '<body><p id="first">first</p><button type="button">Count: 3</button><p id="third">third</p></body>'
  )
})

test('Works with multiple instances of setState.', () => {
  function Counter({ initialValue }: { initialValue: number }) {
    const [firstCount, setFirstCount] = useState(initialValue)
    const [secondCount, setSecondCount] = useState(initialValue + 4)

    return (
      <>
        <button type="button" onClick={() => setFirstCount(firstCount + 1)}>
          {firstCount}-{secondCount}
        </button>
        <button type="button" onClick={() => setSecondCount(secondCount + 1)}>
          {firstCount}-{secondCount}
        </button>
      </>
    )
  }

  const { tree, serialized } = render(
    <div>
      <Counter initialValue={1} />
      <Counter initialValue={3} />
    </div>
  )

  expect(serialized).toEqual(
    '<body><div><button type="button">1-5</button><button type="button">1-5</button><button type="button">3-7</button><button type="button">3-7</button></div></body>'
  )

  expect(tree.children[0].children[0].children[0].children[0].tag).toBe('button')
  expect(tree.children[0].children[0].children[0].children[1].tag).toBe('button')

  const firstButton =
    tree.children[0].children[0].children[0].children[0].getElement() as HTMLButtonElement
  const secondButton =
    tree.children[0].children[0].children[0].children[1].getElement() as HTMLButtonElement

  firstButton.click()
  run()

  expect(serializeElement()).toEqual(
    '<body><div><button type="button">2-5</button><button type="button">2-5</button><button type="button">3-7</button><button type="button">3-7</button></div></body>'
  )

  secondButton.click()
  firstButton.click()

  run()

  expect(serializeElement()).toEqual(
    '<body><div><button type="button">3-6</button><button type="button">3-6</button><button type="button">3-7</button><button type="button">3-7</button></div></body>'
  )
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

test('Ref stays present after rerenders.', () => {
  const effectMock = vi.fn()
  let rerender

  function Component() {
    const ref = useRef<HTMLDivElement>()
    rerender = this.rerender
    useEffect(() => {
      effectMock(ref?.current)
    })
    return <div ref={ref}>Ref</div>
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual('<body><div>Ref</div></body>')

  expect(effectMock.mock.calls.length).toBe(1)
  expect(effectMock.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement)

  rerender()
  run()

  expect(serializeElement()).toEqual('<body><div>Ref</div></body>')

  expect(effectMock.mock.calls.length).toBe(2)
  expect(effectMock.mock.calls[1][0]).toBeInstanceOf(HTMLDivElement)
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

test('useCallback is available.', () => {
  function doubleMethod(value: number) {
    return value * 2
  }
  function Component() {
    const double = useCallback(doubleMethod)
    return <div>{double(5)}</div>
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual('<body><div>10</div></body>')
})

test('useMemo returnes the value returned by the callback.', () => {
  function Component() {
    const value = useMemo(() => 20)
    return <div>{value}</div>
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual('<body><div>20</div></body>')
})
