/* global Vue, VuePromised, axios, PrismComponent */
// eslint-disable-next-line
const delay = (t, value) => new Promise(r => setTimeout(r.bind(null, value), t))

const xkcd = axios.create({
  baseURL: 'https://cors.now.sh/https://xkcd.com',
})

function getRandomImage (max) {
  return xkcd.get(`/${Math.round(Math.random() * max) + 1}/info.0.json`)
    .then(res => res.data)
}

Vue.component('DemoCode', {
  template: '#demo-code',
  props: {
    code: String,
  },

  data () {
    return {
      showCode: false,
    }
  },

  computed: {
    seeLabel () {
      return this.showCode ? 'See demo' : 'See code'
    },
  },

  components: { Prism: PrismComponent },
})

// eslint-disable-next-line
new Vue({
  el: '#app',

  data: () => ({
    promise: null,
    promises: [],

    samples: {
      single: `\
<Promised :promise="promise">
  <div class="loading-spinner"></div>
  <figure slot-scope="data">
    <img :alt="data.transcript" :src="data.img"/>
    <figcaption>#{{ data.num }} - {{ data.title }}</figcaption>
  </figure>
  <div slot="catch" slot-scope="error" class="message--error">
    Error: {{ error.message }}
  </div>
</Promised>
`,
      multiple: `\
<Promised :promises="promises">
  <div class="loading-spinner"></div>
  <div slot-scope="items">
    <h3>{{ items.length }} promises resolved</h3>
    <figure v-for="item in items">
      <img :alt="item.transcript" :src="item.img"/>
      <figcaption>#{{ item.num }} - {{ item.title }}</figcaption>
    </figure>
  </div>
  <div slot="catch" slot-scope="errors" class="tip--error">
    Failed {{ errors.length }} promises
  </div>
</Promised>
`
    },
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
