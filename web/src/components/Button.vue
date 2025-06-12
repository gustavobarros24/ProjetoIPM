<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

type Variant = 'link' | 'ghost' | 'primary' | 'secondary' | 'destructive'

export default defineComponent({
  name: 'Button',
  props: {
    variant: {
      type: String as PropType<Variant>,
      default: 'primary',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <button :class="variant" :loading="loading" :disabled="disabled">
    <div v-if="loading" class="spinner"></div>
    <span v-else>
      <slot />
    </span>
  </button>
</template>

<style scoped>
.primary,
.secondary,
.link,
.destructive {
  border-radius: 4px;
  padding: 0.5rem 0.625rem;
  height: 42px;
  border: none;
  font-family: inherit;
}

.primary {
  background-color: var(--primary-color);

  color: white;
  font-weight: 500;

  &:hover {
    background-color: var(--primary-color-dark);
    transition: 0.1s background-color;
  }

  &[loading='true'] {
    background-color: var(--disabled-color);
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:disabled {
    background-color: var(--disabled-color);
    pointer-events: none;
    opacity: 0.6;
  }
}

.secondary {
  background-color: transparent;
  border: 1px solid var(--vt-c-black);

  &:hover {
    color: white;
    background-color: var(--vt-c-black);
    transition: 0.1s background-color;
  }
}

.link {
  background-color: transparent;
  font-size: 1em;
  text-decoration: underline;

  &:hover {
    color: var(--primary-color);
    transition: 0.1s color;
  }
}

.destructive {
  background-color: transparent;
  color: var(--destructive-color-on-background);
  border: solid 1px var(--destructive-color-on-background);

  &:hover {
    background-color: var(--destructive-color-on-background);
    color: white;
    transition: 0.1s background-color;
  }

  &[loading='true'] {
    border-color: var(--disabled-color);
    cursor: not-allowed;
  }

  &:disabled {
    border-color: var(--disabled-color);
    color: var(--color-text-muted);
    pointer-events: none;
    opacity: 0.6;
  }
}

.spinner {
  margin: 0 auto;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
