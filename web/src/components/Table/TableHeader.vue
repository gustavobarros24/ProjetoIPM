<template>
  <thead>
    <slot />
  </thead>
</template>

<style scoped>
/* Borda arredondada da esquerda */
::v-deep th:first-child {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

/* Borda arredondada da direita */
::v-deep th:last-child {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}
</style>
