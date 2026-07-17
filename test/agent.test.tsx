import './helper'
import { afterEach, expect, mock, test } from 'bun:test'
import { type Component, getRoots, type JSX, unmountAll, useEffect, useState } from '../index'
import { render, run, serializeElement } from '../test'

afterEach(unmountAll)

test('<div> with text.', () => {
  expect(getRoots().length).toBe(0)

  const { serialized } = render(
    <div>text</div>,
  )

  expect(serialized).toEqual('<body><div>text</div></body>')
  expect(getRoots().length).toBe(1)
})

test('Renders a list of items and updates when items change.', () => {
  function List() {
    const [items, setItems] = useState(['a', 'b', 'c'])
    return (
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
        <button type="button" onClick={() => setItems([...items, 'd'])}>
          add
        </button>
      </ul>
    )
  }

  const { serialized, tree } = render(<List />)

  expect(serialized).toEqual('<body><ul><li>a</li><li>b</li><li>c</li><button type="button">add</button></ul></body>')

  const button = tree.children[0]?.children[0]?.children[3]?.getElement() as HTMLButtonElement
  button.click()
  run()

  expect(serializeElement()).toEqual('<body><ul><li>a</li><li>b</li><li>c</li><li>d</li><button type="button">add</button></ul></body>')
})

test('useEffect runs after mount and when dependencies change.', () => {
  const calls: number[] = []

  function Counter({ initial }: { initial: number }) {
    const [count, setCount] = useState(initial)

    useEffect(() => {
      calls.push(count)
    }, [count])

    return (
      <button type="button" onClick={() => setCount(count + 1)}>
        {count}
      </button>
    )
  }

  const { tree } = render(<Counter initial={0} />)

  expect(calls).toEqual([0])

  const button = tree.children[0]?.children[0]?.getElement() as HTMLButtonElement
  button.click()
  run()

  expect(calls).toEqual([0, 1])

  // Clicking again without the dependency changing still calls setCount, which reruns effect since count changed.
  button.click()
  run()

  expect(calls).toEqual([0, 1, 2])
})

test('Mounting and unmounting a component through props toggling removes its DOM nodes.', () => {
  function Child() {
    return <span>child</span>
  }

  function App() {
    const [visible, setVisible] = useState(true)
    return (
      <div>
        <button type="button" onClick={() => setVisible(!visible)}>
          toggle
        </button>
        {visible ? <Child /> : undefined}
      </div>
    )
  }

  const { serialized, tree } = render(<App />)

  expect(serialized).toEqual('<body><div><button type="button">toggle</button><span>child</span></div></body>')

  const button = tree.children[0]?.children[0]?.children[0]?.getElement() as HTMLButtonElement
  button.click()
  run()

  expect(serializeElement()).toEqual('<body><div><button type="button">toggle</button></div></body>')

  button.click()
  run()

  expect(serializeElement()).toEqual('<body><div><button type="button">toggle</button><span>child</span></div></body>')
})

// Regression test for three interacting bugs found while replacing a middle list item's tag:
// 1. deleteChildren() (render.ts) recursed into fiber.sibling, marking every following old sibling
//    for deletion too, not just descendants of the mismatched node.
// 2. commitFiber() (browser.ts), when invoked directly on a context.deletions entry, also recursed
//    into fiber.sibling - a stale pointer into the old fiber tree - re-committing already-connected
//    old nodes using whatever leftover Change flag they had from when they were first created.
// 3. Newly added fibers were always appendChild'd to the end of their parent (browser.ts) instead of
//    being positioned via insertBefore, and the anchor lookup couldn't see through a bailed-out
//    function component (unchanged props skip re-render, leaving its fresh fiber's .child unset
//    even though its previously rendered subtree is still live in the DOM).
test('Replacing a middle sibling with a different tag should not delete the following, unrelated siblings.', () => {
  function Item({ label }: { label: string }) {
    return <li id={`item-${label}`}>{label}</li>
  }

  function List() {
    const [swapped, setSwapped] = useState(false)
    return (
      <ul>
        <Item label="a" />
        {swapped ? <div id="middle">middle</div> : <Item label="b" />}
        <Item label="c" />
        <button type="button" onClick={() => setSwapped(true)}>
          swap
        </button>
      </ul>
    )
  }

  const { serialized, tree } = render(<List />)

  expect(serialized).toEqual(
    '<body><ul><li id="item-a">a</li><li id="item-b">b</li><li id="item-c">c</li><button type="button">swap</button></ul></body>',
  )

  const button = tree.children[0]?.children[0]?.children[3]?.getElement() as HTMLButtonElement
  button.click()
  run()

  // Expected: only the middle item changes tag, "c" and the button should be untouched.
  expect(serializeElement()).toEqual(
    '<body><ul><li id="item-a">a</li><div id="middle">middle</div><li id="item-c">c</li><button type="button">swap</button></ul></body>',
  )
})

