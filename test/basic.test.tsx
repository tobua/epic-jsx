import './helper'
import { afterEach, expect, mock, test } from 'bun:test'
import { type Component, type JSX, getRoots, unmountAll } from '../index'
import { render, run, serializeElement } from '../test'

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
  const { serialized } = render(<p>fallback</p>, {
    container: document.getElementById('missing'),
  })
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
  expect(tree.children[0]?.children[4]?.props).toEqual({
    placeholder: 'World',
  })
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
  function App({ children }: { children: JSX.Element }) {
    const insert: JSX.Element = <p>inserted</p>
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

test('Classes are applied properly.', () => {
  const { serialized } = render(
    <>
      <div class="regular-class">regular</div>
      {/* biome-ignore lint/suspicious/noReactSpecificProps: For testing purposes! */}
      <div className="name-class">name</div>
    </>,
  )

  // TODO class should be part of the JSX types.

  expect(serialized).toEqual('<body><div class="regular-class">regular</div><div class="name-class">name</div></body>')
})

test('Each component is assigned a stable id.', () => {
  const components = {}
  function Component({ id }) {
    components[id] = this
    return <p>{id}</p>
  }

  const { serialized, tree } = render(
    <>
      <Component id={1} />
      <Component id={2} />
    </>,
  )

  expect(serialized).toEqual('<body><p>1</p><p>2</p></body>')

  let firstId = tree.children[0].getComponent().id
  let secondId = tree.children[1].getComponent().id

  expect(firstId !== secondId).toBe(true)
  expect(components[1].id).toBe(firstId)
  expect(components[2].id).toBe(secondId)

  components[1].rerender()
  run()

  firstId = tree.children[0].getComponent().id
  secondId = tree.children[1].getComponent().id

  expect(firstId !== secondId).toBe(true)
  expect(components[1].id).toBe(firstId)
  expect(components[2].id).toBe(secondId)
})

test('Rerender of siblings only rerenders the target.', () => {
  const components = {}
  const renderCounts = { 1: 0, 2: 0, 3: 0 }
  function Component({ id }) {
    components[id] = this
    renderCounts[id] += 1
    return <p>{id}</p>
  }

  const { serialized } = render(
    <>
      <Component id={1} />
      <Component id={2} />
      <Component id={3} />
    </>,
  )

  expect(serialized).toEqual('<body><p>1</p><p>2</p><p>3</p></body>')

  expect(renderCounts).toEqual({ 1: 1, 2: 1, 3: 1 })

  components[2].rerender()
  run()

  expect(renderCounts).toEqual({ 1: 1, 2: 2, 3: 1 })

  components[1].rerender()
  run()

  expect(renderCounts).toEqual({ 1: 2, 2: 2, 3: 1 })

  components[3].rerender()
  run()

  expect(renderCounts).toEqual({ 1: 2, 2: 2, 3: 2 })

  components[2].rerender()
  run()

  expect(renderCounts).toEqual({ 1: 2, 2: 3, 3: 2 })
})

test('Handlers are only registered once and props are empty.', () => {
  let component: Component = null
  let props: object = null
  let renderCount = 0
  const clickHandler = mock()
  function Button({ ...otherProps }) {
    component = this
    props = otherProps
    renderCount += 1
    return (
      <button id="button" onClick={() => clickHandler()}>
        click
      </button>
    )
  }

  function App({ children }) {
    return <div>{children}</div>
  }

  const { serialized } = render(
    <App>
      <Button />
    </App>,
  )

  expect(serialized).toEqual('<body><div><button id="button">click</button></div></body>')
  expect(props).toEqual({})
  document.getElementById('button').click()

  expect(clickHandler).toHaveBeenCalledTimes(1)

  component.rerender()
  run()

  expect(serializeElement()).toEqual('<body><div><button id="button">click</button></div></body>')
  document.getElementById('button').click()

  expect(clickHandler).toHaveBeenCalledTimes(2)

  component.rerender()
  component.rerender()
  component.rerender()
  run()

  expect(serializeElement()).toEqual('<body><div><button id="button">click</button></div></body>')
  document.getElementById('button').click()

  // Fails when arrow functions created during render are used.
  expect(clickHandler).toHaveBeenCalledTimes(3)
})

test('Click handler works in conjection with disabled attribute.', () => {
  let component: Component = null
  let props: object = null
  let renderCount = 0
  const clickHandler = mock()
  const clickHandler2 = mock()
  function Button({ ...otherProps }) {
    component = this
    props = otherProps
    renderCount += 1
    return (
      <>
        <button id="button1" disabled={false} onClick={() => clickHandler()}>
          1
        </button>
        <button id="button2" disabled={true} onClick={() => clickHandler2()}>
          2
        </button>
      </>
    )
  }

  function App({ children }) {
    return <div>{children}</div>
  }

  const { serialized } = render(
    <App>
      <Button />
    </App>,
  )

  expect(serialized).toEqual('<body><div><button id="button1">1</button><button id="button2" disabled="disabled">2</button></div></body>')
  expect(props).toEqual({})
  document.getElementById('button1').click()
  document.getElementById('button2').click()

  expect(clickHandler).toHaveBeenCalledTimes(1)
  expect(clickHandler2).toHaveBeenCalledTimes(0)
})

test('Can debug Fiber and Component.', () => {
  expect(getRoots().length).toBe(0)

  let component: Component

  function App(this: Component, { count }: { count: number }) {
    component = this
    return <p>Paragraph {count}</p>
  }

  const { serialized } = render(
    <div>
      <App count={2} />
    </div>,
  )

  expect(serialized).toEqual('<body><div><p>Paragraph 2</p></div></body>')
  expect(getRoots().length).toBe(1)

  const appComponent = component.print() // <App />
  expect(appComponent).toContain('App')
  const root = component.context.root.print() // Root (body)
  expect(root).toContain('Root <body>')
  const div = component.context.root.child.print() // <div>
  expect(div).toContain('div')
  const appFiber = component.context.root.child.child.print() // <App />
  expect(appFiber).toContain('App')
  expect(appFiber).toContain('{"count":2}')
  const paragraph = component.context.root.child.child.child?.print() // <p>
  expect(paragraph).toContain('p')
  const text = component.context.root.child.child.child.child?.print() // Paragraph (Text)
  expect(text).toContain('"Paragraph "') // potential TODO
})

let UndeclaredVariable: undefined

test("Use of undeclared types doesn't break rendering.", () => {
  expect(getRoots().length).toBe(0)

  // Regular React will fail in this case, but our createElement receives undefined in both cases.
  // So, it's just treated as a regular fragment.
  const { serialized } = render(
    <div>
      <p>fr</p>
      <UndeclaredVariable>almost fr</UndeclaredVariable>
      <>fr fragment</>
      <p>fr</p>
    </div>,
  )

  expect(serialized).toEqual('<body><div><p>fr</p>almost frfr fragment<p>fr</p></div></body>')
})
