<template>
  <div>
    <button @click="trySuccess">Success promise</button>
    <button @click="tryError">Fail promise</button>
    <PromiseBlock :promise="promise">
      <h1>loading</h1>
      <h1 slot-scope="data">Success!</h1>
      <h1 slot="error" slot-scope="error">Error: {{ error.message }}</h1>
    </PromiseBlock>
    <PromiseBlock :promises="promises">
      <h2>Wating for first result</h2>
      <h2 slot-scope="data">
        Succeeded {{ data.length }} times
      </h2>
      <h2 slot="error" slot-scope="errors">
        Failed {{ errors.length }} times
      </h2>
    </PromiseBlock>
  </div>
</template>

<script>
import PromiseBlock from '../src';
const delay = t => new Promise(r => setTimeout(r, t));

export default {
  data: () => ({
    promise: delay(1000),
    promises: [],
  }),

  methods: {
    trySuccess() {
      this.promise = delay(500);
      this.promises.push(this.promise);
    },
    tryError() {
      this.promise = delay(500).then(() => {
        throw new Error('🔥');
      });
      this.promises.push(this.promise);
    },
  },

  components: { PromiseBlock },
};
</script>
