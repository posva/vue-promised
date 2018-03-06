<template>
  <Promised v-bind="$props">
    <h1>loading</h1>
    <!-- The default scoped slots will be used as the result -->
    <h1 slot-scope="data">{{ data | text }}</h1>
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
  },
  components: { Promised },
}
</script>
