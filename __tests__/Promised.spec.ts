/* eslint-disable no-unused-vars */
import { mount } from '@vue/test-utils'
import { mockWarn } from 'jest-mock-warn'
import { Promised } from '../src'
import fakePromise from 'faked-promise'
import { h } from 'vue'

// keep a real setTimeout
const timeout = setTimeout
const tick = () => new Promise((resolve) => timeout(resolve, 0))
jest.useFakeTimers()

describe('Promised', () => {
  function factory(propsData: any = undefined, slots: any = undefined) {
    const [promise, resolve, reject] = fakePromise<any>()
    const wrapper = mount(Promised as any, {
      propsData: { promise, pendingDelay: 0, ...propsData },
      slots: {
        pending: (oldData) => h('span', 'pending: ' + oldData),
        default: (data) => h('span', {}, data),
        rejected: (error) => h('span', { class: 'error' }, error.message),
        ...slots,
      },
    })

    return { wrapper, promise, resolve, reject }
  }

  describe('three slots', () => {
    it('displays nothing with no promise', () => {
      const { wrapper } = factory({ promise: null })
      expect(wrapper.text()).toBe('')
    })

    it('displays pending', () => {
      const { wrapper } = factory()
      expect(wrapper.text()).toMatch('pending')
    })

    it('displays the resolved value once resolved', async () => {
      const { wrapper, resolve } = factory()
      resolve('foo')
      await tick()
      expect(wrapper.text()).toBe('foo')
    })

    it('contains previous data in pending slot', async () => {
      let { wrapper, promise, resolve } = factory()
      resolve('ok')
      await tick()
      expect(wrapper.text()).toBe('ok')
      // create a new promise
      ;[promise, resolve] = fakePromise()
      wrapper.setProps({ promise })
      await tick()
      resolve('okay')
      expect(wrapper.text()).toBe('pending: ok')
      await tick()
      expect(wrapper.text()).toBe('okay')
    })

    it('displays an error if rejected', async () => {
      let { wrapper, reject } = factory()
      reject(new Error('hello'))
      await tick()
      expect(wrapper.text()).toBe('hello')
    })

    it('cancels previous promise', async () => {
      let { wrapper, resolve } = factory()
      const other = fakePromise()
      wrapper.setProps({ promise: other[0] })
      resolve('foo')
      await tick()
      expect(wrapper.text()).toMatch('pending')
    })

    it('cancels previous rejected promise', async () => {
      let { wrapper, reject } = factory()
      const other = fakePromise()
      wrapper.setProps({ promise: other[0] })
      reject(new Error('failed'))
      await tick()
      expect(wrapper.text()).toMatch('pending')
    })

    describe('pendingDelay', () => {
      afterEach(() => {
        // @ts-ignore
        clearTimeout.mockClear()
        // @ts-ignore
        setTimeout.mockClear()
      })

      it('displays nothing before the delay', async () => {
        let { wrapper } = factory({ pendingDelay: 300 })
        expect(wrapper.text()).toBe('')
        jest.runAllTimers()
        await tick()
        expect(wrapper.text()).toMatch('pending')
      })

      it('custom pendingDelay', async () => {
        expect(setTimeout).toHaveBeenCalledTimes(0)
        let { wrapper, promise } = factory({ pendingDelay: 300 })
        expect(setTimeout).toHaveBeenCalledTimes(1)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)
        ;[promise] = fakePromise()
        wrapper.setProps({ pendingDelay: 100, promise })
        await tick()
        expect(setTimeout).toHaveBeenCalledTimes(2)
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100)
      })

      it('cancels previous timeouts', async () => {
        let { wrapper, promise } = factory({ pendingDelay: 300 })
        expect(clearTimeout).not.toHaveBeenCalled()
        ;[promise] = fakePromise()
        wrapper.setProps({
          promise,
          pendingDelay: 100,
        })
        await tick()
        expect(clearTimeout).toHaveBeenCalled()
      })

      it('cancels timeout when promise is set to null', async () => {
        let { wrapper } = factory({ pendingDelay: 300 })
        expect(setTimeout).toHaveBeenCalledTimes(1)
        wrapper.setProps({
          promise: null,
        })
        await tick()
        expect(clearTimeout).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('combined slot', () => {
    function factory(propsData: any = undefined, slots: any = undefined) {
      const [promise, resolve, reject] = fakePromise<any>()
      const wrapper = mount(Promised as any, {
        propsData: { promise, pendingDelay: 0, ...propsData },
        slots: {
          combined: (state) => h('span', JSON.stringify(state)),
          ...slots,
        },
      })

      return { wrapper, promise, resolve, reject }
    }

    it('displays the data', async () => {
      const { wrapper, resolve } = factory()

      expect(wrapper.html()).toMatchSnapshot()

      resolve('foo')
      await tick()

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('displays the error', async () => {
      const { wrapper, reject } = factory()

      expect(wrapper.html()).toMatchSnapshot()

      reject(new Error('fail'))
      await tick()

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  mockWarn()

  it('warns on missing slot', async () => {
    const [promise, _resolve, reject] = fakePromise<any>()
    mount(Promised as any, {
      propsData: { promise, pendingDelay: 0 },
      slots: {
        pending: (oldData) => h('span', 'pending: ' + oldData),
        default: (data) => h('span', {}, data),
        // rejected: (error) => h('span', { class: 'error' }, error.message),
      },
    })

    reject(new Error())
    await tick()

    expect('Missing slot "rejected"').toHaveBeenWarned()
  })
})
