<template>
  <article>
    <h5>
      <a href="#" role="button" @click.prevent="showCode = !showCode">{{
        seeLabel
      }}</a>
    </h5>
    <div class="demo__demo" v-if="!showCode">
      <slot />
    </div>
    <div class="demo__code" v-else>
      <!-- <Prism language="html" :code="code" /> -->
    </div>
  </article>
</template>

<script>
export default {
  // components: { Prism: PrismComponent },

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
