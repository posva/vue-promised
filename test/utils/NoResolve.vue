<template>
  <Promised v-bind="$props">
    <h1>loading</h1>
    <!-- The 'catch' named scoped slots will be used if there is an error -->
    <h1 slot="catch" slot-scope="error">{{ error | errorText }}</h1>
  </Promised>
</template>

<script>
import common from './common'

export default {
  mixins: [common],
}
</script>
