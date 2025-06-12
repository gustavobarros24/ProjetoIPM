<template>
  <td>
    <slot />
  </td>
</template>

<style scoped>
td {
  /* padding: 1.25rem 1.875rem; */
  padding: 0.25rem;
  font-size: 1em;
}

td:first-child {
  max-width: 80px;
  margin: 0.25rem; /* Reduced margin for mobile */
}

td:nth-child(2) {
  width: minmax(80px, 100%);
  margin: 0.25rem;
}

@media (min-width: 769px) {
  td {
    padding: 0.5rem;
  }

  td:first-child,
  td:nth-child(2) {
    margin: 0.5rem;
  }
}
</style>
