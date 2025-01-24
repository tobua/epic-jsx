import './helper'
import { expect, test } from 'bun:test'
import { debounce } from '../index'

const wait = (duration = 0.01) => new Promise((done) => setTimeout(done, duration * 1000))

test('Debounces calls in short intervals.', async () => {
  const result = { calls: 0, value: 0 }
  const double = (value: number) => {
    result.value = value
    result.calls += 1
  }
  const debouncedDouble = debounce(double, 300)

  debouncedDouble(1)
  debouncedDouble(2)
  debouncedDouble(3)

  await wait(0.5)

  expect(result).toEqual({ calls: 1, value: 3 })
})
