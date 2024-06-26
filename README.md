# vue-promised [![test](https://github.com/posva/vue-promised/actions/workflows/test.yml/badge.svg)](https://github.com/posva/vue-promised/actions/workflows/test.yml) [![npm package](https://badgen.net/npm/v/vue-promised)](https://www.npmjs.com/package/vue-promised) [![codecov](https://codecov.io/gh/posva/vue-promised/graph/badge.svg?token=moy6zDeJRi)](https://codecov.io/gh/posva/vue-promised) [![thanks](https://badgen.net/badge/thanks/%E2%99%A5/ff69b4)](https://github.com/posva/thanks)

> Handle your promises with style 🎀

**Help me keep working on Open Source in a sustainable way 🚀**. Help me with as little as \$1 a month, [sponsor me on Github](https://github.com/sponsors/posva).

<h3 align="center">Silver Sponsors</h3>

<p align="center">
  <a href="https://www.vuemastery.com" title="Vue Mastery" target="_blank">
    <img src="https://www.vuemastery.com/images/vuemastery.svg" alt="Vue Mastery logo" height="48px">
  </a>

  <a href="https://vuetifyjs.com" target="_blank" title="Vuetify">
    <img src="https://cdn.vuetifyjs.com/docs/images/logos/vuetify-logo-light-text.svg" alt="Vuetify logo" height="48px">
  </a>
</p>

<h3 align="center">Bronze Sponsors</h3>

<p align="center">
  <a href="https://www.storyblok.com" target="_blank" title="Storyblok">
    <img src="https://a.storyblok.com/f/51376/3856x824/fea44d52a9/colored-full.png" alt="Storyblok logo" height="32px">
  </a>
</p>

---

## Installation

```bash
npm install vue-promised
# or
yarn add vue-promised
```

If you are using Vue 2, you also need to install `@vue/composition-api`:

```bash
yarn add @vue/composition-api
```

## Motivation

When dealing with asynchronous requests like fetching content through API calls, you may want to display the loading state with a spinner, handle the error and even hide everything until at least 200ms have been elapsed so the user doesn't see a loading spinner flashing when the request takes very little time. This is quite some boilerplate, and you need to repeat this for every request you want:

```vue
<template>
  <div>
    <p v-if="error">Error: {{ error.message }}</p>
    <p v-else-if="isLoading && isDelayElapsed">Loading...</p>
    <ul v-else-if="!isLoading">
      <li v-for="user in data">{{ user.name }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  data: () => ({
    isLoading: false,
    error: null,
    data: null,
    isDelayElapsed: false,
  }),

  methods: {
    fetchUsers() {
      this.error = null
      this.isLoading = true
      this.isDelayElapsed = false
      getUsers()
        .then((users) => {
          this.data = users
        })
        .catch((error) => {
          this.error = error
        })
        .finally(() => {
          this.isLoading = false
        })
      setTimeout(() => {
        this.isDelayElapsed = true
      }, 200)
    },
  },

  created() {
    this.fetchUsers()
  },
}
</script>
```

👉 Compare this to [the version using Vue Promised](#using-pending-default-and-rejected-slots) that handles new promises.

That is quite a lot of boilerplate and it's not handling cancelling on going requests when `fetchUsers` is called again. Vue Promised encapsulates all of that to reduce the boilerplate.

## Migrating from `v1`

Check the [Changelog](https://github.com/posva/vue-promised/blob/v2/CHANGELOG.md#200-2020-11-16) for breaking changes. v2 exposes the same `Promised` and a new `usePromise` function on top of that.

## Usage

### Composition API

```js
import { Promised, usePromise } from 'vue-promised'

Vue.component('Promised', Promised)
export default {
  setup() {
    const usersPromise = ref(fetchUsers())
    const promised = usePromise(usersPromise)

    return {
      ...promised,
      // spreads the following properties:
      // data, isPending, isDelayElapsed, error
    }
  },
}
```

### Component

Vue Promised also exposes the same API via a component named `Promised`.
In the following examples, `promise` is a Promise but can initially be `null`. `data` contains the result of the promise. You can of course name it the way you want:

#### Using `pending`, `default` and `rejected` slots

```vue
<template>
  <Promised :promise="usersPromise">
    <!-- Use the "pending" slot to display a loading message -->
    <template v-slot:pending>
      <p>Loading...</p>
    </template>
    <!-- The default scoped slot will be used as the result -->
    <template v-slot="data">
      <ul>
        <li v-for="user in data">{{ user.name }}</li>
      </ul>
    </template>
    <!-- The "rejected" scoped slot will be used if there is an error -->
    <template v-slot:rejected="error">
      <p>Error: {{ error.message }}</p>
    </template>
  </Promised>
</template>

<script>
export default {
  data: () => ({ usersPromise: null }),

  created() {
    this.usersPromise = this.getUsers()
  },
}
</script>
```

Note the `pending` slot will by default, display after a 200ms delay. This is a reasonable default to avoid layout shifts when API calls are fast enough. The perceived speed is also higher. You can customize it with the `pendingDelay` prop.

The `pending` slot can also receive the data that was previously available:

```vue
<Promised :promise="usersPromise">
  <template v-slot:pending="previousData">
    <p>Refreshing</p>
    <ul>
      <li v-for="user in previousData">{{ user.name }}</li>
    </ul>
  </template>
  <template v-slot="data">
    <ul>
      <li v-for="user in data">{{ user.name }}</li>
    </ul>
  </template>
</Promised>
```

Although, depending on the use case, this could create duplication and using a `combined` slot would be a better approach.

#### Using one single `combined` slot

Sometimes, you need to customize **how** things are displayed rather than **what** is displayed. Disabling a search input, displaying an overlaying spinner, etc. Instead of using multiple slots, you can provide one single `combined` slot that will receive a context with all relevant information. That way you can customize the props of a component, toggle content with your own `v-if` but still benefit from a declarative approach:

```vue
<Promised :promise="promise">
  <template v-slot:combined="{ isPending, isDelayElapsed, data, error }">
    <pre>
      pending: {{ isPending }}
      is delay over: {{ isDelayElapsed }}
      data: {{ data }}
      error: {{ error && error.message }}
    </pre>
  </template>
</Promised>
```

This allows to create more advanced async templates like this one featuring a Search component that must be displayed while the `searchResults` are being fetched:

```vue
<Promised :promise="searchResults" :pending-delay="200">
  <template v-slot:combined="{ isPending, isDelayElapsed, data, error }">
    <div>
      <!-- data contains previous data or null when starting -->
      <Search :disabled-pagination="isPending || error" :items="data || []">
        <!-- The Search handles filtering logic with pagination -->
        <template v-slot="{ results, query }">
          <ProfileCard v-for="user in results" :user="user" />
        </template>
        <!--
          Display a loading spinner only if an initial delay of 200ms is elapsed
        -->
        <template v-slot:loading>
          <MySpinner v-if="isPending && isDelayElapsed" />
        </template>
        <!-- `query` is the same as in the default slot -->
        <template v-slot:noResults="{ query }">
          <p v-if="error" class="error">Error: {{ error.message }}</p>
          <p v-else class="info">No results for "{{ query }}"</p>
        </template>
      </Search>
    </div>
  </template>
</Promised>
```

##### `context` object

- `isPending`: is `true` while the promise is in a _pending_ status. Becomes `false` once the promise is resolved **or** rejected. It is reset to `true` when the `promise` prop changes.
- `isRejected` is `false`. Becomes `true` once the promise is _rejected_. It is reset to `false` when the `promise` prop changes.
- `isResolved` is `false`. Becomes `true` once the promise is _resolved_. It is reset to `false` when the `promise` prop changes.
- `isDelayElapsed`: is `true` once the `pendingDelay` is over or if `pendingDelay` is 0. Becomes `false` after the specified delay (200 by default). It is reset when the `promise` prop changes.
- `data`: contains the last resolved value from `promise`. This means it will contain the previous succesfully (non cancelled) result.
- `error`: contains last rejection or `null` if the promise was fullfiled.

### Setting the `promise`

There are different ways to provide a promise to `Promised`. The first one, is setting it in the created hook:

```js
export default {
  data: () => ({ promise: null }),
  created() {
    this.promise = fetchData()
  },
}
```

But most of the time, you can use a computed property. This makes even more sense if you are passing a prop or a data property to the function returning a promise (`fetchData` in the example):

```js
export default {
  props: ['id'],
  computed: {
    promise() {
      return fetchData(this.id)
    },
  },
}
```

You can also set the `promise` prop to `null` to reset the Promised component to the initial state: no error, no data, and pending:

```js
export default {
  data: () => ({ promise: null }),
  methods: {
    resetPromise() {
      this.promise = null
    },
  },
}
```

## API Reference

### `usePromise`

`usePromise` returns an object of `Ref` representing the state of the promise.

```ts
const { data, error, isPending, isDelayElapsed } = usePromise(fetchUsers())
```

Signature:

```ts
function usePromise<T = unknown>(
  promise: Ref<Promise<T> | null | undefined> | Promise<T> | null | undefined,
  pendingDelay?: Ref<number | string> | number | string
): {
  isPending: Ref<boolean>
  isDelayElapsed: Ref<boolean>
  error: Ref<Error | null | undefined>
  data: Ref<T | null | undefined>
}
```

### `Promised` component

`Promised` will watch its prop `promise` and change its state accordingly.

#### props

| Name           | Description                                                               | Type      |
| -------------- | ------------------------------------------------------------------------- | --------- |
| `promise`      | Promise to be resolved                                                    | `Promise` |
| `pendingDelay` | Delay in ms to wait before displaying the pending slot. Defaults to `200` | `Number \| String` |

#### slots

All slots but `combined` can be used as _scoped_ or regular slots.

| Name       | Description                                                                     | Scope                                     |
| ---------- | ------------------------------------------------------------------------------- | ----------------------------------------- |
| `pending`  | Content to display while the promise is pending and before pendingDelay is over | `previousData`: previously resolved value |
| _default_  | Content to display once the promise has been successfully resolved              | `data`: resolved value                    |
| `rejected` | Content to display if the promise is rejected                                   | `error`: rejection reason                 |
| `combined` | Combines all slots to provide a granular control over what should be displayed  | `context` [See details](#context-object)  |

## License

[MIT](http://opensource.org/licenses/MIT)
