<template>
  <section class="card">
    <slot />
  </section>
</template>

<style scoped>
.card {
  padding: 2.25rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 2px 2px 4px 0px rgba(0, 0, 0, 0.1);
}
</style>
