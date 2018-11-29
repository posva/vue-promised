import { assert } from './util'

export const Promised = {
  props: {
    tag: {
      type: String,
      default: 'span',
    },
    promise: {
      // allow polyfied Promise
      validator: p =>
        p &&
                typeof p.then === 'function' &&
                typeof p.catch === 'function',
    },
    pendingDelay: {
      type: [Number, String],
      default: 200,
    },
  },

  data: () => ({
    promise_resolved: false,
    promise_data: null,
    promise_error: null,
    promise_isDelayElapsed: false,
  }),

  render (h) {
    if (this.$scopedSlots.combined) {
      const node = this.$scopedSlots.combined({
        isPending: !this.promise_resolved,
        isDelayOver: this.promise_isDelayElapsed,
        data: this.promise_data,
        error: this.promise_error,
      })
      assert(
        (Array.isArray(node) && node.length === 1) || node,
        'Provided "combined" scoped-slot cannot be empty and must contain one single children'
      )
      return Array.isArray(node) ? node[0] : node
    }

    if (this.promise_error) {
      assert(
        this.$scopedSlots.rejected,
        'No slot "rejected" provided. Cannot display the error'
      )
      const node = this.$scopedSlots.rejected(this.promise_error)
      assert(
        (Array.isArray(node) && node.length) || node,
        'Provided slot "rejected" is empty. Cannot display the error'
      )
      return Array.isArray(node)
        ? convertVNodeArray(h, this.tag, node)
        : node
    }

    const defaultSlot = this.$slots.default
    if (this.promise_resolved) {
      if (this.$scopedSlots.default) {
        const node = this.$scopedSlots.default(this.promise_data)
        assert(
          (Array.isArray(node) && node.length) || node,
          'Provided default scoped-slot is empty. Cannot display the data'
        )
        return Array.isArray(node)
          ? convertVNodeArray(h, this.tag, node)
          : node
      }
      assert(
        defaultSlot,
        'No default slot provided. Cannot display the data'
      )
      assert(
        defaultSlot.length,
        'Provided default slot is empty. Cannot display the data'
      )
      return convertVNodeArray(h, this.tag, defaultSlot)
    }

    if (!this.promise_isDelayElapsed) return h()

    const pendingSlot = this.$slots.pending
    assert(
      pendingSlot,
      'No "pending" slot provided. Cannot display pending state'
    )
    assert(
      pendingSlot.length,
      'Provided "pending" slot is empty. Cannot display pending state'
    )
    return convertVNodeArray(h, this.tag, pendingSlot)
  },

  watch: {
    promise: {
      handler (promise) {
        if (!promise) return
        this.promise_resolved = false
        this.promise_error = null
        this.promise_setupDelay()
        promise
          .then(data => {
            if (this.promise === promise) {
              this.promise_data = data
              this.promise_resolved = true
            }
          })
          .catch(err => {
            if (this.promise === promise) {
              this.promise_error = err
              this.promise_resolved = true
            }
          })
      },
      immediate: true,
    },
  },

  methods: {
    promise_setupDelay () {
      if (this.pendingDelay > 0) {
        this.promise_isDelayElapsed = false
        if (this.timerId) clearTimeout(this.timerId)
        this.timerId = setTimeout(
          () => (this.promise_isDelayElapsed = true),
          this.pendingDelay
        )
      } else {
        this.promise_isDelayElapsed = true
      }
    },
  },
}

function convertVNodeArray (h, wrapperTag, nodes) {
  if (nodes.length > 1 || !nodes[0].tag) return h(wrapperTag, {}, nodes)
  return nodes[0]
}
