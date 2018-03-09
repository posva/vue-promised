import Promised from '../../src'

export default {
  props: ['promise', 'promises'],
  filters: {
    text (data) {
      return Array.isArray(data) ? data.join(',') : data
    },
    errorText (data) {
      return Array.isArray(data) ? data.map(e => e.message).join(',') : data.message
    },
  },
  components: { Promised },
}
