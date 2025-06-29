import { ComponentCustomProperties } from 'vue'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $confirm: (message: string) => Promise<boolean>
  }
}
