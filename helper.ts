import { create } from 'logua'

export const log = create('epic-jsx', 'blue')

export function shallowArrayEqual(first: any[], second: any[]) {
  if (first.length !== second.length) {
    return false
  }

  for (let index = 0; index < first.length; index += 1) {
    if (first[index] !== second[index]) {
      return false
    }
  }

  return true
}
