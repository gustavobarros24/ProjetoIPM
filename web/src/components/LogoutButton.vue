<script lang="ts">
import { useAuthStore } from '@/stores/auth'
import Button from './Button.vue'

export default {
  components: {
    Button,
  },
  methods: {
    logout() {
      const authStore = useAuthStore()
      authStore.deleteUser()
      this.$router.push('/auth')
    },
  },
}
</script>

<template>
  <Button variant="secondary" @click="logout"> SAIR &raquo; </Button>
</template>
