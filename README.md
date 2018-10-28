# vue-promised [![Build Status](https://badgen.net/circleci/github/posva/vue-promised)](https://circleci.com/gh/posva/vue-promised) [![npm package](https://img.shields.io/npm/v/vue-promised.svg)](https://www.npmjs.com/package/vue-promised) [![coverage](https://img.shields.io/codecov/c/github/posva/vue-promised.svg)](https://codecov.io/github/posva/vue-promised) [![thanks](https://img.shields.io/badge/thanks-%E2%99%A5-ff69b4.svg)](https://github.com/posva/thanks)

> Transform your Promises into components !

## Installation

```bash
npm install --save vue-promised
# or
yarn add vue-promised
```

## Usage

Import the component to use it

```js
import { Promised } from 'vue-promised'

Vue.component('Promised', Promised)
```

`promise` should be a Promise but can also be `null`. `data` will contain the result of the promise. You can of course name it the way you want:

```vue
<Promised :promise="promise">
  <!--
    Use the "pending" slot for loading content
  -->
  <h1 slot="pending">Loading</h1>
  <!-- The default scoped slots will be used as the result -->
  <h1 slot-scope="data">Success!</h1>
  <!-- The "rejected" scoped slot will be used if there is an error -->
  <h1 slot="rejected" slot-scope="error">Error: {{ error.message }}</h1>
</Promised>
```

You can also provide a single `combined` slot that will receive a context with all relevant information

```vue
<Promised :promise="promise">
  <pre slot="combined" slot-scope="{ isPending, isDelayOver, data, error }">
    pending: {{ isPending }}
    is delay over: {{ isDelayOver }}
    data: {{ data }}
    error: {{ error && error.message }}
  </pre>
</Promised>
```

This allows to create more advanced async templates like this one featuring a Search component that must be displayed while the `searchResults` are being fetched:

```vue
<Promised :promise="searchResults" :pending-delay="200">
  <div slot="combined" slot-scope="{ isPending, isDelayOver, data, error }">
    <!-- data contains previous data or null when starting -->
    <Search :disabled-pagination="isPending || error" :items="data || []">
      <!-- The Search handles filtering logic with pagination -->
      <template slot-scope="{ results, query }">
        <ProfileCard v-for="user in results" :user="user"/>
      </template>
      <!-- If there is an error, data is null, therefore there are no results and we can display
      the error -->
      <MySpinner v-if="isPending && isDelayOver" slot="loading"/>
      <template slot="noResults">
        <p v-if="error" class="error">Error: {{ error.message }}</p>
        <p v-else class="info">No results for "{{ query }}"</p>
      </template>
    </Search>
  </div>
</Promised>
```

### `context` object

- `isPending`: is `true` while the promise is in a _pending_ status. Becomes true once the promise is resolved **or** rejected. It is resetted to `false` when `promise` prop changes.
- `isDelayOver`: is `true` once the `pendingDelay` is over or if `pendingDelay` is 0. Becomes `false` after the specified delay (200 by default). It is resetted when `promise` prop changes.
- `data`: contains last resolved value from `promise`. This means it will contain the previous succesfully (non cancelled) result.
- `error`: contais last rejection or `null` if the promise was fullfiled.

## API Reference

### `Promised` component

`Promised` will watch its prop `promise` and change its state accordingly.

#### props

| Name           | Description                                                                    | Type      |
| -------------- | ------------------------------------------------------------------------------ | --------- |
| `promise`      | Promise to be resolved                                                         | `Promise` |
| `tag`          | Wrapper tag used if multiple elements are passed to a slot. Defaults to `span` | `String`  |
| `pendingDelay` | Delay in ms to wait before displaying the pending slot. Defaults to `200`      | `Number`  |

#### slots

`pending` and `then` slots are provided in case you prefer a more explicit approach.

| Name       | Description                                                                           | Scope                                    |
| ---------- | ------------------------------------------------------------------------------------- | ---------------------------------------- |
| `pending`  | Content to display while the promise is pending                                       | —                                        |
| _default_  | Content to display once the promise has been successfully resolved                    | `data`: resolved value                   |
| `rejected` | Content to display if the promise is rejected                                         | `error`: rejection reason                |
| `combined` | Combines all slots allows to provide a granular control over what should be displayed | `context` [See details](#context-object) |

## License

[MIT](http://opensource.org/licenses/MIT)
