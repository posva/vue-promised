import { mount } from '@vue/test-utils'
import { Promised } from '../src'
import fakePromise from 'faked-promise'

// keep a real setTimeout
const timeout = setTimeout
const tick = () => new Promise(resolve => timeout(resolve, 0))
jest.useFakeTimers()

describe('Promised', () => {
  describe('three slots', () => {
    /** @type {import('@vue/test-utils').Wrapper} */
    let wrapper, promise, resolve, reject
    beforeEach(() => {
      [promise, resolve, reject] = fakePromise()
      wrapper = mount(Promised, {
        propsData: { promise, pendingDelay: 0 },
        slots: {
          pending: `<span>pending</span>`,
        },
        scopedSlots: {
          default: `<span slot-scope="data">{{ data }}</span>`,
          rejected: `<span class="error" slot-scope="error">{{ error.message }}</span>`,
        },
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

    test('displays an error if rejected', async () => {
      reject(new Error('hello'))
      await tick()
      expect(wrapper.text()).toBe('hello')
    })
  })
})
