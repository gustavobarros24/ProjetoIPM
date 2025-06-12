<script lang="ts">
import Button from '@/components/Button.vue'
import Card from '@/components/Card/Card.vue'
import Container from '@/components/Container.vue'
import Skeleton from '@/components/Skeleton.vue'
import { getShiftRequestById } from '@/services/inboxService'
import { getShiftsByCourseId } from '@/services/shiftsService'
import Calendar from '@/components/Calendar.vue'
import { getStudentProfile } from '@/services/authService'
import CardHeader from '@/components/Card/CardHeader.vue'
import CardTitle from '@/components/Card/CardTitle.vue'
import { acceptRequest, rejectRequest } from '@/services/requestsService'
import CardDescription from '@/components/Card/CardDescription.vue'
import Badge from '@/components/Badge.vue'
import Link from '@/components/Link.vue'
import { useAuthStore, type IUserInfo } from '@/stores/auth'
import { storeToRefs } from 'pinia'

type DetailsDataType = {
  details: null | Awaited<ReturnType<typeof getShiftRequestById>>
  events: Awaited<ReturnType<typeof getShiftsByCourseId>>
  loading: boolean
  loadingAccept: boolean
  loadingReject: boolean
  message: string
  newShiftId: string
  oldShiftId: string
  user: IUserInfo | null
}

export default {
  components: {
    Container,
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    Button,
    Skeleton,
    Calendar,
    Badge,
    Link,
  },
  data(): DetailsDataType {
    const authStore = useAuthStore()
    const { user } = storeToRefs(authStore)

    return {
      details: null,
      loading: false,
      loadingAccept: false,
      loadingReject: false,
      events: [],
      message: '',
      newShiftId: '',
      oldShiftId: '',
      user: user.value,
    }
  },
  created() {
    this.$watch(() => this.$route.params.id, this.fetchDetails, { immediate: true })
  },
  methods: {
    async fetchDetails(id: string | string[]) {
      this.loading = true

      try {
        const shiftRequest = await getShiftRequestById(id)
        this.details = shiftRequest

        if (shiftRequest.response) this.message = shiftRequest.response

        const profile = await getStudentProfile(shiftRequest.studentId)
        const studentEnrolledShifts = profile.shifts.map((s) => ({
          ...s,
          classNames: ['subscribed'],
        }))

        const newShift = shiftRequest.newShift
        newShift.classNames = ['selected', 'selected-normal-cursor']
        this.newShiftId = newShift.id

        const oldShift = shiftRequest.oldShift
        oldShift.classNames = ['old-subscribed']
        this.oldShiftId = oldShift.id

        this.events = [...studentEnrolledShifts, newShift, oldShift]
      } catch (err) {
        // TODO: tratar erro corretamente
        console.log(err)
      } finally {
        this.loading = false
      }
    },
    async handleAcceptRequest() {
      const shouldContinue = await this.$confirm(
        'Tem certeza que deseja aceitar este pedido? Esta ação não poderá ser desfeita.',
      )
      if (!shouldContinue) return

      const data = {
        shiftRequestsId: this.details!.id,
        message: this.message,
        studentId: String(this.details?.studentId),
        newShiftId: this.newShiftId,
        oldShiftId: this.oldShiftId,
      }

      this.loadingAccept = true
      try {
        await acceptRequest(data)
        this.$router.push('/pedidos')
      } catch (err: any) {
        console.error('Erro ao aceitar pedido:', err)
      } finally {
        this.loadingAccept = false
      }
    },
    async handleRejectRequest() {
      const shouldContinue = await this.$confirm(
        'Tem certeza que deseja rejeitar este pedido? Esta ação não poderá ser desfeita.',
      )
      if (!shouldContinue) return

      const data = {
        shiftRequestsId: this.details!.id,
        message: this.message,
      }

      this.loadingReject = true
      try {
        await rejectRequest(data)
        this.$router.push('/pedidos')
      } catch (err: any) {
        console.error('Erro ao rejeitar pedido:', err)
      } finally {
        this.loadingReject = false
      }
    },
  },
}
</script>

