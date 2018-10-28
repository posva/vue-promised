<template>
  <Promised v-bind="$props">
    <template slot="pending">pending</template>
    <!-- The default scoped slots will be used as the result -->
    <template slot-scope="data">{{ data }}</template>
    <!-- The 'catch' named scoped slots will be used if there is an error -->
    <template slot="rejected" slot-scope="error">{{ error.message }}</template>
  </Promised>
</template>

<script>
import { Promised } from '../../src'

export default {
  props: ['promise', 'pendingDelay', 'tag'],
  components: { Promised },
}
</script>
