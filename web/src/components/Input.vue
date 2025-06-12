<script setup lang="ts">
  interface IInputProps {
    modelValue: string
    type?: string
    min?: number
    max?: number
  }

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
  }>()

  const props = defineProps<IInputProps>()

  const handleInput = (e: Event) => {
    emit('update:modelValue', (e.target as HTMLInputElement).value)
  }
</script>

<template>
  <input
    :value="modelValue"
    :type="type || 'text'"
    :min="min"
    :max="max"
    @input="handleInput"
  >
</template>

<style scoped>
input {
  padding: 0.5rem 0.625rem;
  border-radius: 4px;
  border: solid 1px hsla(0, 0%, 0%, 0.2);
  height: 42px;
  width: 100%;
}
</style>
