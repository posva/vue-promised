import { mount } from '@vue/test-utils'
import { Promised } from '../src'
import fakePromise from 'faked-promise'

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

    it('displays pending', async () => {
      expect(wrapper.text()).toBe('pending')
    })

    it('displays the resolved value once resolved', async () => {
      resolve('foo')
      await tick()
      expect(wrapper.text()).toBe('foo')
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
  })
})
