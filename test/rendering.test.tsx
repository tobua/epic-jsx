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

test('Fragments and other structures are properly cleaned up.', () => {
  let context: Component
  let stage = 0

  function Component(this: Component) {
    context = this

    if (stage === 4) {
      return <div>stage four</div>
    }

    if (stage === 3) {
      return (
        <>
          <div id="second">second</div>
          <button type="button" class="third">
            third
          </button>
          <div id="first">first</div>
        </>
      )
    }

    if (stage === 2) {
      return <div>stage two</div>
    }

    if (stage === 1) {
      return (
        <>
          <div id="first">first</div>
          <div id="second">second</div>
          <button type="button" class="third">
            third
          </button>
        </>
      )
    }

    return <div>initial</div>
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual('<body><div>initial</div></body>')

  stage = 1
  context.rerender()
  run()

  expect(serializeElement()).toEqual(
    '<body><div id="first">first</div><div id="second">second</div><button type="button" class="third">third</button></body>',
  )

  stage = 2
  context.rerender()
  run()

  expect(serializeElement()).toEqual('<body><div>stage two</div></body>')
})

test('Fragments and other structures are properly cleaned up.', () => {
  let context: Component
  let stage = 0

  function Component(this: Component) {
    context = this

    if (stage === 2) {
      return <div>after</div>
    }

    if (stage === 1) {
      return (
        <>
          <p>Nested Route: "Route!"</p>
          <a
            href="/"
            style={{
              textDecoration: 'none',
            }}
            onClick={(event) => {
              event.preventDefault()
            }}
          >
            Go to Homepage
          </a>
        </>
      )
    }

    return <div>initial</div>
  }

  const { serialized } = render(<Component />)

  expect(serialized).toEqual('<body><div>initial</div></body>')

  stage = 1
  context.rerender()
  run()

  expect(serializeElement()).toEqual(
    '<body><p>Nested Route: "Route!"</p><a href="/" style="text-decoration: none;">Go to Homepage</a></body>',
  )

  stage = 2
  context.rerender()
  run()

  expect(serializeElement()).toEqual('<body><div>after</div></body>')
})
