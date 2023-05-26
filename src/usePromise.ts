import { ref, watch, Ref, computed, ComputedRef } from 'vue-demi'
import {
  MaybeRef,
  toValue,
  // TODO:
  // MaybeRefOrGetter
} from 'vue'

/**
 * Returns the state of a Promise and observes the Promise if it's a Ref to
 * automatically update the state
 *
 * @param promise - Ref of a Promise or raw Promise
 * @param pendingDelay - optional delay to wait before displaying pending
 */
export function usePromise<T = unknown>(
  promise: MaybeRef<Promise<T> | null | undefined>,
  pendingDelay: MaybeRef<number | string> = 200
): UsePromiseResult<T> {
  const isRejected = ref(false)
  const isResolved = ref(false)
  const isPending = computed(() => !isRejected.value && !isResolved.value)
  const isDelayElapsed = ref(false)
  const error = ref<Error | undefined | null>()
  const data = ref<T | null | undefined>()

  let timerId: ReturnType<typeof setTimeout> | undefined | null

  watch(
    () => toValue(promise),
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

      const pendingDelayNumber = Number(toValue(pendingDelay)) || 0
      if (pendingDelayNumber > 0) {
        isDelayElapsed.value = false
        if (timerId) clearTimeout(timerId)
        timerId = setTimeout(() => {
          isDelayElapsed.value = true
        }, pendingDelayNumber)
      } else {
        isDelayElapsed.value = true
      }

      newPromise
        .then((newData) => {
          // ensure we are dealing with the same promise
          if (newPromise === toValue(promise)) {
            data.value = newData
            isResolved.value = true
          }
        })
        .catch((err) => {
          // ensure we are dealing with the same promise
          if (newPromise === toValue(promise)) {
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
