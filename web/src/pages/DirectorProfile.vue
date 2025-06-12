<script lang="ts">
import Card from '@/components/Card/Card.vue'
import CardTitle from '@/components/Card/CardTitle.vue'
import Container from '@/components/Container.vue'
import { getDirectorProfile } from '@/services/authService'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

type ProfileDataType = {
  loading: boolean
  profile: null | Awaited<ReturnType<typeof getDirectorProfile>>
}

export default {
  components: {
    Container,
    Card,
    CardTitle,
  },
  created() {
    const { user } = storeToRefs(useAuthStore())
    if (user?.value?.id) {
      this.fetchProfile(user.value.id)
    }
  },
  data(): ProfileDataType {
    return {
      loading: false,
      profile: null,
    }
  },
  methods: {
    async fetchProfile(id: string | number) {
      this.loading = true

      try {
        const profile = await getDirectorProfile(String(id))
        this.profile = profile
      } catch (err: any) {
        console.error(err.message)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <Container>
    <h1>O meu perfil</h1>

    <Card class="card">
      <CardTitle>Detalhes</CardTitle>

      <strong>Nome: </strong>
      <p>{{ profile?.name }}</p>
      <br />

      <strong>Email: </strong>
      <p>{{ profile?.email }}</p>
      <br />

      <strong>Cargo: </strong>
      <p>Diretor</p>
    </Card>
  </Container>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  h1 {
    font-weight: bold;
  }

  h3 {
    margin-bottom: 1.25rem;
  }
}

.card {
  strong {
    font-weight: bold;
    text-transform: uppercase;
  }

  p {
    display: inline;
  }
}
</style>
