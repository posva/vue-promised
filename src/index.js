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
        p && typeof p.then === 'function' && typeof p.catch === 'function',
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
        (Array.isArray(node) && node.length) || node,
        'Provided "combined" scoped slot cannot be empty'
      )
      return Array.isArray(node) ? convertVNodeArray(h, this.tag, node) : node
    }

    if (this.error) {
      return getSlotVNode(this, h, 'rejected', this.error)
    }

    if (this.resolved) {
      return getSlotVNode(this, h, 'default', this.data)
    }

    if (!this.isDelayElapsed) return h()

    return getSlotVNode(this, h, 'pending', this.data)
  },

  watch: {
    promise: {
      handler (promise) {
        this.resolved = false
        this.error = null
        if (!promise) {
          this.data = null
          this.isDelayElapsed = false
          if (this.timerId) clearTimeout(this.timerId)
          this.timerId = null
          return
        }
        this.setupDelay()
        promise
          .then(data => {
            // ensure we are dealing with the same promise
            if (this.promise === promise) {
              this.data = data
              this.resolved = true
            }
          })
          .catch(err => {
            // ensure we are dealing with the same promise
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
  // for arrays and single text nodes
  if (nodes.length > 1 || !nodes[0].tag) return h(wrapperTag, {}, nodes)
  return nodes[0]
}

function getSlotVNode (vm, h, slotName, data) {
  // use scopedSlots if available
  if (vm.$scopedSlots[slotName]) {
    const node = vm.$scopedSlots[slotName](data)
    assert(
      (Array.isArray(node) && node.length) || node,
      `Provided "${slotName}" scoped-slot is empty`
    )
    return Array.isArray(node) ? convertVNodeArray(h, vm.tag, node) : node
  }

  const slot = vm.$slots[slotName]
  assert(slot, `No slot "${slotName}" provided`)
  // 2.5.x compatibility
  assert(slot.length, `Provided "${slotName}" slot is empty`)
  return convertVNodeArray(h, vm.tag, slot)
}
