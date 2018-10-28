export function assert (condition, message) {
  if (process.env.NODE_ENV !== 'production' && !condition) {
    // useful when testing
    // console.warn(`[vue-promised] ${message}`)
    throw new Error(`[vue-promised] ${message}`)
  }
}
