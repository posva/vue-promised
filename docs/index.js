/* global Vue, VuePromised, axios */
// eslint-disable-next-line
const delay = (t, value) => new Promise(r => setTimeout(r.bind(null, value), t))

const xkcd = axios.create({
  baseURL: 'https://cors.now.sh/https://xkcd.com',
})

function getRandomImage (max) {
  return xkcd.get(`/${Math.round(Math.random() * max) + 1}/info.0.json`)
    .then(res => res.data)
}

// eslint-disable-next-line
new Vue({
  el: '#app',

  data: () => ({
    promise: null,
    promises: [],
  }),

  created () {
    xkcd.get('/info.0.json').then(res => {
      this.max = res.data.num
      this.promise = getRandomImage(this.max)
      this.promises.push(this.promise)
    })
  },

  methods: {
    trySuccess () {
      this.promise = getRandomImage(this.max)
    },
    tryError () {
      this.promise = delay(500).then(() => {
        return Promise.reject(new Error('🔥'))
      })
    },
    tryMultipleSuccess () {
      this.promises.unshift(getRandomImage(this.max))
    },
    tryMultipleError () {
      this.promises.push(delay(500).then(() => {
        throw new Error('🔥')
      }))
    },
    resetMultiple () {
      this.promises = []
    },

    resetErrors () {
      this.$refs.multiplePromised.errors = []
    },
  },

  components: { Promised: VuePromised },
})
