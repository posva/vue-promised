<template>
  <Promised v-bind="$props">
    <h1>loading</h1>
    <!-- The default scoped slots will be used as the result -->
    <h1 slot-scope="data">{{ data }}</h1>
    <!-- The 'error' named scoped slots will be used if there is an error -->
    <h1 slot="error" slot-scope="error">{{ error.message }}</h1>
  </Promised>
</template>

<script>
import Promised from '../../src'

export default {
  props: ['promise', 'promises'],
  components: { Promised },
}
</script>
