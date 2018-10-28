import { mount } from '@vue/test-utils'
import { Promised } from '../src'
import fakePromise from 'faked-promise'
import MultipleChildrenHelper from './utils/MultipleChildrenHelper.vue'

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
        expect(errorSpy.mock.calls[0][0].toString()).toMatch(/No slot "rejected" provided/)
      })

      it('throws if no default scoped or regular slot provided on resolve', async () => {
        expect(errorSpy).not.toHaveBeenCalled()
        resolve()
        await tick()
        expect(errorSpy.mock.calls[0][0].toString()).toMatch(/No default slot provided/)
      })

      it('throws if pending slot provided', async () => {
        expect(() => {
          wrapper = mount(Promised, {
            propsData: { promise, pendingDelay: 0 },
          })
        }).toThrowError(/No "pending" slot provided/)
      })
    })
  })

  describe('combined slot', () => {
    /** @type {import('@vue/test-utils').Wrapper} */
    let wrapper, promise, resolve, reject
    beforeEach(() => {
      [promise, resolve, reject] = fakePromise()
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

    it.skip('throws if slot is empty', async () => {
      expect(() => {
        wrapper = mount(Promised, {
          scopedSlots: {
            combined: `<template></template>`,
          },
          propsData: { promise: null, pendingDelay: 0 },
        })
      }).toThrowError(
        /Provided "combined" scoped-slot cannot be empty and must contain one single children/
      )
    })

    // TODO test utils seems to not support that version of scopedSlot
    it.skip('throws if multiple nodes are provided', async () => {
      console.log('HEUETUHTNEHUOHTNUHOEHOUNTH')
      expect(() => {
        wrapper = mount(Promised, {
          scopedSlots: {
            combined: `<template><p>a</p><p>b<p/></template>`,
          },
          propsData: { promise, pendingDelay: 0 },
        })
      }).toThrowError(
        /Provided "combined" scoped-slot cannot be empty and must contain one single children/
      )
    })
  })
})
