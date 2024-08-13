import './helper'
import { afterEach, expect, test } from 'bun:test'
import { type JSX, cloneElement, getRoots, unmountAll } from '../index'
import { clear, render, serializeElement } from '../test'

afterEach(unmountAll)

test('Can render SVG as JSX.', () => {
  expect(getRoots().length).toBe(0)

  const { serialized } = render(
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width={100} height={100}>
      <circle cx="50" cy="50" r="40" fill="red" />
    </svg>,
  )

  expect(serialized).toEqual(
    '<body><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"></circle></svg></body>',
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
