import './helper'
import { afterEach, expect, test } from 'bun:test'
import { getComponentRefsFromTree } from '../helper'
import { Fiber, debounce, unmountAll } from '../index'
import { render } from '../test'

afterEach(unmountAll)

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

test('Can get component refs from tree.', () => {
  const { serialized, root } = render(
    <div>
      <p>Hello</p> World
    </div>,
  )

  expect(serialized).toEqual('<body><div><p>Hello</p> World</div></body>')

  const componentRefs = getComponentRefsFromTree(root, [], false)

  for (const component of componentRefs) {
    if (component instanceof HTMLElement) {
      console.log('tag', component.tagName)
    }

    if (component instanceof Fiber) {
      console.log('type', component.type)
    }
  }

  expect(componentRefs).toHaveLength(2)
})
