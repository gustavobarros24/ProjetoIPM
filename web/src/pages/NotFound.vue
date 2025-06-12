<script lang="ts">
import { useAuthStore } from '@/stores/auth'
import Link from '../components/Link.vue'

export default {
  components: {
    Link,
  },
  computed: {
    homeTarget() {
      const auth = useAuthStore()

      if (auth.user?.role === 'STUDENT') {
        return `/alunos/${auth.user.id}`
      }

      return '/unidades-curriculares'
    },
  },
}
</script>

<template>
  <section>
    <h1>404 Não Encotrado</h1>

    <p>Essa página não existe</p>

    <Link :to="homeTarget" variant="primary"> Voltar ao início </Link>
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  height: calc(100dvh - var(--header-height));
}

p {
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}
</style>
