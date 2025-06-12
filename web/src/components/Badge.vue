<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  name: 'Badge',
  props: {
    variant: {
      type: String as PropType<'destructive' | 'pending' | 'success'>,
      default: 'success',
    },
  },
})
</script>

<template>
  <div class="badge" :class="variant">
    <slot />
  </div>
</template>

<style scoped>
.badge {
  width: fit-content;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.destructive {
  /* background-color: hsl(0, 100%, 82%);
  color: #9d0000; */
  background-color: var(--destructive-color);
  color: white;
}

.pending {
  /* background-color: #fefce8;
  color: #d08700; */
  background-color: #d08700;
  color: white;
}

.success {
  /* background-color: hsl(212, 100%, 82%); */
  background-color: var(--primary-color);
  color: white;
}
</style>
