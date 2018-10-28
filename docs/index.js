/* global Vue, VuePromised, axios, PrismComponent */
// eslint-disable-next-line
const delay = (t, value) => new Promise(r => setTimeout(r.bind(null, value), t))

const xkcd = axios.create({
  baseURL: 'https://cors-now-lbiomgdmwp.now.sh/https://xkcd.com',
})

function getRandomImage (max) {
  return xkcd.get(`/${Math.round(Math.random() * max) + 1}/info.0.json`).then(res => res.data)
}

Vue.component('DemoCode', {
  components: { Prism: PrismComponent },
  props: {
    code: {
      type: String,
      required: true,
    },
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
  template: '#demo-code',
})

// eslint-disable-next-line
new Vue({
  el: '#app',

  components: { Promised: VuePromised.Promised },

  data: () => ({
    promise: null,

    samples: {
      single: `\
<Promised :promise="promise">
  <div slot="pending" class="loading-spinner"></div>
  <figure slot-scope="data">
    <img :alt="data.transcript" :src="data.img"/>
    <figcaption>#{{ data.num }} - {{ data.title }}</figcaption>
  </figure>
  <div slot="rejected" slot-scope="error" class="message--error">
    Error: {{ error.message }}
  </div>
</Promised>
`,
      combined: `\
<promised :promise="promise" :pending-delay="1000">
  <pre slot="combined" slot-scope="props" class="code">
    isPending: {{ props.isPending }}
    isDelayOver:{{ props.isDelayOver }}
    error:{{ props.error && props.error.message }}
    data: {{ props.data }}
  </pre>
</promised>
`,
    },
  }),

  created () {
    xkcd.get('/info.0.json').then(res => {
      this.max = res.data.num
      this.promise = getRandomImage(this.max)
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
  },
})
