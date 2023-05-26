import { ref, unref, watch, Ref, computed, ComputedRef } from 'vue-demi'
import { Refable } from './utils'

/**
 * Returns the state of a Promise and observes the Promise if it's a Ref to
 * automatically update the state
 *
 * @param promise - Ref of a Promise or raw Promise
 * @param pendingDelay - optional delay to wait before displaying pending
 */
export function usePromise<T = unknown>(
  promise: Refable<Promise<T> | null | undefined>,
  pendingDelay: Refable<number | string> = 200
): UsePromiseResult<T> {
  const isRejected = ref(false)
  const isResolved = ref(false)
  const isPending = computed(() => !isRejected.value && !isResolved.value)
  const isDelayElapsed = ref(false)
  const error = ref<Error | undefined | null>()
  const data = ref<T | null | undefined>()

  let timerId: ReturnType<typeof setTimeout> | undefined | null

  watch(
    () => unref(promise),
    (newPromise) => {
      isRejected.value = false
      isResolved.value = false
      error.value = null
      if (!newPromise) {
        data.value = null
        if (timerId) clearTimeout(timerId)
        timerId = null
        return
      }

      if (unref(pendingDelay) > 0) {
        isDelayElapsed.value = false
        if (timerId) clearTimeout(timerId)
        timerId = setTimeout(() => {
          isDelayElapsed.value = true
        }, Number(unref(pendingDelay)))
      } else {
        isDelayElapsed.value = true
      }

      newPromise
        .then((newData) => {
          // ensure we are dealing with the same promise
          if (newPromise === unref(promise)) {
            data.value = newData
            isResolved.value = true
          }
        })
        .catch((err) => {
          // ensure we are dealing with the same promise
          if (newPromise === unref(promise)) {
            error.value = err
            isRejected.value = true
          }
        })
    },
    { immediate: true }
  )

  return { isPending, isRejected, isResolved, isDelayElapsed, error, data }
}

/**
 * Return type of `usePromise()`
 */
export interface UsePromiseResult<T = unknown> {
  isPending: ComputedRef<boolean>
  isResolved: Ref<boolean>
  isRejected: Ref<boolean>
  isDelayElapsed: Ref<boolean>
  error: Ref<Error | undefined | null>
  data: Ref<T | undefined | null>
}
