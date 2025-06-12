<template>
  <tbody>
    <slot />
  </tbody>
</template>

<style scoped>
/* Borda entre linhas */
tbody::v-deep tr {
  border-bottom: 1px solid var(--color-border); /* Use a color from your palette */
}

/* Remover borda da última linha */
tbody::v-deep tr:last-child {
  border-bottom: none;
}
</style>
