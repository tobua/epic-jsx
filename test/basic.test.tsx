// @vitest-environment happy-dom

import { test, expect } from 'vitest'
import { run } from './mock'
import * as React from '../index'

test('runs', () => {
  function Counter() {
    const [state, setState] = React.useState(1)
    return <h1 onClick={() => setState((c) => c + 1)}>Count: {state}</h1>
  }

  const element = <Counter />
  React.render(element)

  run() // requestIdleCallback

  expect(React.getRoot()).toBeDefined()
})
