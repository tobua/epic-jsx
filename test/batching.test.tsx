import './helper'
import { afterEach, expect, test } from 'bun:test'
import { type Component, unmountAll, useState } from '../index'
import { render, run, serializeElement } from '../test'

afterEach(unmountAll)

test('Multiple successive rerenders are batched by 300ms.', async () => {
  let context: Component
  let renderCount = 0

  function App(this: Component) {
    context = this
    renderCount++
    return <p>{renderCount}</p>
  }

  const { serialized } = render(<App />)

  expect(serialized).toEqual('<body><p>1</p></body>')

  expect(renderCount).toBe(1)

  context.rerender()
  context.rerender()
  context.rerender()
  run()
  expect(serializeElement()).toEqual('<body><p>2</p></body>')

  expect(renderCount).toBe(2)

  await new Promise((done) => setTimeout(done, 500))
})

test('useState triggered state updates are batched.', async () => {
  let update: ReturnType<typeof useState>
  let renderCount = 0

  function App(this: Component) {
    update = useState(1)
    renderCount++
    return (
      <p>
        {update[0]} {renderCount}
      </p>
    )
  }

  const { serialized } = render(<App />)

  expect(serialized).toEqual('<body><p>1 1</p></body>')

  expect(renderCount).toBe(1)

  update[1](2) // Causes no rerender.
  update[1](3)
  run()
  expect(serializeElement()).toEqual('<body><p>3 2</p></body>')

  expect(renderCount).toBe(2)

  await new Promise((done) => setTimeout(done, 500))
})
