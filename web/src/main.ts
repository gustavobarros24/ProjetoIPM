import './assets/main.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import GlobalDialog from './components/GlobalDialog.vue'
import { useGlobalDialog } from './composables/useGlobalDialog'

const { showDialog } = useGlobalDialog()

export const pinia = createPinia()
const app = createApp(App)

app.component('GlobalDialog', GlobalDialog)

app.config.globalProperties.$confirm = (message: string) => {
  return showDialog(message)
}

app.use(pinia)
app.use(router)

app.mount('#app')
