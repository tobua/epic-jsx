export function mapNestedArray(array: any[], predicate: Function) {
  return array.map((item) => {
    if (Array.isArray(item)) {
      return mapNestedArray(item, predicate)
    }

    return predicate(item)
  })
}