test('Replacing the last child (nothing trailing it) with a different tag works correctly.', () => {
  function Item({ label }: { label: string }) {
    return <li id={`item-${label}`}>{label}</li>
  }

  function List() {
    const [swapped, setSwapped] = useState(false)
    return (
      <ul>
        <button type="button" onClick={() => setSwapped(true)}>
          swap
        </button>
        <Item label="a" />
        <Item label="b" />
        {swapped ? <div id="last">last</div> : <Item label="c" />}
      </ul>
    )
  }

  const { serialized, tree } = render(<List />)

  expect(serialized).toEqual(
    '<body><ul><button type="button">swap</button><li id="item-a">a</li><li id="item-b">b</li><li id="item-c">c</li></ul></body>',
  )

  const button = tree.children[0]?.children[0]?.children[0]?.getElement() as HTMLButtonElement
  button.click()
  run()

  expect(serializeElement()).toEqual(
    '<body><ul><button type="button">swap</button><li id="item-a">a</li><li id="item-b">b</li><div id="last">last</div></ul></body>',
  )
})

test('Deeply nested subtree can be replaced with a differently tagged structure.', () => {
  function App() {
    const [alternate, setAlternate] = useState(false)
    return (
      <div id="wrapper">
        <button type="button" onClick={() => setAlternate(true)}>
          switch
        </button>
        {alternate ? (
          <section>
            <p>
              replaced <em>nested</em> content
            </p>
          </section>
        ) : (
          <div>
            <span>
              original <b>nested</b> content
            </span>
          </div>
        )}
      </div>
    )
  }

  const { serialized, tree } = render(<App />)

  expect(serialized).toEqual(
    '<body><div id="wrapper"><button type="button">switch</button><div><span>original <b>nested</b> content</span></div></div></body>',
  )

  const button = tree.children[0]?.children[0]?.children[0]?.getElement() as HTMLButtonElement
  button.click()
  run()

  expect(serializeElement()).toEqual(
    '<body><div id="wrapper"><button type="button">switch</button><section><p>replaced <em>nested</em> content</p></section></div></body>',
  )
})

test('Growing and shrinking a list of mixed tags at the tail keeps earlier items intact.', () => {
  function List() {
    const [count, setCount] = useState(1)
    const tags = [
      <div id="tag-0">div</div>,
      <span id="tag-1">span</span>,
      <p id="tag-2">p</p>,
      <b id="tag-3">b</b>,
    ]
    return (
      <section>
        {tags.slice(0, count)}
        <button type="button" onClick={() => setCount(count + 1)}>
          grow
        </button>
      </section>
    )
  }

  const { serialized, tree } = render(<List />)

  expect(serialized).toEqual('<body><section><div id="tag-0">div</div><button type="button">grow</button></section></body>')

  for (const expected of [
    '<body><section><div id="tag-0">div</div><span id="tag-1">span</span><button type="button">grow</button></section></body>',
    '<body><section><div id="tag-0">div</div><span id="tag-1">span</span><p id="tag-2">p</p><button type="button">grow</button></section></body>',
    '<body><section><div id="tag-0">div</div><span id="tag-1">span</span><p id="tag-2">p</p><b id="tag-3">b</b><button type="button">grow</button></section></body>',
  ]) {
    const button = document.querySelector('button') as HTMLButtonElement
    button.click()
    run()
    expect(serializeElement()).toEqual(expected)
  }
})
