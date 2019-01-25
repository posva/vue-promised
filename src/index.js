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

function getSlotVNode (instance, h, slotName, VNodeData) {
  if (instance.$scopedSlots && instance.$scopedSlots[slotName]) {
    const node = instance.$scopedSlots[slotName](VNodeData)
    assert(
      (Array.isArray(node) && node.length) || node,
      `Provided "${slotName}" scoped-slot is empty. Cannot display the data`
    )
    return Array.isArray(node) ? convertVNodeArray(h, instance.tag, node) : node
  }

  const slot = instance.$slots && instance.$slots[slotName]
  assert(slot, `No "${slotName}" slot provided. Cannot display the data`)
  assert(slot.length, `Provided "${slotName}" slot is empty. Cannot display the data`)
  return convertVNodeArray(h, instance.tag, slot)
}