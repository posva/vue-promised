import { assert } from './util'

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
    if (this.$scopedSlots.combined) {
      const node = this.$scopedSlots.combined({
        isPending: !this.resolved,
        isDelayOver: this.isDelayElapsed,
        data: this.data,
        error: this.error,
      })
      assert(
        (Array.isArray(node) && node.length === 1) || node,
        'Provided "combined" scoped-slot cannot be empty and must contain one single children'
      )
      return Array.isArray(node) ? node[0] : node
    }

    if (this.error) {
      const slot = this.$scopedSlots.rejected || this.$slots.rejected
      assert(slot, 'No slot "rejected" provided. Cannot display the error')
      const node = slot(this.error)
      assert(
        (Array.isArray(node) && node.length) || node,
        'Provided slot "rejected" is empty. Cannot display the error'
      )
      return Array.isArray(node) ? convertVNodeArray(h, this.tag, node) : node
    }

    const defaultSlot = this.$slots.default
    if (this.resolved) {
      if (this.$scopedSlots.default) {
        const node = this.$scopedSlots.default(this.data)
        assert(
          (Array.isArray(node) && node.length) || node,
          'Provided default scoped-slot is empty. Cannot display the data'
        )
        return Array.isArray(node) ? convertVNodeArray(h, this.tag, node) : node
      }
      assert(defaultSlot, 'No default slot provided. Cannot display the data')
      assert(defaultSlot.length, 'Provided default slot is empty. Cannot display the data')
      return convertVNodeArray(h, this.tag, defaultSlot)
    }

    if (!this.isDelayElapsed) return h()

    const pendingSlot = this.$slots.pending
    assert(pendingSlot, 'No "pending" slot provided. Cannot display pending state')
    assert(pendingSlot.length, 'Provided "pending" slot is empty. Cannot display pending state')
    return convertVNodeArray(h, this.tag, pendingSlot)
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
              this.data = data
              this.resolved = true
            }
          })
          .catch(err => {
            if (this.promise === promise) {
              this.error = err
              this.resolved = true
            }
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
