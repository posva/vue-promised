import { mount } from '@vue/test-utils'
import fakePromise from 'faked-promise'
import Helper from './utils/Helper'

const tick = () => new Promise(resolve => setTimeout(resolve, 0))

describe('Promised', () => {
  let wrapper
  describe('single promise', () => {
    let promise, resolve, reject
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

  describe('multiple promise', () => {
    let fakedPromises
    beforeEach(async () => {
      fakedPromises = (await Promise.all(
        Array.from({ length: 3 }, () => fakePromise())
      )).map(([promise, resolve, reject]) => ({
        promise,
        resolve,
        reject,
      }))

      const promises = fakedPromises.map(({ promise }) => promise)

      wrapper = mount(Helper, {
        propsData: {
          promises,
        },
      })
    })

    test('displays a loading screen while no promise is resolved', async () => {
      expect(wrapper.text()).toBe('loading')
    })

    test('displays the resolved values once resolved', async () => {
      fakedPromises[0].resolve('foo')
      await tick()
      expect(wrapper.text()).toBe('foo')
    })

    test('displays errors if rejected', async () => {
      fakedPromises[0].reject(new Error('failed'))
      await tick()
      expect(wrapper.text()).toBe('failed')
    })

    test('displays multiple errors if rejected', async () => {
      fakedPromises[0].reject(new Error('one'))
      fakedPromises[1].reject(new Error('two'))
      await tick()
      expect(wrapper.text()).toBe('one,two')
    })
  })
})
