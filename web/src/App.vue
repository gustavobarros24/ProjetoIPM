<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import GlobalDialog from './components/GlobalDialog.vue'
import Button from './components/Button.vue'
import { ServerError } from './errors/server-error'

const hasError = ref(false)
const showToast = ref(false)
const errorMessage = ref('')

onErrorCaptured((error) => {
  console.error('Error capturado em App.vue:', error)

  if (error instanceof ServerError) {
    hasError.value = true
  } else {
    showToast.value = true
  }

  errorMessage.value = (error as Error).message || 'Ocorreu um erro inesperado.'

  return false
})

function retry() {
  hasError.value = false
}
</script>

<template>
  <div v-if="hasError" class="error-boundary">
    <h1>Ocorreu um Erro</h1>
    <p>{{ errorMessage }}</p>
    <Button @click="retry">Tentar Novamente</Button>
  </div>

  <div v-else>
    <Header />
    <RouterView />
    <Footer />
    <GlobalDialog />
  </div>
</template>

<style>
.error-boundary {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100dvh;
  text-align: center;
}
</style>