<template>
  <Container class="container">
    <Skeleton v-if="loading" class="skeleton-title" />
    <h1 v-else>Pedido Troca de Turno ({{ details?.course?.abbreviation }})</h1>

    <Card class="card">
      <CardTitle>Detalhes</CardTitle>

      <div class="card-details">
        <div v-show="!loading">
          <Badge v-if="details?.response === null" variant="pending">Pedido pendente</Badge>
          <Badge v-else-if="details?.accepted" variant="success">Pedido aceite</Badge>
          <Badge v-else variant="destructive">Pedido rejeitado</Badge>
        </div>

        <dl class="details">
          <dt>AUTOR:</dt>
          <Skeleton v-if="loading" class="skeleton-txt" />
          <dd v-else>
            <div class="author-info">
              <span>{{ details?.author?.name }}</span>
              <Link :to="'/alunos/' + details?.author?.id" class="author-link">Ver perfil</Link>
            </div>
          </dd>
          <br />

          <dt>EMAIL:</dt>
          <Skeleton v-if="loading" class="skeleton-txt" />
          <dd v-else>
            {{ details?.author?.email }} (Aluno,
            {{ details?.author?.specialStatus ? 'Estatuto Especial' : 'Estatuto Normal' }})
          </dd>
          <br />

          <dt>ABERTURA:</dt>
          <Skeleton v-if="loading" class="skeleton-txt" />
          <dd v-else>{{ details?.createdAt }}</dd>
          <br />
          <br />

          <dt>TURNO ATUAL:</dt>
          <Skeleton v-if="loading" class="skeleton-txt" />
          <dd v-else>{{ details?.course?.abbreviation }}-{{ details?.oldShift.name }}</dd>
          <br />

          <dt>TURNO PEDIDO:</dt>
          <Skeleton v-if="loading" class="skeleton-txt" />
          <dd v-else>{{ details?.course?.abbreviation }}-{{ details?.newShift.name }}</dd>
        </dl>

        <p v-if="details?.message" class="message">"{{ details?.message }}"</p>
        <p v-else class="message">Sem mensagem do aluno.</p>
      </div>
    </Card>

    <Card>
      <CardTitle>Horário do Aluno</CardTitle>
      <Calendar :events="events" />
    </Card>

    <Card class="card">
      <CardHeader>
        <CardTitle>Observações (opcional)</CardTitle>
        <CardDescription>Escreva observações que ache pertinente para o Aluno</CardDescription>
      </CardHeader>

      <Skeleton v-if="loading" class="skeleton-p" />
      <textarea
        v-else
        aria-label="Escreva as observações para o aluno"
        name="message"
        id="message"
        placeholder="Escreva as observações..."
        class="message-textarea"
        v-model="message"
        :readonly="details?.response !== null"
      >
        {{ details?.response }}
      </textarea>
    </Card>

    <footer v-if="details?.response === null && user?.role === 'DIRECTOR'" class="action-buttons">
      <Button
        type="button"
        variant="destructive"
        @click="handleRejectRequest"
        :disabled="loadingAccept"
        :loading="loadingReject"
        >Rejeitar</Button
      >
      <Button
        type="button"
        @click="handleAcceptRequest"
        :loading="loadingAccept"
        :disabled="loadingReject"
        >Aceitar &raquo;</Button
      >
    </footer>
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
}

.card,
.card-details {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.details {
  dt,
  dd {
    display: inline;
  }

  dt {
    font-weight: bold;
  }

  dt::after {
    content: ' ';
  }
}

.message {
  font-style: italic;
  white-space: pre-line;
}

.message-textarea {
  width: 100%;
  height: 12.5rem;
  resize: vertical;
  padding: 1.125rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;

  &:read-only {
    resize: none;
    outline: none;
  }
}

.action-buttons {
  display: flex;
  justify-content: end;
  gap: 1.5rem;
}

.skeleton-title {
  display: inline-block;
  height: 52px;
  width: 360px;
}

.skeleton-txt {
  display: inline-block;
  height: 14px;
  width: 126px;
}

.skeleton-p {
  height: 120px;
  width: 100%;
}

.author-info {
  display: inline-flex;
  flex-direction: row;
}

.author-link {
  padding: 0;
  margin: 0;
  height: fit-content;
  margin-left: 1rem;
}
</style>
