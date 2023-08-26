// @vitest-environment happy-dom

import { test, expect } from 'vitest'
import { run } from './mock'
import * as React from '../index'

test('Renders a basic component.', () => {
  function Counter() {
    const [state, setState] = React.useState(1)
    return <h1 onClick={() => setState((c) => c + 1)}>Count: {state}</h1>
  }

  const element = <Counter />
  React.render(element)

  expect(React.getRoot()).toBe(null)

  run() // requestIdleCallback

  expect(React.getRoot()).toBeDefined()
})
