<script lang="ts">
import Button from '@/components/Button.vue'
import Card from '@/components/Card/Card.vue'
import Container from '@/components/Container.vue'
import { getShiftsByCourseId } from '@/services/shiftsService'
import Calendar from '@/components/Calendar.vue'
import CardTitle from '@/components/Card/CardTitle.vue'
import CardDescription from '@/components/Card/CardDescription.vue'
import CardHeader from '@/components/Card/CardHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/main'
import { getStudentProfile } from '@/services/authService'
import { createNewShiftRequest } from '@/services/requestsService'
import type { EventClickArg } from '@fullcalendar/core/index.js'
import Link from '@/components/Link.vue'
import Dropdown, { type Option } from '@/components/Dropdown.vue'
import type { FormatedShiftType } from '@/types'

type DetailsDataType = {
  events: Awaited<ReturnType<typeof getShiftsByCourseId>>
  fetchedEvents: Awaited<ReturnType<typeof getShiftsByCourseId>>
  profile: null | Awaited<ReturnType<typeof getStudentProfile>>
  loading: boolean
  loadingSubmit: boolean
  selectedCourseId: Option | null
  selectedShiftId: number | null
  oldShiftId: number | null
  message: string
}

export default {
  components: {
    Container,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Calendar,
    Link,
    Dropdown,
  },
  data(): DetailsDataType {
    return {
      loading: false,
      loadingSubmit: false,
      events: [],
      fetchedEvents: [],
      profile: null,
      selectedCourseId: null,
      selectedShiftId: null,
      oldShiftId: null,
      message: '',
    }
  },
  async created() {
    const profile = await this.fetchUserProfile()
    this.profile = profile
    profile.shifts = profile.shifts.map((s) => ({ ...s, classNames: ['subscribed'] }))
    this.events = profile.shifts

    this.$watch(
      () => this.$route.query,
      async (query) => {
        if (query.courseId) {
          const selectedCourse = this.options.find((option) => option.id === query.courseId)

          if (selectedCourse) {
            this.selectedCourseId = selectedCourse
            const shifts = await this.fetchShifts(+query.courseId)
            this.fetchedEvents = shifts.map((s) => ({ ...s, classNames: ['available'] }))
          }
        }
      },
      { immediate: true },
    )
  },
  computed: {
    options() {
      if (!this.profile) return []

      return this.profile.courses.map((course) => ({
        id: course.id!,
        label: `${course.abbreviation} — ${course.name}`,
      }))
    },
    calendarEvents() {
      const studentEnrolled =
        this.profile?.shifts.map((enrolledShift) => {
          const hasOverlap = this.checkShiftConflict(enrolledShift)

          return {
            ...enrolledShift,
            classNames: hasOverlap ? ['conflict'] : ['subscribed'],
          }
        }) ?? []

      const availableShifts = this.fetchedEvents.map((shift) => {
        const isSelected = this.selectedShiftId == +shift.id
        const hasConflict = this.checkShiftConflict(shift)
        return {
          ...shift,
          classNames: isSelected ? (hasConflict ? ['conflict'] : ['selected']) : ['available'],
        }
      })

      return [...availableShifts, ...studentEnrolled]
    },
  },
  methods: {
    isOverlapping(shiftA: FormatedShiftType, shiftB: FormatedShiftType) {
      const sameId = shiftA.id === shiftB.id
      const sameDay = shiftA.daysOfWeek[0] === shiftB.daysOfWeek[0]
      const overlaps =
        (shiftA.from < shiftB.from && shiftA.to > shiftB.from) || // start before, end after
        (shiftA.from >= shiftB.from && shiftA.from < shiftB.to) // start in the middle
      return !sameId && sameDay && overlaps
    },

    checkShiftConflict(shift: FormatedShiftType) {
      return this.events.some((enrolledShift) => this.isOverlapping(shift, enrolledShift))
    },
    async fetchUserProfile() {
      const auth = useAuthStore(pinia)
      const profile = await getStudentProfile(auth.user!.id)
      return profile
    },
    async fetchShifts(id: number) {
      const shifts = await getShiftsByCourseId(String(id))
      return shifts
    },
    async onCourseChange(selectedOption: Option) {
      this.selectedCourseId = selectedOption
      const courseId = selectedOption.id
      if (courseId != null) {
        const shifts = await this.fetchShifts(Number(courseId))
        this.fetchedEvents = shifts.map((s) => ({ ...s, classNames: ['available'] }))
      }
    },
    async onSubmitRequest() {
      if (!this.selectedCourseId || !this.selectedShiftId || !this.oldShiftId) {
        console.log(this.selectedCourseId)
        console.log(this.selectedShiftId)
        console.log(this.oldShiftId)
        console.log('alo')
        return
      }

      const selectedShift = this.fetchedEvents.find((shift) => +shift.id == this.selectedShiftId)
      const hasConflict = selectedShift && this.checkShiftConflict(selectedShift)

      let confirmationMessage = hasConflict
        ? `O turno selecionado (${selectedShift.course?.abbreviation}-${selectedShift?.name}) está causando um conflito. Tem certeza de que deseja enviar o pedido mesmo assim? Esta ação não poderá ser desfeita.`
        : 'Você tem certeza de que deseja enviar este pedido? Esta ação não poderá ser desfeita.'

      const shouldContinue = await this.$confirm(confirmationMessage)
      if (!shouldContinue) return

      const data = {
        message: this.message,
        courseId: Number(this.selectedCourseId.id),
        shiftId: this.selectedShiftId,
        oldShiftId: this.oldShiftId,
      }

      this.loadingSubmit = true
      try {
        await createNewShiftRequest(data)
        this.$router.push('/pedidos')
      } catch (err: any) {
        console.error('Erro ao criar novo pedido', err)
      } finally {
        this.loadingSubmit = false
      }
    },
    handleClickEvent(event: EventClickArg): void {
      const shiftId = event.event.id
      this.selectedShiftId = Number(shiftId)

      const shiftType = event.event.extendedProps.type
      const enrolledShiftOfType = this.profile?.shifts.find((s) => s?.type === shiftType)
      if (!enrolledShiftOfType) {
        console.log('Turno antigo não encontrado.')
        return
      }
      this.oldShiftId = Number(enrolledShiftOfType.id)
    },
    async onCancelRequest() {
      const shouldCancel = await this.$confirm(
        'Tem certeza de que deseja cancelar o pedido? Todas as alterações serão perdidas.',
      )
      if (!shouldCancel) return
      this.$router.push('/pedidos')
    },
  },
}
</script>

