vue-promised [![Build Status](https://img.shields.io/circleci/project/posva/vue-promised/master.svg)](https://circleci.com/gh/posva/vue-promised) [![npm package](https://img.shields.io/npm/v/vue-promised.svg)](https://www.npmjs.com/package/vue-promised) [![coverage](https://img.shields.io/codecov/c/github/posva/vue-promised.svg)](https://codecov.io/github/posva/vue-promised) [![donate](https://img.shields.io/badge/donate-%E2%99%A5-ff69b4.svg)](https://github.com/posva/donate)
===

Transform your Promises into components

## Usage

Import the component to use it

```js
import Promised from 'vue-promise-blocks'

Vue.component('Promised', Promised)
```

`promise` should be a promise. `data` will contain the result of the promise
```html
<Promised :promise="promise">
    <!-- Use the default slot for loading content
         Make sure to have ONLY 1 NODE
         (you can always nest things inside of a div
     -->
    <h1>Loading</h1>
    <!-- The default scoped slots will be used as the result -->
    <h1 slot-scope="data">Success!</h1>
    <!-- The 'error' named scoped slots will be used if there is an error -->
    <h1 slot="error" slot-scope="error">Error: {{ error.message }}</h1>
</Promised>
```

Pass an array of Promises with `promises`

```html
<Promised :promises="promises">
  <h2>Wating for first result</h2>
  <h2 slot-scope="data">
    Succeeded {{ data.length }} times
  </h2>
  <h2 slot="error" slot-scope="errors">
    Failed {{ errors.length }} times
  </h2>
</Promised>
```

## License

[MIT](http://opensource.org/licenses/MIT)

