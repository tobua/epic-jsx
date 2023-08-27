export const serializeDocumentNode = (node: Element = document.body) => {
  const serializer = new XMLSerializer()
  return serializer.serializeToString(node)
}
