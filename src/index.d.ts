import {
  DefaultMethods,
  DefaultComputed,
  ComponentOptions,
} from 'vue/types/options'

interface Data {
  (): {
    resolved: boolean
    data: any | null
    error: any | null

    isDelayElapsed: boolean
  }
}

interface Props {
  tag: String
  promise: Promise | null
  pendingDelay: Number | String
}

export type Promised = ComponentOptions<
  never,
  Data,
  DefaultMethods<never>,
  DefaultComputed<never>,
  Props
>
