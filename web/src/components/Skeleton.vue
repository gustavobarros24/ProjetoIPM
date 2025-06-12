<template>
  <div class="skeleton" />
</template>

<style scoped>
.skeleton {
  background-color: var(--disabled-color);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 4px;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}
</style>
