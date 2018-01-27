VuePromised
===

Transform your Promises into components

## Usage

Import the component to use it

```js
import Promised from 'vue-promise-blocks'

Vue.component('Promised', Promised)
```

`promise` should be a promise. `data` will contain the result of the promise
```vue
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

```vue
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

