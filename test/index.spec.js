import { mount } from '@vue/test-utils'
import fakePromise from 'faked-promise'
import Helper from './utils/Helper'
import NamedSlots from './utils/NamedSlots'
import NoError from './utils/NoError'
import NoResolve from './utils/NoResolve'
import NoPending from './utils/NoPending'

// keep a real setTimeout
const timeout = setTimeout
const tick = () => new Promise(resolve => timeout(resolve, 0))
jest.useFakeTimers()

describe.skip('Promised', () => {
  let wrapper
  describe('single promise', () => {
    let promise, resolve, reject
    beforeEach(() => {
      [promise, resolve, reject] = fakePromise()
      wrapper = mount(Helper, {
        propsData: {
          promise,
          pendingDelay: 0,
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
          pendingDelay: 0,
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
      other[1]('done')
      await tick()
      // XXX looks like a bug in vue test utils, need to rerender to actually display things
      wrapper.setProps({ pendingDelay: 100 })
      expect(wrapper.text()).toBe('done')
    })

    test('cancels previous rejected promise', async () => {
      const other = fakePromise()
      wrapper.setProps({ promises: [other[0]] })
      fakedPromises[0].reject(new Error('failed'))
      await tick()
      expect(wrapper.text()).toBe('loading')
      other[2](new Error('nope'))
      await tick()
      // XXX looks like a bug in vue test utils, need to rerender to actually display things
      wrapper.setProps({ pendingDelay: 100 })
      expect(wrapper.text()).toBe('nope')
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

    test('throws if no catch scoped slot provided on error', async () => {
      wrapper = mount(NoError, {
        propsData: {
          promise,
          pendingDelay: 0,
        },
      })
      expect(errorSpy).not.toHaveBeenCalled()
      reject(new Error('nope'))
      await tick()
      expect(errorSpy).toHaveBeenCalledTimes(2)
      expect(errorSpy.mock.calls[0][0].toString()).toMatch(
        /Provide exactly one scoped slot named "catch"/
      )
    })

    test('throws if no default scoped slot provided on resolve', async () => {
      wrapper = mount(NoResolve, {
        propsData: {
          promise,
          pendingDelay: 0,
        },
      })
      expect(errorSpy).not.toHaveBeenCalled()
      resolve()
      await tick()
      expect(errorSpy.mock.calls[0][0].toString()).toMatch(
        /Provide exactly one default\/then scoped slot/
      )
    })

    test('throws if no default slot provided while pending', async () => {
      expect(errorSpy).not.toHaveBeenCalled()
      expect(() => {
        wrapper = mount(NoPending, {
          propsData: {
            promise,
            pendingDelay: 0,
          },
        })
      }).toThrowError(/Provide exactly one default\/pending slot/)
      // expect(errorSpy).toHaveBeenCalledTimes(2)
      // expect(errorSpy.mock.calls[0][0].toString()).toMatch(
      //   /Provide exactly one default\/pending slot/
      // )
    })
  })

  describe('slots names', () => {
    let promise, resolve, reject
    beforeEach(() => {
      [promise, resolve, reject] = fakePromise()
      wrapper = mount(NamedSlots, {
        propsData: {
          promise,
          pendingDelay: 0,
        },
      })
    })

    test('supports named pending slot', () => {
      expect(wrapper.text()).toBe('loading')
    })

    test('supports scoped slot named then', async () => {
      resolve('foo')
      await tick()
      expect(wrapper.text()).toBe('foo')
    })

    test('supports scoped slot named catch', async () => {
      reject(new Error('nope'))
      await tick()
      expect(wrapper.text()).toBe('nope')
    })
  })

  describe('pendingDelay', () => {
    describe('single promise', () => {
      let promise
      beforeEach(() => {
        clearTimeout.mockClear()
        setTimeout.mockClear()
        ;[promise] = fakePromise()
        wrapper = mount(Helper, {
          propsData: {
            promise,
            pendingDelay: 300,
          },
        })
      })

      test('displays nothing before the delay', async () => {
        expect(wrapper.text()).toBe('')
        jest.runAllTimers()
        await tick()
        expect(wrapper.text()).toBe('loading')
      })

      test('custom pendingDelay', async () => {
        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)
        ;[promise] = fakePromise()
        wrapper.setProps({
          pendingDelay: 100,
          promise,
        })
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)
      })

      test('cancels previous timeouts', () => {
        expect(clearTimeout).not.toHaveBeenCalled()
        ;[promise] = fakePromise()
        wrapper.setProps({
          promise,
          pendingDelay: 100,
        })
        expect(clearTimeout).toHaveBeenCalled()
      })
    })

    describe('multiple promises', () => {
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
            pendingDelay: 300,
          },
        })
      })

      test('displays nothing before the delay', async () => {
        expect(wrapper.text()).toBe('')
        jest.runAllTimers()
        await tick()
        expect(wrapper.text()).toBe('loading')
      })
    })
  })
})
