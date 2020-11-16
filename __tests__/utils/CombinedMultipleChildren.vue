<template>
  <Promised v-bind="$props" v-slot:combined="props">
    <span>{{ props.isPending }}</span>
    <span>{{ props.isDelayOver }}</span>
    <span>{{ props.data }}</span>
    <span>{{ props.error }}</span>
  </Promised>
</template>

<script>
import { Promised } from "../../src";

export default {
  props: ["promise", "pendingDelay", "tag"],
  components: { Promised }
};
</script>
