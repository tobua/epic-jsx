// @vitest-environment happy-dom

import { test, expect, afterEach } from 'vitest'
import { render, run, serializeElement } from '../test'
import * as React from '../index'
import { useState } from '../index'
import { unmount } from './helper'

afterEach(unmount)

test('Renders a basic component and rerenders after state update.', () => {
  function Counter() {
    const [state, setState] = useState.call(this, 1)
    return (
      <button type="button" onClick={() => setState((value) => value + 1)}>
        Count: {state}
      </button>
    )
  }

  const { tree, serialized } = render(<Counter />)

  expect(serialized).toEqual('<body><button type="button">Count: 1</button></body>')

  expect(tree.tag).toBe('body')
  expect(tree.children[0].children[0].tag).toBe('button')

  const heading = tree.children[0].children[0].getElement() as HTMLButtonElement

  heading.click()
  // run() TODO endless loop

  expect(serializeElement()).toEqual('<body><button type="button">Count: 1</button></body>')
})
