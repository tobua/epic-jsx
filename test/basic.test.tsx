import './helper'
import { afterEach, expect, test } from 'bun:test'
import { type JSX, getRoots, unmountAll } from '../index'
import { render, serializeElement } from '../test'

afterEach(unmountAll)

test('Renders regular JSX tags.', () => {
  expect(getRoots().length).toBe(0)

  const { serialized } = render(
    <div>
      <p>Hello</p> World
    </div>,
  )

  expect(serialized).toEqual('<body><div><p>Hello</p> World</div></body>')
  expect(getRoots().length).toBe(1)
})

test('Renders DOM attributes.', () => {
  const { serialized } = render(
    <div aria-label="labelled">
      <button type="button" tabIndex={-1}>
        Hello
      </button>{' '}
      World
    </div>,
  )

  expect(serialized).toEqual('<body><div aria-label="labelled"><button type="button" tabindex="-1">Hello</button> World</div></body>')
})

test('Works with fragments.', () => {
  const { serialized } = render(
    <>
      <p>first</p>
      <>
        <p>second</p>
        <p>third</p>
      </>
    </>,
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
    </div>,
  )

  expect(serialized).toEqual('<body><div><p>first</p><p>second<span>nested</span></p><p>third</p></div></body>')
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
  for (const name of ['first', 'second']) {
    const div = document.createElement('div')
    div.id = name
    document.body.appendChild(div)
    render(<p>{name}</p>, { container: document.getElementById(name) })
  }

  expect(serializeElement()).toEqual('<body><div id="first"><p>first</p></div><div id="second"><p>second</p></div></body>')

  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild)
  }
})

test('Can render object styles as inline-styles.', () => {
  const { serialized } = render(<div style={{ display: 'flex', justifyContent: 'center' }} />)
  expect(serialized).toEqual('<body><div style="display: flex; justify-content: center;"></div></body>')
})

test('Tree includes all nodes.', () => {
  const MyInput = ({ placeholder }: { placeholder: string }) => <input value="Hello" placeholder={placeholder} />

  const { tree } = render(
    <div>
      <p>first</p>
      <span>second</span>
      <>
        <p>third</p>
        <button type="button">fourth</button>
        <MyInput placeholder="World" />
      </>
    </div>,
  )

  expect(tree.tag).toBe('body')
  expect(tree.children.length).toBe(1)
  expect(tree.children[0]?.tag).toBe('div')
  expect(tree.children[0]?.children.length).toBe(5) // p, span, p, button, MyInput
  expect(tree.children[0]?.children[0]?.tag).toBe('p')
  expect(tree.children[0]?.children[0]?.children[0]?.text).toBe('first')
  expect(tree.children[0]?.children[1]?.tag).toBe('span')
  expect(tree.children[0]?.children[1]?.children[0]?.text).toBe('second')
  expect(tree.children[0]?.children[2]?.tag).toBe('p')
  expect(tree.children[0]?.children[2]?.children[0]?.text).toBe('third')
  expect(tree.children[0]?.children[3]?.tag).toBe('button')
  expect(tree.children[0]?.children[3]?.children[0]?.text).toBe('fourth')
  expect(typeof tree.children[0]?.children[4]?.tag).toBe('function')
  expect(tree.children[0]?.children[4]?.props).toEqual({
    placeholder: 'World',
  })
  expect(tree.children[0]?.children[4]?.props).toEqual({ placeholder: 'World' })
  expect(tree.children[0]?.children[4]?.children[0]?.tag).toBe('input')
})

test('Number based sizes are converted to pixels.', () => {
  const { serialized } = render(<div style={{ width: 50, height: 50, flexGrow: 1 }}>Square</div>)

  expect(serialized).toEqual('<body><div style="width: 50px; height: 50px; flex-grow: 1;">Square</div></body>')
})

test('Fragments are removed from the tree by default.', () => {
  const Second = () => <span>second</span>
  const { tree } = render(
    <>
      <p>first</p>
      <Second />
      <>
        <p>third</p>
        <>
          <p>fourth</p>
        </>
      </>
    </>,
  )

  expect(tree.tag).toBe('body')
  expect(tree.children.length).toBe(4)

  const [first, second, third, fourth] = tree.children

  expect(first?.tag).toBe('p')
  expect(first?.children[0]?.tag).toBe('TEXT_ELEMENT')
  expect(first?.children[0]?.text).toBe('first')
  expect(second?.children[0]?.children[0]?.tag).toBe('TEXT_ELEMENT')
  expect(second?.children[0]?.children[0]?.text).toBe('second')
  expect(third?.children[0]?.tag).toBe('TEXT_ELEMENT')
  expect(third?.children[0]?.text).toBe('third')
  expect(fourth?.children[0]?.tag).toBe('TEXT_ELEMENT')
  expect(fourth?.children[0]?.text).toBe('fourth')
})

test('JSX type is compatible with regular editor ReactElement types.', () => {
  function App({ children }: { children: JSX }) {
    const insert: JSX = <p>inserted</p>
    return (
      <div>
        {children}
        {insert}
      </div>
    )
  }

  const { serialized } = render(
    <App>
      <p>inner</p>
    </App>,
  )

  expect(serialized).toEqual('<body><div><p>inner</p><p>inserted</p></div></body>')
})
