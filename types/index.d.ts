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
  promise: Promise<any> | null
  pendingDelay: Number | String
}

export var Promised: ComponentOptions<
  never,
  Data,
  DefaultMethods<never>,
  DefaultComputed,
  Props
>
