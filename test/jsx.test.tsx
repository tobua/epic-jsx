// @vitest-environment happy-dom

import { test, expect, afterEach } from 'vitest'
import { render } from '../test'
import * as React from '../index'

afterEach(React.unmountAll)

test('Can render SVG as JSX.', () => {
  expect(React.getRoots().length).toBe(0)

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
  expect(React.getRoots().length).toBe(0)

  const { serialized } = render(
    <>
      <p>start</p>
      {undefined}
      {null}
      {false}
      {/* eslint-disable-next-line react/jsx-curly-brace-presence */}
      {''}
      <p>end</p>
      <p>
        Falsy numbers: {undefined}
        {0} {-0} {NaN}
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

