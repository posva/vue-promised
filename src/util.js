export function assert (condition, message) {
  if (!condition) {
    // useful when testing
    // console.warn(`[vue-promised] ${message}`)
    throw new Error(`[vue-promised] ${message}`)
  }
}
