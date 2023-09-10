import { getRoot } from '../index'

export const unmount = () => {
  const root = getRoot()

  if (root && root.unmount) {
    root.unmount()
  }
}

export function mapNestedArray(array: any[], predicate: Function) {
  return array.map((item) => {
    if (Array.isArray(item)) {
      return mapNestedArray(item, predicate)
    }

    return predicate(item)
  })
}
