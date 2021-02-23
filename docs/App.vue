<template>
  <header>
    <h1>VuePromised</h1>
    <nav>
      <a href="https://github.com/posva/vue-promised#usage">Docs</a> /
      <a href="https://github.com/posva/vue-promised#api-reference">API</a>
    </nav>
  </header>

  <main>
    <section>
      <h2>Single promise</h2>

      <section class="siimple-content--fluid">
        <button :disabled="state !== 'ready'" @click="trySuccess">
          {{ buttonText }}
        </button>
        <button @click="tryError">Purposely fail</button>
      </section>

      <demo-code :code="samples.single" class="relative">
        <promised :promise="promise">
          <template #pending>
            <div class="spinner"></div>
          </template>

          <template #default="joke">
            <blockquote :key="joke.id">
              <i>{{ joke.setup }}</i>
              <br />
              <br />
              <p class="appear" @animationend="state = 'ready'">
                {{ joke.punchline }}
              </p>
            </blockquote>
          </template>

          <template #rejected="error">
            <div class="siimple-alert siimple-alert--orange">
              Error: {{ error.message }}
            </div>
          </template>
        </promised>
      </demo-code>

      <section>
        <h2>Combined slot</h2>

        <p>
          Here is the same promised displayed by using the
          <code
            ><a href="https://github.com/posva/vue-promised#context-object"
              >combined</a
            ></code
          >
          slot:
        </p>

        <demo-code :code="samples.combined">
          <promised
            :promise="promise"
            :pending-delay="1000"
            v-slot:combined="props"
          >
            <pre class="code">
isPending: {{ props.isPending }}
isDelayOver:{{ props.isDelayOver }}
error:{{ props.error && props.error.message }}
data: {{ props.data }}</pre
            >
          </promised>
        </demo-code>
      </section>
    </section>

    <footer align="center">
      Made by Eduardo San Martin Morote
      <a href="https://twitter.com/posva">@posva</a>
    </footer>
  </main>
</template>

<script lang="ts">
import { Promised } from '../src'
import { getRandomJoke } from './api/jokes'

const texts = {
  loading: 'Fetching the joke...',
  waiting: 'Wait for it...',
  ready: 'Another one?',
}

export default {
  components: { Promised: Promised },

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
}
</script>

<style>
@keyframes appear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.appear {
  opacity: 0;
  animation: appear 1s ease-in-out 3s;
  animation-fill-mode: forwards;
}
</style>
