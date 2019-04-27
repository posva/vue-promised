import { mount } from '@vue/test-utils'
import { Promised } from '../src'
import fakePromise from 'faked-promise'
import MultipleChildrenHelper from './utils/MultipleChildrenHelper.vue'
import CombinedMultipleChildren from './utils/CombinedMultipleChildren.vue'

// keep a real setTimeout
const timeout = setTimeout
const tick = () => new Promise(resolve => timeout(resolve, 0))
jest.useFakeTimers()

const slots = {
  pending: `<span>pending</span>`,
}
const scopedSlots = {
  default: `<span slot-scope="data">{{ data }}</span>`,
  rejected: `<span class="error" slot-scope="error">{{ error.message }}</span>`,
}

describe('Promised', () => {
  describe('three slots', () => {
    /** @type {import('@vue/test-utils').Wrapper} */
    let wrapper, promise, resolve, reject
    beforeEach(() => {
      [promise, resolve, reject] = fakePromise()
      wrapper = mount(Promised, {
        propsData: { promise, pendingDelay: 0 },
        slots,
        scopedSlots,
      })
    })

    it('displays nothing with no promise', () => {
      wrapper = mount(Promised, {
        propsData: { promise: null, pendingDelay: 0 },
        slots,
        scopedSlots,
      })
      expect(wrapper.text()).toBe('')
    })

    it('displays pending', async () => {
      expect(wrapper.text()).toBe('pending')
    })

    it('displays the resolved value once resolved', async () => {
      resolve('foo')
      await tick()
      expect(wrapper.text()).toBe('foo')
    })

    it('works with a non scoped-slot', async () => {
      [promise, resolve, reject] = fakePromise()
      wrapper = mount(Promised, {
        propsData: { promise, pendingDelay: 0 },
        slots: {
          ...slots,
          default: `<p>finished</p>`,
        },
      })
      resolve('whatever')
      await tick()
      expect(wrapper.text()).toBe('finished')
    })

    it('works with a non scoped-slot for the rejected slot', async () => {
      [promise, resolve, reject] = fakePromise()
      wrapper = mount(Promised, {
        propsData: { promise, pendingDelay: 0 },
        slots: {
          ...slots,
          rejected: `<p>oh no</p>`,
        },
      })
      reject('whatever')
      await tick()
      expect(wrapper.text()).toBe('oh no')
    })

    it('works with a scoped-slot for the pending slot', async () => {
      [promise, resolve, reject] = fakePromise()
      wrapper = mount(Promised, {
        propsData: { promise, pendingDelay: 0 },
        scopedSlots: {
          pending: `<p>pending</p>`,
        },
      })
      expect(wrapper.text()).toBe('pending')
    })

    it('contains previous data in pending scoped-slot', async () => {
      [promise, resolve, reject] = fakePromise()
      wrapper = mount(Promised, {
        propsData: { promise, pendingDelay: 0 },
        scopedSlots: {
          pending: `<p>pending: {{ props }}</p>`,
          default: `<p>data: {{ props }}</p>`,
        },
      })
      resolve('ok')
      await tick()
      expect(wrapper.text()).toBe('data: ok')
      // create a new promise
      ;[promise, resolve, reject] = fakePromise()
      wrapper.setProps({ promise })
      resolve('okay')
      expect(wrapper.text()).toBe('pending: ok')
      await tick()
      expect(wrapper.text()).toBe('data: okay')
    })

    it('displays an error if rejected', async () => {
      reject(new Error('hello'))
      await tick()
      expect(wrapper.text()).toBe('hello')
    })

    it('cancels previous promise', async () => {
      const other = fakePromise()
      wrapper.setProps({ promise: other[0] })
      resolve('foo')
      await tick()
      expect(wrapper.text()).toBe('pending')
    })

    it('cancels previous rejected promise', async () => {
      const other = fakePromise()
      wrapper.setProps({ promise: other[0] })
      reject(new Error('failed'))
      await tick()
      expect(wrapper.text()).toBe('pending')
    })

    describe('pendingDelay', () => {
      let promise
      beforeEach(() => {
        clearTimeout.mockClear()
        setTimeout.mockClear()
        ;[promise] = fakePromise()
        wrapper = mount(Promised, {
          slots,
          scopedSlots,
          propsData: {
            promise,
            pendingDelay: 300,
          },
        })
      })

      it('displays nothing before the delay', async () => {
        expect(wrapper.text()).toBe('')
        jest.runAllTimers()
        await tick()
        expect(wrapper.text()).toBe('pending')
      })

      it('custom pendingDelay', async () => {
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

      it('cancels previous timeouts', () => {
        expect(clearTimeout).not.toHaveBeenCalled()
        ;[promise] = fakePromise()
        wrapper.setProps({
          promise,
          pendingDelay: 100,
        })
        expect(clearTimeout).toHaveBeenCalled()
      })

      it('cancels timeout when promise is set to null', () => {
        expect(setTimeout).toHaveBeenCalledTimes(1)
        wrapper.setProps({
          promise: null,
        })
        expect(clearTimeout).toHaveBeenCalledTimes(1)
      })
    })

    describe('multipe children', () => {
      beforeEach(() => {
        [promise, resolve, reject] = fakePromise()
        wrapper = mount(MultipleChildrenHelper, {
          propsData: { promise, pendingDelay: 0 },
        })
      })

      it('displays pending', async () => {
        expect(wrapper.is('span')).toBe(true)
        expect(wrapper.text()).toBe('pending')
      })

      it('displays the resolved value once resolved', async () => {
        resolve('foo')
        await tick()
        expect(wrapper.is('span')).toBe(true)
        expect(wrapper.text()).toBe('foo')
      })

      it('displays an error if rejected', async () => {
        reject(new Error('hello'))
        await tick()
        expect(wrapper.is('span')).toBe(true)
        expect(wrapper.text()).toBe('hello')
      })

      it('can customize the tag', () => {
        wrapper.setProps({ tag: 'p' })
        expect(wrapper.is('p')).toBe(true)
        expect(wrapper.text()).toBe('pending')
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
        wrapper = mount(Promised, {
          slots,
          propsData: { promise, pendingDelay: 0 },
        })
      })

      afterEach(() => {
        errorSpy.mockRestore()
      })

      it('throws if no rejected scoped slot provided on error', async () => {
        expect(errorSpy).not.toHaveBeenCalled()
        reject(new Error('nope'))
        await tick()
        expect(errorSpy).toHaveBeenCalledTimes(2)
        expect(errorSpy.mock.calls[0][0].toString()).toMatch(
          /No slot "rejected" provided/
        )
      })

      it('throws if no default scoped or regular slot provided on resolve', async () => {
        expect(errorSpy).not.toHaveBeenCalled()
        resolve()
        await tick()
        expect(errorSpy.mock.calls[0][0].toString()).toMatch(
          /No slot "default" provided/
        )
      })

      it('throws if no pending slot provided', async () => {
        expect(() => {
          wrapper = mount(Promised, {
            propsData: { promise, pendingDelay: 0 },
          })
        }).toThrowError(/No slot "pending" provided/)
      })
    })
  })

  describe('combined slot', () => {
    /** @type {import('@vue/test-utils').Wrapper} */
    let wrapper, promise, resolve, reject, errorSpy
    beforeEach(() => {
      // silence the log
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
        // useful for debugging
        // console.log('CONSOLE ERROR')
      })
      ;[promise, resolve, reject] = fakePromise()
      wrapper = mount(Promised, {
        propsData: { promise, pendingDelay: 0 },
        scopedSlots: {
          combined: `<div>
            <p class="pending">{{ props.isPending }}</p>
            <p class="delay">{{ props.isDelayOver }}</p>
            <p class="error">{{ props.error && props.error.message }}</p>
            <p class="data">{{ props.data }}</p>
          </div>`,
        },
      })
    })

    afterEach(() => {
      errorSpy.mockRestore()
    })

    it('displays initial state', () => {
      expect(wrapper.text()).toBe('true true')
    })

    it('displays data when resolved', async () => {
      resolve('foo')
      await tick()
      expect(wrapper.find('.pending').text()).toBe('false')
      expect(wrapper.find('.delay').text()).toBe('true')
      expect(wrapper.find('.data').text()).toBe('foo')
    })

    it('works with no promise', () => {
      expect(() => {
        wrapper = mount(Promised, {
          propsData: { promise: null, pendingDelay: 0 },
          scopedSlots: {
            combined: `<div>
            <p class="pending">{{ props.isPending }}</p>
            <p class="delay">{{ props.isDelayOver }}</p>
            <p class="error">{{ props.error && props.error.message }}</p>
            <p class="data">{{ props.data }}</p>
          </div>`,
          },
        })
      }).not.toThrow()
      expect(wrapper.text()).toBe('true false')
    })

    it('displays an error if rejected', async () => {
      reject(new Error('hello'))
      await tick()
      expect(wrapper.find('.pending').text()).toBe('false')
      expect(wrapper.find('.delay').text()).toBe('true')
      expect(wrapper.find('.data').text()).toBe('')
      expect(wrapper.find('.error').text()).toBe('hello')
    })

    it('data contains previous data in between calls', async () => {
      resolve('foo')
      await tick()
      expect(wrapper.find('.pending').text()).toBe('false')
      expect(wrapper.find('.delay').text()).toBe('true')
      expect(wrapper.find('.data').text()).toBe('foo')
      ;[promise, resolve, reject] = fakePromise()

      wrapper.setProps({ promise })
      await tick()

      resolve('bar')
      expect(wrapper.find('.pending').text()).toBe('true')
      expect(wrapper.find('.delay').text()).toBe('true')
      expect(wrapper.find('.data').text()).toBe('foo')

      await tick()

      expect(wrapper.find('.pending').text()).toBe('false')
      expect(wrapper.find('.delay').text()).toBe('true')
      expect(wrapper.find('.data').text()).toBe('bar')
    })

    it('data contains previous resolved data in between calls', async () => {
      resolve('foo')
      await tick()
      expect(wrapper.find('.pending').text()).toBe('false')
      expect(wrapper.find('.delay').text()).toBe('true')
      expect(wrapper.find('.data').text()).toBe('foo')
      ;[promise, resolve, reject] = fakePromise()

      wrapper.setProps({ promise })
      await tick()

      // create another promise to cancel previous one
      const otherResolve = resolve
      ;[promise, resolve, reject] = fakePromise()
      wrapper.setProps({ promise })
      await tick()
      otherResolve('other')
      resolve('bar')

      expect(wrapper.find('.pending').text()).toBe('true')
      expect(wrapper.find('.delay').text()).toBe('true')
      expect(wrapper.find('.data').text()).toBe('foo')

      await tick()

      expect(wrapper.find('.pending').text()).toBe('false')
      expect(wrapper.find('.delay').text()).toBe('true')
      expect(wrapper.find('.data').text()).toBe('bar')
    })

    it('data is reset when promise is set to null', async () => {
      resolve('foo')
      await tick()
      expect(wrapper.find('.pending').text()).toBe('false')
      expect(wrapper.find('.delay').text()).toBe('true')
      expect(wrapper.find('.data').text()).toBe('foo')

      wrapper.setProps({ promise: null })
      await tick()

      expect(wrapper.text()).toBe('true false')
    })

    it('throws if slot is empty', () => {
      expect(errorSpy).not.toHaveBeenCalled()
      expect(() => {
        wrapper = mount(Promised, {
          scopedSlots: {
            combined: `<template></template>`,
          },
          propsData: { promise: null, pendingDelay: 0 },
        })
      }).toThrow(/Provided scoped slot "combined" cannot be empty/)
      expect(errorSpy).toHaveBeenCalledTimes(2)
    })

    it('allows multiple nodes', async () => {
      wrapper = mount(CombinedMultipleChildren, {
        propsData: { promise, pendingDelay: 0 },
      })
      resolve('foo')
      await tick()
      expect(wrapper.text()).toBe('false true foo')
    })

    it('can be resolved right away', async () => {
      const wrapper = mount(Promised, {
        propsData: { promise: null, pendingDelay: 0 },
        scopedSlots: {
          combined: `<div>
            <p class="pending">{{ props.isPending }}</p>
            <p class="delay">{{ props.isDelayOver }}</p>
            <p class="error">{{ props.error && props.error.message }}</p>
            <p class="data">{{ props.data }}</p>
          </div>`,
        },
      })
      wrapper.setProps({ promise: Promise.resolve('Hello') })
      await tick()
      expect(wrapper.text()).toBe('false true  Hello')
    })
  })
})
