/* global Vue, VuePromised, axios, PrismComponent */
// eslint-disable-next-line
const delay = (t, value) =>
  new Promise((r) => setTimeout(r.bind(null, value), t))

const jokes = axios.create({
  baseURL: 'https://official-joke-api.appspot.com',
})

function getRandomJoke() {
  return jokes.get(`/jokes/random`).then((res) => res.data)
}

Vue.component('DemoCode', {
  components: { Prism: PrismComponent },
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
  template: '#demo-code',
})

const texts = {
  loading: 'Fetching the joke...',
  waiting: 'Wait for it...',
  ready: 'Another one?',
}

// eslint-disable-next-line
new Vue({
  el: '#app',

  components: { Promised: VuePromised.Promised },

  data: () => ({
    promise: null,
    state: 'waiting',

    samples: {
      single: `\
<Promised :promise="promise">
  <template v-slot:pending>
    <div class="loading-spinner"></div>
  </template>

  <template v-slot="joke">
    <blockquote :key="joke.id">
      <i>{{ joke.setup }}</i>
      <br />
      <br />
      <p class="appear" @animationend="state = 'ready'">{{ joke.punchline }}</p>
    </blockquote>
  </template>

  <template v-slot:rejected="error">
    <div slot="rejected" slot-scope="error" class="message--error">
      Error: {{ error.message }}
    </div>
  </template>
</Promised>
`,
      combined: `\
<promised :promise="promise" :pending-delay="1000" v-slot:combined="props">
  <pre class="code">
    isPending: {{ props.isPending }}
    isDelayOver:{{ props.isDelayOver }}
    error:{{ props.error && props.error.message }}
    data: {{ props.data }}
  </pre>
</promised>
`,
    },
  }),

  created() {
    // when the api takes too much time
    this.max = 2000
    this.trySuccess()
  },

  computed: {
    buttonText() {
      return texts[this.state]
    },
  },

  methods: {
    getRandomJoke() {
      this.state = 'loading'
      this.promise = getRandomJoke()
      this.promise.finally(() => {
        this.state = 'waiting'
      })
    },
    trySuccess() {
      this.getRandomJoke()
    },
    tryError() {
      this.promise = delay(500).then(() => {
        return Promise.reject(new Error('🔥'))
      })
    },
  },
})
