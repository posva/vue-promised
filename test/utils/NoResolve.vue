<template>
  <Promised v-bind="$props">
    <h1>loading</h1>
    <!-- The 'error' named scoped slots will be used if there is an error -->
    <h1 slot="error" slot-scope="error">{{ error | errorText }}</h1>
  </Promised>
</template>

<script>
import Promised from '../../src'

export default {
  props: ['promise', 'promises'],
  filters: {
    text(data) {
      return Array.isArray(data) ? data.join(',') : data
    },
    errorText(data) {
      return Array.isArray(data) ? data.map(e => e.message).join(',') : data.message
    },
  },
  components: { Promised },
}
</script>
