import { ref } from 'vue'

const isVisible = ref(false)
const message = ref('')
let resolveFn: (value: boolean) => void

export const useGlobalDialog = () => {
  const showDialog = (msg: string): Promise<boolean> => {
    message.value = msg
    isVisible.value = true
    return new Promise((resolve) => {
      resolveFn = resolve
    })
  }

  const handleConfirm = (result: boolean) => {
    isVisible.value = false
    resolveFn(result)
  }

  return {
    isVisible,
    message,
    showDialog,
    handleConfirm,
  }
}
