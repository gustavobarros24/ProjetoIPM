<script lang="ts">
import { defineComponent, ref, computed, type PropType, onMounted, onBeforeUnmount } from 'vue'

type Option = { id: string; label: string }

export default defineComponent({
  name: 'Combobox',
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
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isOpen = ref(false)
    const searchQuery = ref('')
    const comboboxRef = ref<HTMLElement | null>(null)

    const toggleDropdown = () => {
      isOpen.value = !isOpen.value
    }

    const closeDropdown = () => {
      isOpen.value = false
    }

    const selectOption = (option: Option) => {
      emit('update:modelValue', option)
      closeDropdown()
    }

    const filteredOptions = computed(() =>
      props.options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.value.toLowerCase()),
      ),
    )

    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside AND no other dropdown is opening
      if (comboboxRef.value && 
          !comboboxRef.value.contains(event.target as Node) &&
          !(event.target as HTMLElement).closest('.wrapper')) {
        closeDropdown()
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      isOpen,
      searchQuery,
      filteredOptions,
      comboboxRef,
      toggleDropdown,
      selectOption,
    }
  },
})
</script>

<template>
  <div class="wrapper" ref="comboboxRef" :class="{ disabled: disabled }">
    <!--<div class="trigger" @click.stop="toggleDropdown">-->
      <div class="trigger" @click.stop="!disabled && toggleDropdown()">
      <span>{{ modelValue?.label || placeholder }}</span>
      <i class="pi pi-chevron-down"></i>
    </div>

    <!--<div v-if="isOpen" class="content" @click.stop>-->
    <div v-if="isOpen && !disabled" class="content" @click.stop>  
      <div class="search">
        <i class="pi pi-search"></i>
        <input type="text" placeholder="Pesquisar..." v-model="searchQuery" @click.stop/>
      </div>

      <ul class="options-list">
        <li
          v-for="option in filteredOptions"
          :key="option.id"
          @click="selectOption(option)"
          class="option"
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

.wrapper.disabled {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
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
}

.trigger:hover {
  border-color: var(--primary-color);
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

.search {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border);
}

.search i {
  margin-right: 0.5rem;
  color: var(--color-text-muted);
}

.search input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: var(--color-text);
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
</style>
