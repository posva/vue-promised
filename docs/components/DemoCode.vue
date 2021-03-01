<template>
  <article>
    <!-- FIXME: vue prism component not working -->
    <h5 v-if="false">
      <a href="#" role="button" @click.prevent="showCode = !showCode">{{
        seeLabel
      }}</a>
    </h5>
    <div class="demo__demo" v-if="!showCode">
      <slot />
    </div>
    <div class="demo__code" v-else>
      <Prism language="html" :code="code" />
    </div>
  </article>
</template>

<script>
import Prism from 'vue-prism-component'

export default {
  components: { Prism },

  props: {
    code: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      showCode: false,
    }
  },

  computed: {
    seeLabel() {
      return this.showCode ? 'See demo' : 'See code'
    },
  },
}
</script>
