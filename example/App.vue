<template>
  <div>
    <button @click="trySuccess">Success promise</button>
    <button @click="tryError">Fail promise</button>

    <h2>Single promise</h2>
    <Promised :promise="promise">
      <h3>Loading</h3>
      <h3 slot-scope="data">Success!</h3>
      <h3 slot="error" slot-scope="error">Error: {{ error.message }}</h3>
    </Promised>

    <h2>Multiple promises</h2>
    <Promised :promises="promises">
      <h3>Wating for first result</h3>
      <h3 slot-scope="data">
        Succeeded {{ data.length }} promises
      </h3>
      <h3 slot="catch" slot-scope="errors">
        Failed {{ errors.length }} promises
      </h3>
    </Promised>
  </div>
</template>

<script>
import Promised from '../src'
const delay = t => new Promise(r => setTimeout(r, t))

export default {
  data: () => ({
    promise: delay(1000),
    promises: [],
  }),

  methods: {
    trySuccess () {
      this.promise = delay(500)
      this.promises.push(this.promise)
    },
    tryError () {
      this.promise = delay(500).then(() => {
        throw new Error('🔥')
      })
      this.promises.push(this.promise)
    },
  },

  components: { Promised },
}
</script>
