import { assert } from './util'

const OldPromised = {
  name: 'Promised',
  props: {
    promise: {
      // allow polyfied Promise
      validator: p => p && typeof p.then === 'function' && typeof p.catch === 'function',
    },
    promises: Array,
    pendingDelay: {
      type: [Number, String],
      default: 200,
    },
  },

  data: () => ({
    resolved: false,
    data: null,
    error: null,

    isDelayElapsed: false,
  }),

  render (h) {
    if (this.error instanceof Error || (this.error && this.error.length)) {
      assert(
        this.$scopedSlots && this.$scopedSlots.catch,
        'Provide exactly one scoped slot named "catch" for the rejected promise'
      )
      return this.$scopedSlots.catch(this.error)
    } else if (this.resolved) {
      const slot = this.$scopedSlots.default || this.$scopedSlots.then
      assert(
        this.$scopedSlots && slot,
        'Provide exactly one default/then scoped slot for the resolved promise'
      )
      return slot.call(this, this.data)
    } else if (this.isDelayElapsed) {
      assert(
        (this.$slots.default && this.$slots.default.length === 1) ||
          (this.$slots.pending && this.$slots.pending.length === 1),
        'Provide exactly one default/pending slot with no `slot-scope` for the pending promise'
      )
      return this.$slots.default ? this.$slots.default[0] : this.$slots.pending[0]
    }

    // do not render anything
    return h()
  },

  watch: {
    promise: {
      handler (promise) {
        if (!promise) return
        this.resolved = false
        this.error = null
        this.setupDelay()
        promise
          .then(data => {
            if (this.promise === promise) {
              this.resolved = true
              this.data = data
            }
          })
          .catch(err => {
            if (this.promise === promise) this.error = err
          })
      },
      immediate: true,
    },

    promises: {
      handler (promises, oldPromises) {
        if (!promises) return
        if (promises !== oldPromises) {
          // reset the map if there's a new array
          this.ongoingPromises = new Map()
          this.resolved = false
          this.error = []
          this.data = []
          this.setupDelay()
        }
        // do not listen for already set up promises
        promises.filter(p => !this.ongoingPromises.has(p)).forEach(p => {
          this.ongoingPromises.set(p, true)
          p.then(data => {
            if (this.promises === promises) {
              this.resolved = true
              this.data.push(data)
            }
          }).catch(err => {
            if (this.promises === promises) this.error.push(err)
          })
        })
      },
      immediate: true,
    },
  },

  methods: {
    setupDelay () {
      if (this.pendingDelay > 0) {
        this.isDelayElapsed = false
        if (this.timerId) clearTimeout(this.timerId)
        this.timerId = setTimeout(() => (this.isDelayElapsed = true), this.pendingDelay)
      } else {
        this.isDelayElapsed = true
      }
    },
  },
}

export default OldPromised

export const Promised = {
  props: {
    tag: {
      type: String,
      default: 'span',
    },
    promise: {
      // allow polyfied Promise
      validator: p => p && typeof p.then === 'function' && typeof p.catch === 'function',
    },
    pendingDelay: {
      type: [Number, String],
      default: 200,
    },
  },

  data: () => ({
    resolved: false,
    data: null,
    error: null,

    isDelayElapsed: false,
  }),

  render (h) {
    if (this.error) {
      const node = this.$scopedSlots.rejected(this.error)
      // errorNode is either a node or an array of nodes
      if (!node && !node.length) throw this.error
      return Array.isArray(node) ? convertVNodeArray(h, this.tag, node) : node
    }

    const defaultSlot = this.$slots.default
    if (this.resolved) {
      if (this.$scopedSlots.default) {
        const node = this.$scopedSlots.default(this.data)
        return Array.isArray(node) ? convertVNodeArray(h, this.tag, node) : node
      } else if (defaultSlot && defaultSlot.length) {
        return convertVNodeArray(h, this.tag, defaultSlot)
      }
    }

    if (!this.isDelayElapsed) return h()

    const pendingSlot = this.$slots.pending
    if (pendingSlot && pendingSlot.length) {
      return convertVNodeArray(h, this.tag, pendingSlot)
    }
    // TODO assert error on default case
    console.log('NOOOO')
    return h()
  },

  watch: {
    promise: {
      handler (promise) {
        if (!promise) return
        this.resolved = false
        this.error = null
        this.setupDelay()
        promise
          .then(data => {
            if (this.promise === promise) {
              this.resolved = true
              this.data = data
            }
          })
          .catch(err => {
            if (this.promise === promise) this.error = err
          })
      },
      immediate: true,
    },
  },

  methods: {
    setupDelay () {
      if (this.pendingDelay > 0) {
        this.isDelayElapsed = false
        if (this.timerId) clearTimeout(this.timerId)
        this.timerId = setTimeout(() => (this.isDelayElapsed = true), this.pendingDelay)
      } else {
        this.isDelayElapsed = true
      }
    },
  },
}

function convertVNodeArray (h, wrapperTag, nodes) {
  if (nodes.length > 1 || !nodes[0].tag) return h(wrapperTag, {}, nodes)
  return nodes[0]
}
