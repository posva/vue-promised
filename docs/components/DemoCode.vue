<script setup lang="ts">
import { ref, computed } from 'vue'
import Prism from 'vue-prism-component'

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
})

const showCode = ref(false)

const seeLabel = computed(() => {
  return showCode.value ? 'See demo' : 'See code'
})
</script>

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
      <prism language="html">{{ props.code }}</prism>
    </div>
  </article>
</template>
