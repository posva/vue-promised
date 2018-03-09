vue-promised [![Build Status](https://img.shields.io/circleci/project/posva/vue-promised/master.svg)](https://circleci.com/gh/posva/vue-promised) [![npm package](https://img.shields.io/npm/v/vue-promised.svg)](https://www.npmjs.com/package/vue-promised) [![coverage](https://img.shields.io/codecov/c/github/posva/vue-promised.svg)](https://codecov.io/github/posva/vue-promised) [![thanks](https://img.shields.io/badge/thanks-%E2%99%A5-ff69b4.svg)](https://github.com/posva/thanks)
===

Transform your Promises into components

## Installation

```bash
npm install --save vue-promised
# or
yarn add vue-promised
```

## Usage

Import the component to use it

```js
import Promised from 'vue-promised'

Vue.component('Promised', Promised)
```

`promise` should be a Promise. `data` will contain the result of the promise. You can of course name it the way you want:

```vue
<Promised :promise="promise">
  <!--
    Use the default slot for loading content
    Make sure to have ONLY 1 NODE
    (you can always nest things inside of a div
  -->
  <h1 slot="pending">Loading</h1>
  <!-- The default scoped slots will be used as the result -->
  <h1 slot="then" slot-scope="data">Success!</h1>
  <!-- The 'catch' named scoped slots will be used if there is an error -->
  <h1 slot="catch" slot-scope="error">Error: {{ error.message }}</h1>
</Promised>
```

You can omit the `pending` and `then` names, VuePromised will pick them up automatically, resulting in a more concise writing:

```vue
<Promised :promise="promise">
  <h1>Loading</h1>
  <h1 slot-scope="data">Success!</h1>
  <h1 slot="catch" slot-scope="error">Error: {{ error.message }}</h1>
</Promised>
```

You can also pass an array of Promises with the prop `promises`:

```vue
<Promised :promises="promises">
  <h2>Wating for first result</h2>
  <h2 slot-scope="data">
    Succeeded {{ data.length }} times
  </h2>
  <h2 slot="catch" slot-scope="errors">
    Failed {{ errors.length }} promises
  </h2>
</Promised>
```

## License

[MIT](http://opensource.org/licenses/MIT)

