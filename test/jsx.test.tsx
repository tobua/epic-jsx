// @vitest-environment happy-dom

import { test, expect, afterEach } from 'vitest'
import { render } from '../test'
import * as React from '../index'
import { unmount } from './helper'

afterEach(unmount)

test('Can render SVG as JSX.', () => {
  expect(React.getRoots().length).toBe(0)

  const { serialized } = render(
    <svg width="100" height="100">
      <circle cx="50" cy="50" r="40" fill="red" />
    </svg>
  )

  expect(serialized).toEqual(
    '<body><svg width="100" height="100"><circle cx="50" cy="50" r="40" fill="red"></circle></svg></body>'
  )
})
