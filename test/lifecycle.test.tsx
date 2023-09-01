// @vitest-environment happy-dom

import { test, expect, afterEach } from 'vitest'
import { render, run, serializeElement } from '../test'
import * as React from '../index'
import { unmount } from './helper'

afterEach(unmount)

test('Can trigger a component rerender.', () => {
  let count = 0
  function Component(this: React.Component) {
    return (
      <div>
        Count: {count}
        <button
          type="button"
          onClick={() => {
            count += 1
            this.rerender()
          }}
        >
          Rerender
        </button>
      </div>
    )
  }

  const { serialized, tree } = render(<Component />)

  expect(serialized).toEqual(
    '<body><div>Count: 0<button type="button">Rerender</button></div></body>'
  )

  const button = tree.children[0].children[0].children[2].getElement() as HTMLButtonElement

  button.click()
  expect(count).toBe(1) // click increments and calls rerender (without immediate effect)

  expect(serializeElement()).toEqual(
    '<body><div>Count: 0<button type="button">Rerender</button></div></body>'
  )

  run()

  expect(serializeElement()).toEqual(
    '<body><div>Count: 1<button type="button">Rerender</button></div></body>'
  )
})
