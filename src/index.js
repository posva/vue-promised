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
      return this.$scopedSlots.error(this.error)
    } else if (this.resolved) {
      return this.$scopedSlots.default(this.data)
    } else if (this.$slots.default && this.$slots.default.length>0){
      return this.$slots.default[0]
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
