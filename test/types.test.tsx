import './helper'
import { expect, test } from 'bun:test'
import type React from '../index'

test('Types are available.', () => {
  const node: React.ReactNode = <p>test</p>
  expect(node).toBeDefined()
})

test('Props are compatible with other changes.', () => {
  const props: React.ComponentProps<'button'> = { 'aria-label': 'my-button' }
  const component = <button {...props}>My Button</button>
  expect(component).toBeDefined()

  const inputProps: React.JSX.IntrinsicElements['input'] = { value: 'name' }
  const form = (
    <form>
      <input placeholder="Hey" {...inputProps} />
    </form>
  )
  expect(form).toBeDefined()
})
