<script lang="ts">
import Calendar from '@/components/Calendar.vue'
import Card from '@/components/Card/Card.vue'
import Container from '@/components/Container.vue'
import Link from '@/components/Link.vue'
import { getStudentProfile } from '@/services/authService'
import { useAuthStore, type IUserInfo } from '@/stores/auth'
import type { FormatedShiftType } from '@/types'
import { storeToRefs } from 'pinia'

type ProfileDataType = {
  loading: boolean
  profile: null | Awaited<ReturnType<typeof getStudentProfile>>
  events: Awaited<ReturnType<typeof getStudentProfile>>['shifts']
  user: IUserInfo | null
}

export default {
  components: {
    Container,
    Card,
    Calendar,
    Link,
  },
  created() {
    this.$watch(() => this.$route.params.id, this.fetchProfile, { immediate: true })
  },
  data(): ProfileDataType {
    const authStore = useAuthStore()
    const { user } = storeToRefs(authStore)

    return {
      loading: false,
      profile: null,
      events: [],
      user: user.value,
    }
  },
  computed: {
    calendarEvents() {
      const studentEnrolled = this.profile?.shifts.map((enrolledShift) => {
        //const hasOverlap = this.checkShiftConflict(enrolledShift)

        return {
          ...enrolledShift,
          classNames: ['subscribed'],
          //classNames: hasOverlap ? ['conflict'] : ['subscribed'],
        }
      })

      return studentEnrolled
    },
  },
  methods: {
    async fetchProfile(id: string | string[]) {
      this.loading = true

      try {
        const profile = await getStudentProfile(String(id))

        this.profile = profile
        this.events = this.profile.shifts.map((s) => ({
          ...s,
          classNames: this.checkShiftConflict(s) ? ['conflict'] : ['subscribed'],
        }))
      } catch (err: any) {
        // TODO: tratar erro corretamente
        console.log(err.message)
      }
    },
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
  },
}
</script>

<template>
  <Container>
    <h1>Aluno: {{ profile?.name }}</h1>

    <Card class="profile-details-card">
      <h3>Detalhes</h3>

      <strong>Nome: </strong>
      <p>{{ profile?.name }}</p>
      <br />

      <strong>Email: </strong>
      <p>{{ profile?.email }}</p>
      <br />

      <strong>Cargo: </strong>
      <p>Aluno</p>
      <br />

      <strong>Estatuto: </strong>
      <p>{{ profile?.specialStatus ? 'Especial' : 'Normal' }}</p>
      <br />
    </Card>

    <Card>
      <h3>Horário</h3>
      <Calendar :events="calendarEvents" />
    </Card>

    <Card>
      <h3>Matrícula Atual</h3>
      <ul class="courses-list">
        <li v-for="course in profile?.courses">
          <div>
            <strong>{{ course?.name }}</strong>
            <br />

            <b>Época: </b>
            <span> {{ course?.year }}&ordm; ano / {{ course?.semester }}&ordm; semestre </span>
            <br />

            <b>Matrículas Prévias: </b>
            <span>{{ 1 }}</span>
            <br />

            <b>Turnos: </b>
            <span
              v-for="enrolledShift in course.shifts"
              :key="enrolledShift?.id"
              class="shifts-span"
            >
              {{ enrolledShift?.name }}
            </span>
          </div>

          <div>
            <Link :to="'/unidades-curriculares/' + course?.id">Datelhes da UC</Link>
            <Link
              v-if="user?.role === 'STUDENT'"
              :to="{
                path: '/pedidos/novo',
                query: { courseId: course.id },
              }"
              >Pedido de Turno</Link
            >
          </div>
        </li>
      </ul>
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
    font-size: 1rem;
    font-weight: bold;
    opacity: 0.25;
    margin-bottom: 1.25rem;
    text-transform: uppercase;
  }
}

.profile-details-card {
  strong {
    font-weight: bold;
    text-transform: uppercase;
  }

  p {
    display: inline;
    span {
      color: red;
    }
  }
}

.courses-list {
  li {
    display: flex;
    justify-content: space-between;
    border-top: solid 2px var(--color-border);
    padding: 1.25rem 0;

    strong {
      font-weight: bold;
      font-size: 1.5rem;
    }

    b {
      font-weight: bold;
    }

    .shifts-span:not(:last-child)::after {
      content: ', ';
    }
  }
}
</style>
