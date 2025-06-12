<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

type VariantType = 'primary' | 'secondary' | 'ghost' | 'link' | 'destructive'
type AlignType = 'start' | 'center' | 'end'

export default defineComponent({
  components: {
    RouterLink,
  },
  props: {
    to: {
      type: [Object, String] as PropType<RouteLocationRaw | string>,
      required: true,
    },
    variant: {
      type: String as PropType<VariantType>,
      default: 'link',
    },
    align: {
      type: String as PropType<AlignType>,
      default: 'start',
    },
  },
})
</script>

<template>
  <RouterLink :class="[variant, align]" activeClass="link-active-class" :to="to">
    <slot />
  </RouterLink>
</template>

<style scoped>
.primary,
.secondary,
.ghost,
.link,
.destructive {
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 1em;
  padding: 0.5rem 0.625rem;
  border-radius: 4px;
  height: 42px;
}

.primary {
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;

  &:hover {
    background-color: var(--primary-color-dark);
    transition: 0.1s background-color;
  }
}

.secondary {
  color: var(--color-text);
  background-color: transparent;
  border: 1px solid var(--vt-c-black);

  &:hover {
    color: white;
    background-color: var(--vt-c-black);
    transition: 0.1s background-color;
  }
}

.ghost {
  color: var(--vt-c-black);

  &:hover {
    background-color: var(--primary-color-light);
    transition: 0.1s background-color;
  }
}

.link {
  color: var(--vt-c-black);
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
}

.ghost.link-active-class {
  background-color: var(--primary-color-light);
}

.start {
  justify-content: flex-start;
}

.center {
  justify-content: center;
}

.end {
  justify-content: flex-end;
}
</style>
