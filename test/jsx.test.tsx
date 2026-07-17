import './helper'
import { afterEach, expect, test } from 'bun:test'
import { compiler } from 'markdown-to-jsx/react'
import { cloneElement, createElement, getRoots, type JSX, unmountAll } from '../index'
import { clear, render, serializeElement } from '../test'

afterEach(unmountAll)

test('Can render SVG as JSX.', () => {
  expect(getRoots().length).toBe(0)

  const { serialized } = render(
    <svg viewBox="0 0 10 10" width={100} height={100}>
      <circle cx="50" cy="50" r="40" fill="red" />
    </svg>,
  )

  expect(serialized).toEqual(
    '<body><svg viewBox="0 0 10 10" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"/></svg></body>',
  )
})

test('camelCased SVG properties are output in dash-case.', () => {
  expect(getRoots().length).toBe(0)

  const { serialized } = render(
    <svg viewBox="0 0 10 10" width={100} height={100}>
      <path d="M3 12L23.4986 35.2938C24.295" strokeWidth={10} strokeDasharray="3 1" />
    </svg>,
  )

  expect(serialized).toEqual(
    '<body><svg viewBox="0 0 10 10" width="100" height="100"><path d="M3 12L23.4986 35.2938C24.295" stroke-width="10" stroke-dasharray="3 1"/></svg></body>',
  )
})

test('Can pass elements as children to a component.', () => {
  const PassChildren = ({ children }: { children: JSX.Element }) => <div>{children}</div>
  const { serialized } = render(
    <PassChildren>
      <p>hello</p>
    </PassChildren>,
  )

  expect(serialized).toEqual('<body><div><p>hello</p></div></body>')
})

test('Can render elements as an array.', () => {
  const { serialized } = render(
    <div>
      {['first', 'second', 'third'].map((item) => (
        <p>{item}</p>
      ))}
    </div>,
  )

  expect(serialized).toEqual('<body><div><p>first</p><p>second</p><p>third</p></div></body>')
})

test('Can render arrays.', () => {
  const InnerParagraph = ({ children }: { children: string }) => <p>{children}</p>
  const MultipleParagraphs = () => (
    <>
      {['first', 'second', 'third'].map((item) => (
        <InnerParagraph>{item}</InnerParagraph>
      ))}
    </>
  )
  const { serialized } = render(<MultipleParagraphs />)

  expect(serialized).toEqual('<body><p>first</p><p>second</p><p>third</p></body>')
})

test('Can return arrays in components.', () => {
  const MultipleParagraphs = () => ['first', 'second', 'third'].map((item) => <p>{item}</p>)
  const { serialized } = render(<MultipleParagraphs />)

  expect(serialized).toEqual('<body><p>first</p><p>second</p><p>third</p></body>')
})

test('Various empty elements are ignored.', () => {
  expect(getRoots().length).toBe(0)

  const { serialized } = render(
    <>
      <p>start</p>
      {undefined}
      {null}
      {false}
      {''}
      <p>end</p>
      <p>
        Falsy numbers: {undefined}
        {0} {-0} {Number.NaN}
      </p>
    </>,
  )

  expect(serialized).toEqual('<body><p>start</p><p>end</p><p>Falsy numbers: 0 0 NaN</p></body>')
})

// Regression test: createElement() used `if (props?.children)` (truthiness) to decide whether to
// use props.children over the rest-args children, so a single falsy-but-valid child (0, NaN) was
// mistaken for "no children" and silently dropped instead of rendered. Only reproduces with a lone
// scalar child (props.children holds the value directly, not wrapped in an array), unlike having
// several children where props.children is already a non-empty array regardless of falsy items.
test('A single falsy-but-valid child is still rendered.', () => {
  const { serialized } = render(
    <div>
      <b>{0}</b>
      <i>{Number.NaN}</i>
    </div>,
  )

  expect(serialized).toEqual('<body><div><b>0</b><i>NaN</i></div></body>')
})

test('Component can return nothing.', () => {
  function Component() {
    return null
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual('<body></body>')
})

test('Can render HTML anchor tags.', () => {
  expect(getRoots().length).toBe(0)

  const { serialized, root } = render(
    <div>
      <a href="https://google.com">Go to Google!</a>
    </div>,
  )

  expect(serialized).toEqual('<body><div><a href="https://google.com">Go to Google!</a></div></body>')

  // a is also valid inside SVG and therefore subject to be rendered in the wrong namespace.
  // This will lead to the tag not showing up in the browser.
  const nativeAnchorTag = root?.child?.child?.native as HTMLElement
  expect(nativeAnchorTag.tagName).toBe('A')
  expect(nativeAnchorTag.namespaceURI).toBe('http://www.w3.org/1999/xhtml')
})

test('Can unmount existing rendered content using test helpers.', () => {
  expect(getRoots().length).toBe(0)

  const { serialized } = render(<p>Hello</p>)

  expect(serialized).toEqual('<body><p>Hello</p></body>')
  expect(getRoots().length).toBe(1)

  clear()

  expect(getRoots().length).toBe(0)
  expect(serializeElement()).toBe('<body></body>')
})

test('Elements can be cloned with cloneElement.', () => {
  expect(cloneElement(<div>test</div>)).toEqual(<div>test</div>)
  const element = <div>test</div>
  const clone = cloneElement(element)
  expect(element).not.toBe(clone)

  expect(cloneElement(element, { className: 'new-class' }).props.className).toBe('new-class')
})

test('Can render markdown.', () => {
  const content = `# Title
Some text here.

## Subtitle

Wait! This is **bold**.`

  const Markdown = () => compiler(content, { createElement })

  const { serialized } = render(
    <div>
      <Markdown />
    </div>,
  )

  expect(serialized).toEqual(
    '<body><div><div><h1 id="title">Title</h1><p>Some text here.</p><h2 id="subtitle">Subtitle</h2><p>Wait! This is <strong>bold</strong>.</p></div></div></body>',
  )
})
