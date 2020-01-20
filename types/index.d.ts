import {
  DefaultMethods,
  DefaultComputed,
  ComponentOptions,
  PropsDefinition,
  PropType
} from 'vue/types/options'
import { Vue } from 'vue/types/vue'

export declare var Promised: {
  props: {
    tag: PropType<string>
    promise: PropType<Promise<any> | null>
    pendingDelay: PropType<number | string>
  }

  data: () => {
    resolved: boolean
    data: any | null
    error: any | null
    isDelayElapsed: boolean
  }
}
