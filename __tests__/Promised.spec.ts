/* eslint-disable no-unused-vars */
import { mount } from '@vue/test-utils'
import { mockWarn } from 'jest-mock-warn'
import { PromisedImpl as Promised } from '../src/Promised'
import fakePromise from 'faked-promise'
import { h } from 'vue'

// keep a real setTimeout
const timeout = setTimeout
const tick = () => new Promise((resolve) => timeout(resolve, 0))

describe('Promised', () => {
  function factory(
    propsData: any = undefined,
    slots: any = undefined,
    listeners: any = undefined
  ) {
    const [promise, resolve, reject] = fakePromise<any>()
    const wrapper = mount(Promised, {
      propsData: { promise, pendingDelay: 0, ...propsData },
      attrs: listeners,
      slots: {
        pending: (oldData) => h('span', 'pending: ' + oldData),
        default: (data) => h('span', {}, data),
        rejected: (error) =>
          h('span', { class: 'error' }, error && error.message),
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

    it('should display rejected slot even if error is undefined', async () => {
      let { wrapper, reject } = factory()

      reject(undefined)
      await tick()
      expect(wrapper.find('.error').exists()).toBeTruthy()
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
  })

  describe('three slots pendingDelay', () => {
    beforeEach(() => {
      jest.useFakeTimers('modern')
      jest.spyOn(global, 'setTimeout')
      jest.spyOn(global, 'clearTimeout')
    })
    afterEach(() => {
      // @ts-expect-error: mocked
      setTimeout.mockClear()
      // @ts-expect-error: mocked
      clearTimeout.mockClear()
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it('displays nothing before the delay', async () => {
      let { wrapper } = factory({ pendingDelay: 300 })
      expect(wrapper.text()).toBe('')
      jest.runAllTimers()
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toMatch('pending')
    })

    it('custom pendingDelay', async () => {
      expect(setTimeout).toHaveBeenCalledTimes(0)
      let { wrapper, promise } = factory({ pendingDelay: 300 })
      expect(setTimeout).toHaveBeenCalledTimes(1)
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 300)
      ;[promise] = fakePromise()
      wrapper.setProps({ pendingDelay: 100, promise })
      await wrapper.vm.$nextTick()
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
      await wrapper.vm.$nextTick()
      expect(clearTimeout).toHaveBeenCalled()
    })

    it('cancels timeout when promise is set to null', async () => {
      let { wrapper } = factory({ pendingDelay: 300 })
      expect(setTimeout).toHaveBeenCalledTimes(1)
      wrapper.setProps({
        promise: null,
      })
      await wrapper.vm.$nextTick()
      expect(clearTimeout).toHaveBeenCalledTimes(1)
    })
  })

  describe('combined slot', () => {
    function factory(propsData: any = undefined, slots: any = undefined) {
      const [promise, resolve, reject] = fakePromise<any>()
      const wrapper = mount(Promised, {
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

  describe("component's events", () => {
    beforeEach(() => {
      jest.useFakeTimers('modern')
      jest.spyOn(global, 'setTimeout')
      jest.spyOn(global, 'clearTimeout')
    })

    afterEach(() => {
      // @ts-expect-error: mocked
      setTimeout.mockClear()
      // @ts-expect-error: mocked
      clearTimeout.mockClear()
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it("fires 'resolved' event", async () => {
      const onResolved = jest.fn()

      const { resolve } = factory(undefined, undefined, { onResolved })

      resolve('fire')

      await tick()

      expect(onResolved).toHaveBeenCalledWith('fire')
    })

    it("fires 'rejected' event", async () => {
      const onResolved = jest.fn()
      const onRejected = jest.fn()

      const { reject } = factory(undefined, undefined, {
        onResolved,
        onRejected,
      })

      reject(new Error('fire'))

      await tick()

      expect(onRejected).toHaveBeenCalledWith(new Error('fire'))

      expect(onResolved).not.toHaveBeenCalled()
    })

    it("fires 'pending' event on pending delay time elapsed", async () => {
      const onResolved = jest.fn()
      const onRejected = jest.fn()
      const onPending = jest.fn()

      factory({ pendingDelay: 100 }, undefined, {
        onPending,
        onResolved,
        onRejected,
      })

      expect(onResolved).not.toHaveBeenCalled()
      expect(onRejected).not.toHaveBeenCalled()
      expect(onPending).not.toHaveBeenCalled()

      jest.runAllTimers()

      await tick()

      expect(onPending).toHaveBeenCalledWith(undefined)

      expect(onResolved).not.toHaveBeenCalled()
      expect(onRejected).not.toHaveBeenCalled()
    })
  })

  mockWarn()

  it('warns on missing slot', async () => {
    const [promise, _resolve, reject] = fakePromise<any>()
    mount(Promised, {
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
