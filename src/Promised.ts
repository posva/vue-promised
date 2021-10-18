import {
  defineComponent,
  isVue3,
  PropType,
  reactive,
  toRefs,
  warn,
  AllowedComponentProps,
  ComponentCustomProps,
  VNodeProps,
  VNode,
} from 'vue-demi'
import { usePromise, UsePromiseResult } from './usePromise'

export const PromisedImpl = /*#__PURE__*/ defineComponent({
  name: 'Promised',
  props: {
    promise: {} as PropType<Promise<unknown> | null | undefined>,
    // validator: p =>
    //   p && typeof (p as any).then === 'function' && typeof (p as any).catch === 'function',

    pendingDelay: {
      type: [Number, String],
      default: 200,
    },
  },

  setup(props, { slots }) {
    const propsAsRefs = toRefs(props)
    const promiseState = reactive(
      usePromise(propsAsRefs.promise, propsAsRefs.pendingDelay)
    )

    return () => {
      if ('combined' in slots) {
        return slots.combined!(promiseState)
      }

      const [slotName, slotData] = promiseState.error
        ? ['rejected', promiseState.error]
        : !promiseState.isPending
        ? ['default', promiseState.data]
        : promiseState.isDelayElapsed
        ? ['pending', promiseState.data]
        : [null]

      if (__DEV__ && slotName && !slots[slotName]) {
        ;(isVue3 ? warn : console.warn)(
          `(vue-promised) Missing slot "${slotName}" in Promised component. This will fail in production.`
        )
        return null
      }

      return slotName && slots[slotName]!(slotData)
    }
  },
})

export const Promised = PromisedImpl as unknown as {
  new (): {
    $props: AllowedComponentProps &
      ComponentCustomProps &
      VNodeProps & { promise: Promise<unknown> }
  }

  $slots: {
    default: (data: unknown) => VNode[]
    rejected: (error: Error) => VNode[]
    pending: (error: unknown) => VNode[]

    combined: (arg: UsePromiseResult) => VNode[]
  }
}
