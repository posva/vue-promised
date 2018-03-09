<template>
  <div>
    <h2>Single promise</h2>

    <button @click="trySuccess">Success promise</button>
    <button @click="tryError">Fail promise</button>

    <Promised :promise="promise">
      <h3>Loading</h3>
      <h3 slot-scope="data">Success!</h3>
      <h3 slot="catch" slot-scope="error">Error: {{ error.message }}</h3>
    </Promised>

    <h2>Multiple promises</h2>

    <button @click="tryMultipleSuccess">Success promise</button>
    <button @click="tryMultipleError">Fail promise</button>
    <button @click="resetMultiple">Reset promise</button>

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
const delay = (t, value) => new Promise(r => setTimeout(r.bind(null, value), t))

export default {
  data: () => ({
    promise: null,
    promises: [],
  }),

  methods: {
    trySuccess () {
      this.promise = delay(500)
    },
    tryError () {
      this.promise = delay(500).then(() => {
        throw new Error('🔥')
      })
    },
    tryMultipleSuccess () {
      this.promises.push(delay(500))
    },
    tryMultipleError () {
      this.promises.push(delay(500).then(() => {
        throw new Error('🔥')
      }))
    },
    resetMultiple () {
      this.promises = []
    },
  },

  components: { Promised },
}
</script>
