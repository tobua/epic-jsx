import './helper'
import { expect, test } from 'bun:test'
import type React from '../index'

test('Types are available.', () => {
  const node: React.ReactNode = <p>test</p>
  expect(node).toBeDefined()
})