<template>
  <Container class="container">
    <h1>Novo pedido</h1>

    <Card class="card">
      <CardHeader>
        <CardTitle>Selecionar UC</CardTitle>
        <CardDescription
          >Indique a Unidade Curricular a qual pretende se increver a um novo turno</CardDescription
        >
      </CardHeader>

      <div class="field">
        <label for="course-select">Escolha a UC:</label>
        <Dropdown
          :options="options"
          v-model="selectedCourseId"
          placeholder="-- Selecione uma UC --"
          @update:modelValue="onCourseChange"
        />
      </div>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Selecionar Turno</CardTitle>
        <CardDescription> Indique apenas um Turno ao qual pretende se inscrever</CardDescription>
      </CardHeader>

      <Calendar :events="calendarEvents" :eventClick="handleClickEvent" />
    </Card>

    <Card class="card">
      <CardHeader>
        <CardTitle>Observações (opcional)</CardTitle>
        <CardDescription> Escreva observações que ache pertinente para o Diretor</CardDescription>
      </CardHeader>

      <textarea
        aria-label="Escreva suas observações"
        name="message"
        id="message"
        placeholder="Escreva as observações..."
        class="message-textarea"
        v-model="message"
      ></textarea>
    </Card>

    <footer class="action-buttons">
      <Button variant="destructive" @click="onCancelRequest">Cancelar</Button>

      <Button
        :loading="loadingSubmit"
        :disabled="!selectedCourseId || !selectedShiftId"
        @click="onSubmitRequest"
        >Enviar &raquo;</Button
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

.card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.action-buttons {
  display: flex;
  justify-content: end;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;

  label {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }
}

.message-textarea {
  width: 100%;
  height: 12.5rem;
  resize: vertical;
  padding: 1.125rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}
</style>
