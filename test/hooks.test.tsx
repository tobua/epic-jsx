// @vitest-environment happy-dom

import { test, expect, afterEach } from 'vitest'
import { run } from './mock'
import * as React from '../index'
import { readableTree, serializeDocumentNode, unmount } from './helper'

afterEach(unmount)

test('Renders a basic component and rerenders after state update.', () => {
  function Counter() {
    const [state, setState] = React.useState(1)
    return (
      <button type="button" onClick={() => setState((value) => value + 1)}>
        Count: {state}
      </button>
    )
  }

  React.render(<Counter />)

  run()

  expect(serializeDocumentNode()).toEqual('<body><button type="button">Count: 1</button></body>')

  const tree = readableTree(React.getRoot())

  expect(tree.tag).toBe('body')
  expect(tree.child?.child?.tag).toBe('button')

  // @ts-ignore
  const heading = tree.child.child.getElement() as HTMLButtonElement

  heading.click()
  // run() TODO

  expect(serializeDocumentNode()).toEqual('<body><button type="button">Count: 1</button></body>')
})
