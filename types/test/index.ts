import Vue from 'vue'
import { Promised } from '../'

Vue.component('Promised', Promised);

new Vue({
  components: { Promised },
})

Vue.extend({
  extends: Promised
})
