import { mount } from '@vue/test-utils'
import Helper from './utils/Helper'

const tick = () => new Promise(resolve => setImmediate(resolve))

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
