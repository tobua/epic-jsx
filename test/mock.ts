// eslint-disable-next-line import/no-mutable-exports
export let run: Function

global.requestIdleCallback = (callback: IdleRequestCallback) => {
  run = () => callback({ timeRemaining: () => 10, didTimeout: false })
  return 0
}
