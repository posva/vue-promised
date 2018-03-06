export function assert (condition, message) {
  if (!condition) {
    throw new Error(`[vue-promised] ${message}`)
  }
}
