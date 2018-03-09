import { assert } from './util'

export default {
  name: 'Promised',
  props: {
    promise: Promise,
    promises: Array,
  },

  data: () => ({
    resolved: false,
    data: null,
    error: null,
  }),

  render (h) {
    if (this.error instanceof Error || (this.error && this.error.length)) {
      assert(
        this.$scopedSlots && this.$scopedSlots.error,
        'Provide exactly one scoped slot named "error" for the rejected promise'
      )
      return this.$scopedSlots.error(this.error)
    } else if (this.resolved) {
      assert(
        this.$scopedSlots && this.$scopedSlots.default,
        'Provide exactly one default scoped slot for the resolved promise'
      )
      return this.$scopedSlots.default(this.data)
    } else {
      assert(
        (this.$slots.default && this.$slots.default.length === 1) ||
        (this.$slots.pending && this.$slots.pending.length === 1),
        'Provide exactly one default/pending slot with no `slot-scope` for the pending promise'
      )
      return this.$slots.default ? this.$slots.default[0] : this.$slots.pending[0]
    }
  },

  watch: {
    promise: {
      handler (promise) {
        if (!promise) return
        this.resolved = false
        this.error = null
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
      handler (promises) {
        if (!promises) return
        this.resolved = false
        this.error = []
        this.data = []
        promises.forEach(p => {
          p
            .then(data => {
              if (this.promises === promises) {
                this.resolved = true
                this.data.push(data)
              }
            })
            .catch(err => {
              if (this.promises === promises) this.error.push(err)
            })
        })
      },
      immediate: true,
    },
  },
}
