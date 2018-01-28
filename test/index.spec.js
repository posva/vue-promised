import { mount } from '@vue/test-utils'
import Promised from '../src'
import Helper from './utils/Helper'

const tick = () => new Promise(r => setImmediate(r))

describe('Tweezing', () => {
  let wrapper
  let promise
  beforeEach(() => {
    promise = Promise.resolve('foo')
    wrapper = mount(Helper, {
      propsData: {
        promise,
      },
    })
  })

  test('displays a loading screen waiting for the promise', async () => {
    await tick()
    console.log(wrapper.text())
  })
})
