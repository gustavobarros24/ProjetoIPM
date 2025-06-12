<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export type Option = { id: string | number; label: string }

export default defineComponent({
  name: 'Dropdown',
  props: {
    placeholder: {
      type: String,
      default: 'Selecionar...',
    },
    options: {
      type: Array as PropType<Option[]>,
      required: true,
    },
    modelValue: {
      type: Object as PropType<Option | null>,
      default: null, // Ensure a default value is provided
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isOpen: false,
    }
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen
    },
    selectOption(option: Option) {
      this.$emit('update:modelValue', option)
      this.isOpen = false
    },
    handleClickOutside(event: MouseEvent) {
      if (this.$el && !this.$el.contains(event.target as Node)) {
        this.isOpen = false
      }
    },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
})
</script>

<template>
  <div class="wrapper">
    <div class="trigger" @click.stop="toggleDropdown">
      <span class="ellipsis">{{ modelValue?.label || placeholder }}</span>
      <i class="pi pi-chevron-down"></i>
    </div>

    <div v-if="isOpen" class="content">
      <ul class="options-list">
        <li
          v-for="option in options"
          :key="option.id"
          @click="selectOption(option)"
          class="option ellipsis"
          :class="{ selected: modelValue?.id === option.id }"
        >
          {{ option.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  width: 100%;
  max-width: 300px;
}

.trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text);
  height: 36px;
}

.trigger:hover {
  border-color: var(--primary-color);
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.content {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  margin-top: 0.25rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.options-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
}

.option {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text);
}

.option:hover {
  background-color: var(--primary-color-light);
  color: var(--primary-color);
}

.option.selected {
  background-color: var(--primary-color-light);
  font-weight: bold;
  color: var(--primary-color);
}
</style>
