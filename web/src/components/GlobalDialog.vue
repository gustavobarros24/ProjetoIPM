<!-- filepath: /src/components/GlobalDialog.vue -->
<script lang="ts" setup>
import { useGlobalDialog } from '@/composables/useGlobalDialog'
import Button from './Button.vue'

const { isVisible, message, handleConfirm } = useGlobalDialog()
</script>

<template>
  <div v-if="isVisible" class="dialog-overlay" @click="handleConfirm(false)"></div>

  <div v-if="isVisible" class="dialog-box">
    <p class="dialog-message">{{ message }}</p>

    <footer class="dialog-footer">
      <Button variant="destructive" @click="handleConfirm(false)">Cancelar</Button>
      <Button variant="primary" @click="handleConfirm(true)">Confirmar &raquo;</Button>
    </footer>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
}
.dialog-box {
  position: fixed;
  z-index: 99;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  width: 100%;
  max-width: 32rem;
  background: white;
  padding: 1.5rem;
  border-radius: 4px;
  text-align: center;
}

.dialog-message {
  text-align: start;
}

.dialog-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: end;
  gap: 1.25rem;
}
</style>
