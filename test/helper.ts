import { getRoot } from '../index'

export const unmount = () => {
  const root = getRoot()

  if (root && root.unmount) {
    root.unmount()
  }
}
