import { ref, unref, watch } from 'vue'
import { Refable } from './utils'

export function usePromise<T = unknown>(
  promise: Refable<Promise<T> | null | undefined>,
  pendingDelay: Refable<number | string> = 200
) {
  const pending = ref(false)
  const delayElapsed = ref(false)
  const error = ref<Error | undefined | null>()
  const data = ref<T | null | undefined>()

  let timerId: ReturnType<typeof setTimeout> | undefined | null

  watch(
    () => unref(promise),
    (newPromise) => {
      pending.value = true
      error.value = null
      if (!newPromise) {
        data.value = null
        pending.value = true
        if (timerId) clearTimeout(timerId)
        timerId = null
        return
      }

      if (unref(pendingDelay) > 0) {
        delayElapsed.value = false
        if (timerId) clearTimeout(timerId)
        timerId = setTimeout(() => {
          delayElapsed.value = true
        }, Number(unref(pendingDelay)))
      } else {
        delayElapsed.value = true
      }

      newPromise
        .then((newData) => {
          // ensure we are dealing with the same promise
          if (newPromise === unref(promise)) {
            data.value = newData
            pending.value = false
          }
        })
        .catch((err) => {
          // ensure we are dealing with the same promise
          if (newPromise === unref(promise)) {
            error.value = err
            pending.value = false
          }
        })
    },
    { immediate: true }
  )

  return { pending, delayElapsed, error, data }
}
