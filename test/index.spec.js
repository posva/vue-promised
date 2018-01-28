import { mount } from '@vue/test-utils'
import fakePromise from 'faked-promise'
import Helper from './utils/Helper'

const tick = () => new Promise(resolve => setTimeout(resolve, 0))

describe('Promised', () => {
  let wrapper, promise, resolve, reject
  beforeEach(async () => {
    [promise, resolve, reject] = await fakePromise()
    wrapper = mount(Helper, {
      propsData: {
        promise,
      },
    })
  })

  test('displays a loading screen waiting for the promise', async () => {
    expect(wrapper.text()).toBe('loading')
  })

  test('displays the resolved value once resolved', async () => {
    resolve('foo')
    await tick()
    expect(wrapper.text()).toBe('foo')
  })

  test('displays an error if rejected', async () => {
    reject(new Error('hello'))
    await tick()
    expect(wrapper.text()).toBe('hello')
  })
})
