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
    vue_promised_resolved: false,
    vue_promised_data: null,
    vue_promised_error: null,
    isDelayElapsed: false,
  }),

  render (h) {
    if (this.$scopedSlots.combined) {
      const node = this.$scopedSlots.combined({
        isPending: !this.vue_promised_resolved,
        isDelayOver: this.isDelayElapsed,
        data: this.vue_promised_data,
        error: this.vue_promised_error,
      })
      assert(
        (Array.isArray(node) && node.length === 1) || node,
        'Provided "combined" scoped-slot cannot be empty and must contain one single children'
      )
      return Array.isArray(node) ? node[0] : node
    }

    if (this.vue_promised_error) {
      assert(
        this.$scopedSlots.rejected,
        'No slot "rejected" provided. Cannot display the error'
      )
      const node = this.$scopedSlots.rejected(this.vue_promised_error)
      assert(
        (Array.isArray(node) && node.length) || node,
        'Provided slot "rejected" is empty. Cannot display the error'
      )
      return Array.isArray(node)
        ? convertVNodeArray(h, this.tag, node)
        : node
    }

    const defaultSlot = this.$slots.default
    if (this.vue_promised_resolved) {
      if (this.$scopedSlots.default) {
        const node = this.$scopedSlots.default(this.vue_promised_data)
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

    if (!this.isDelayElapsed) return h()

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
        this.vue_promised_resolved = false
        this.vue_promised_error = null
        this.setupDelay()
        promise
          .then(data => {
            if (this.promise === promise) {
              this.vue_promised_data = data
              this.vue_promised_resolved = true
            }
          })
          .catch(err => {
            if (this.promise === promise) {
              this.vue_promised_error = err
              this.vue_promised_resolved = true
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
        this.timerId = setTimeout(
          () => (this.isDelayElapsed = true),
          this.pendingDelay
        )
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
