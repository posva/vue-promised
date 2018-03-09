import { mount } from '@vue/test-utils'
import fakePromise from 'faked-promise'
import Helper from './utils/Helper'
import NamedSlots from './utils/NamedSlots'
import NoError from './utils/NoError'
import NoResolve from './utils/NoResolve'
import NoPending from './utils/NoPending'

const tick = () => new Promise(resolve => setTimeout(resolve, 0))

describe('Promised', () => {
  let wrapper
  describe('single promise', () => {
    let promise, resolve, reject
    beforeEach(() => {
      [promise, resolve, reject] = fakePromise()
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

    test('cancels previous promise', async () => {
      const other = fakePromise()
      wrapper.setProps({ promise: other[0] })
      resolve('foo')
      await tick()
      expect(wrapper.text()).toBe('loading')
    })

    test('cancels previous rejected promise', async () => {
      const other = fakePromise()
      wrapper.setProps({ promise: other[0] })
      reject(new Error('failed'))
      await tick()
      expect(wrapper.text()).toBe('loading')
    })
  })

  describe('multiple promise', () => {
    let fakedPromises
    beforeEach(async () => {
      fakedPromises = Array.from({ length: 3 }, () => fakePromise()).map(
        ([promise, resolve, reject]) => ({
          promise,
          resolve,
          reject,
        })
      )

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

    test('cancels previous promise', async () => {
      const other = fakePromise()
      wrapper.setProps({ promises: [other[0]] })
      fakedPromises[0].resolve('foo')
      await tick()
      expect(wrapper.text()).toBe('loading')
    })

    test('cancels previous rejected promise', async () => {
      const other = fakePromise()
      wrapper.setProps({ promises: [other[0]] })
      fakedPromises[0].reject(new Error('failed'))
      await tick()
      expect(wrapper.text()).toBe('loading')
    })
  })

  describe('errors', () => {
    let promise, resolve, reject, errorSpy
    beforeEach(() => {
      // silence the log
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
        // useful for debugging
        // console.log('CONSOLE ERROR')
      })
      ;[promise, resolve, reject] = fakePromise()
    })

    afterEach(() => {
      errorSpy.mockRestore()
    })

    test('throws if no error scoped slot provided on error', async () => {
      wrapper = mount(NoError, {
        propsData: {
          promise,
        },
      })
      expect(errorSpy).not.toHaveBeenCalled()
      reject(new Error('nope'))
      await tick()
      expect(errorSpy).toHaveBeenCalledTimes(2)
    })

    test('throws if no default scoped slot provided on resolve', async () => {
      wrapper = mount(NoResolve, {
        propsData: {
          promise,
        },
      })
      expect(errorSpy).not.toHaveBeenCalled()
      resolve()
      await tick()
      expect(errorSpy).toHaveBeenCalledTimes(2)
    })

    test('throws if no default slot provided while pending', async () => {
      expect(errorSpy).not.toHaveBeenCalled()
      wrapper = mount(NoPending, {
        propsData: {
          promise,
        },
      })
      expect(errorSpy).toHaveBeenCalledTimes(2)
    })
  })

  describe('slots names', () => {
    let promise, resolve, reject
    beforeEach(() => {
      [promise, resolve, reject] = fakePromise()
      wrapper = mount(NamedSlots, {
        propsData: { promise },
      })
    })
    test('supports named pending slot', () => {
      expect(wrapper.text()).toBe('loading')
    })
  })
})
