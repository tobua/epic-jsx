import './helper'
import { afterEach, expect, test } from 'bun:test'
import { type Component, unmountAll } from '../index'
import { render, run, serializeElement } from '../test'

afterEach(unmountAll)

test('Fragments are properly cleaned up.', () => {
  let context: Component
  let stage = 0

  function Component(this: Component) {
    context = this

    if (stage === 4) {
      return null
    }

    if (stage === 3) {
      return (
        <>
          <i />
          <p />
        </>
      )
    }

    if (stage === 2) {
      return (
        <>
          <p />
        </>
      )
    }

    if (stage === 1) {
      return null
    }

    return (
      <>
        <i />
        <p />
      </>
    )
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual('<body><i></i><p></p></body>')

  stage = 1
  context.rerender()
  run()

  expect(serializeElement()).toEqual('<body></body>')

  stage = 2
  context.rerender()
  run()

  expect(serializeElement()).toEqual('<body><p></p></body>')

  stage = 3
  context.rerender()
  run()

  expect(serializeElement()).toEqual('<body><i></i><p></p></body>')

  stage = 4
  context.rerender()
  run()

  expect(serializeElement()).toEqual('<body></body>')
})
