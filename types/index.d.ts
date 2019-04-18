import {
  DefaultMethods,
  DefaultComputed,
  ComponentOptions,
  PropsDefinition,
} from 'vue/types/options'
import { Vue } from 'vue/types/vue';

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
  Vue,
  Data,
  DefaultMethods<Vue>,
  DefaultComputed,
  PropsDefinition<Props>
>
