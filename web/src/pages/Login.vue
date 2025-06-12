<script lang="ts">
import Input from '../components/Input.vue'
import Button from '../components/Button.vue'
import { z } from 'zod'

import { useAuthStore } from '@/stores/auth'
import { login } from '@/services/authService'

const loginSchema = z.object({
  email: z.string().email({
    message: 'Email inválido',
  }),
  password: z.string().min(6, {
    message: 'A palavra passe deve conter no mínimo 6 caracteres',
  }),
})
type LoginSchemaType = z.infer<typeof loginSchema>

interface LoginData {
  email: string
  password: string
  errors: null | z.ZodFormattedError<LoginSchemaType>
  serverError: null | string
  loading: boolean
}

export default {
  components: {
    Input,
    Button,
  },
  data(): LoginData {
    return {
      email: '',
      password: '',
      errors: null,
      serverError: null,
      loading: false,
    }
  },
  methods: {
    async handleSubmit() {
      const form = {
        email: this.email,
        password: this.password,
      }

      // limpar erros
      this.serverError = null
      this.errors = null

      // validação do input
      const validSchema = loginSchema.safeParse(form)
      if (!validSchema.success) {
        this.errors = validSchema.error.format()
        return
      }

      // chamada a API
      try {
        this.loading = true
        const { id, email, role } = await login(form.email, form.password)
        const authStore = useAuthStore()
        authStore.updateUser(id, email, role)

        if (role === 'DIRECTOR') {
          this.$router.push('/')
        } else if (role === 'STUDENT') {
          this.$router.push(`/alunos/${id}`)
        }
      } catch (err: any) {
        this.serverError = err.message || 'Erro no servidor'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
  <main class="container">
    <form @submit.prevent="handleSubmit">
      <h1>Iniciar Sessão</h1>

      <div>
        <Input v-model="email" placeholder="enter email..." type="email" aria-label="email input" />
        <div v-if="errors?.email">
          <p v-for="error in errors.email._errors" :key="error" class="error-message">
            {{ error }}
          </p>
        </div>
      </div>

      <div>
        <Input
          v-model="password"
          placeholder="enter password..."
          type="password"
          aria-label="password input"
        />
        <div v-if="errors?.password">
          <p v-for="error in errors.password._errors" :key="error" class="error-message">
            {{ error }}
          </p>
        </div>

        <div v-if="serverError" class="error-message">
          {{ serverError }}
        </div>
      </div>

      <Button :loading="loading"> Entrar &raquo; </Button>
    </form>
  </main>
</template>

<style scoped>
main {
  h1 {
    text-align: center;
    font-weight: 700;
  }

  height: calc(100dvh - var(--header-height));
  display: flex;
  justify-content: center;
  align-items: center;

  form {
    width: 326px;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .error-message {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    /* FIXME: change error color to variable */
    color: red;
  }
}
</style>
