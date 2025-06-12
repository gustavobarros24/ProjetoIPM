<script lang="ts">
import Button from '@/components/Button.vue'
import Calendar from '@/components/Calendar.vue'
import Card from '@/components/Card/Card.vue'
import Container from '@/components/Container.vue'
import Dropdown, { type Option } from '@/components/Dropdown.vue'
import Input from '@/components/Input.vue'
import Link from '@/components/Link.vue'
import { getAllClassroomsWithBuildings, getCourseById } from '@/services/coursesService'
import { getShiftsByCourseId, updateShiftClassroom } from '@/services/shiftsService'
import { useAuthStore, type IUserInfo } from '@/stores/auth'
import { daysOfWeekPT, shiftTypePT } from '@/types'
import { storeToRefs } from 'pinia'

type CourseDetailsDataType = {
  loading: boolean
  events: Awaited<ReturnType<typeof getShiftsByCourseId>>
  course: null | Awaited<ReturnType<typeof getCourseById>>
  classrooms: Awaited<ReturnType<typeof getAllClassroomsWithBuildings>>
  daysOfWeekPT: typeof daysOfWeekPT
  shiftTypePT: typeof shiftTypePT
  search: '' // input de procura de alunos
  activeShiftId: string | null // útil para saber qual dropdown deverá ser mostrado
  selectedShiftId: string | null
  selectedClassroom: Option | null
  selectedFilter: Option | null // Add a property to store the selected filter
  user: IUserInfo | null
}

export default {
  components: {
    Container,
    Card,
    Calendar,
    Dropdown,
    Input,
    Link,
    Button,
  },
  data(): CourseDetailsDataType {
    const authStore = useAuthStore()
    const { user } = storeToRefs(authStore)

    return {
      loading: false,
      events: [],
      course: null,
      classrooms: [],
      daysOfWeekPT,
      shiftTypePT,
      search: '',
      activeShiftId: null,
      selectedShiftId: null,
      selectedClassroom: null,
      selectedFilter: null, // Add a property to store the selected filter
      user: user.value,
    }
  },
  created() {
    this.$watch(() => this.$route.params.id, this.fetchAll, { immediate: true })
  },
  methods: {
    async fetchAll(id: string | string[]) {
      this.loading = true
      Promise.all([this.fetchEvents(id), this.fetchCourse(id), this.fetchClassrooms()]).finally(
        () => (this.loading = false),
      )
    },
    async fetchEvents(id: string | string[]) {
      try {
        const events = await getShiftsByCourseId(String(id))
        this.events = events
      } catch (err) {
        // TODO: tratar erro corretamente
        console.log(err)
      }
    },
    async fetchCourse(id: string | string[]) {
      try {
        const course = await getCourseById(id)
        this.course = course
      } catch (err) {
        // TODO: tratar erro corretamente
        console.log(err)
      }
    },
    async fetchClassrooms() {
      try {
        const classrooms = await getAllClassroomsWithBuildings()
        this.classrooms = classrooms
      } catch (err: any) {
        console.error('Erro ao buscar salas', err)
      }
    },
    onSelectClassroom(selectedOption: Option, shiftId: string) {
      this.selectedClassroom = selectedOption
      this.selectedShiftId = shiftId
    },
    async onConfirmClassroom() {
      if (!this.selectedShiftId || !this.selectedClassroom) return

      this.loading = true
      try {
        await updateShiftClassroom(this.selectedShiftId, +this.selectedClassroom.id)
        await this.fetchEvents(this.$route.params.id)
      } catch (err) {
        console.error('Erro ao atualizar sala do turno', err)
      } finally {
        this.loading = false
        this.activeShiftId = null
        this.selectedShiftId = null
        this.selectedClassroom = null
      }
    },
    toggleDropdown(shiftId: string) {
      this.activeShiftId = this.activeShiftId === shiftId ? null : shiftId
    },
    cancelDropdown() {
      this.activeShiftId = null
      this.selectedShiftId = null
      this.selectedClassroom = null
    },
  },
  computed: {
    classroomsOptions() {
      return this.classrooms.map((c) => ({
        id: c.id,
        label: `${c.building?.abbreviation}-${c.name}: ${c.capacity} lugares`,
      }))
    },
    filteredStudents() {
      let students = this.course?.enrolled || []
      if (this.selectedFilter?.id === '1') {
        students = students.filter((student) => student.shifts.length > 0) // Alocados
      } else if (this.selectedFilter?.id === '2') {
        students = students.filter((student) => student.shifts.length === 0) // Não alocados
      }
      // No filtering needed for 'Todos' (id: '3')
      return students.filter(
        (student) =>
          student.name.toLowerCase().includes(this.search.toLowerCase()) ||
          student.email.toLowerCase().includes(this.search.toLowerCase()),
      )
    },
    calendarEvents() {
      return this.events.map((e) => ({ ...e, classNames: ['subscribed'] }))
    },
  },
}
</script>

<template>
  <Container class="container">
    <h1>UC: {{ course?.name }}</h1>

    <Card class="details-card">
      <h3>Detalhes</h3>

      <strong>Época: </strong>
      <p>{{ course?.year }}&ordm; ano / {{ course?.semester }}&ordm; semestre</p>
      <br />
      <strong>Alunos: </strong>
      <p>
        {{ course?.enrolled.length }}
      </p>
    </Card>

    <Card>
      <h3>Horário</h3>
      <Calendar :loading="loading" :events="calendarEvents" />
    </Card>

    <Card>
      <h3>Turnos</h3>
      <ul class="shifts-list">
        <li v-for="shift in events" :key="shift.id">
          <div>
            <strong
              >{{ course?.abbreviation }}-{{ shift.name }} ({{
                daysOfWeekPT[shift.day].slice(0, 3)
              }}
              {{ shift.from }}:00h-{{ shift.to }}:00h)</strong
            >
            <br />

            <b
              >Docente: <i>{{ shift.teacher?.name }}</i></b
            >
            <br />

            <span v-if="shift.classroom">
              {{ shift.enrolledCount }} alunos
              <span class="occupancy-warning">
                ({{ ((shift.enrolledCount / shift.classroom?.capacity) * 100).toFixed(0) }}%
                ocupado)
              </span>
            </span>
            <br />

            <Dropdown
              v-if="activeShiftId === shift.id"
              :options="classroomsOptions"
              :placeholder="`${shift.building?.abbreviation}-${shift.classroom?.name}: ${shift.classroom?.capacity} lugares`"
              v-model="selectedClassroom"
              @update:modelValue="
                (selectedOption: Option) => onSelectClassroom(selectedOption, shift.id)
              "
            />

            <span v-else>
              {{ shift.building?.abbreviation }} - {{ shift.classroom?.name }}:
              {{ shift.classroom?.capacity }} lugares
            </span>
          </div>

          <div v-if="user?.role === 'DIRECTOR'">
            <Button
              v-if="activeShiftId !== shift.id"
              variant="link"
              @click="toggleDropdown(shift.id)"
            >
              Editar sala
            </Button>
            <div v-else class="edit-classroom-btn-container">
              <Button variant="link" @click="onConfirmClassroom">Confirmar sala</Button>
              <Button variant="link" @click="cancelDropdown">Cancelar</Button>
            </div>
          </div>
        </li>
      </ul>
    </Card>

    <Card v-if="user?.role !== 'STUDENT'">
      <h3>Alunos Matriculados</h3>

      <header class="filters-wrapper">
        <Dropdown
          class="filter-dropdown"
          placeholder="Filtros"
          v-model="selectedFilter"
          :options="[
            { id: '1', label: 'Alocados' },
            { id: '2', label: 'N/ alocados' },
            { id: '3', label: 'Todos' },
          ]"
        />
        <Input
          aria-label="Procurar por nome ou email do aluno"
          v-model="search"
          type="text"
          placeholder="Nome/Email do aluno"
        />
      </header>

      <ul class="students-list">
        <li v-for="student in filteredStudents" :key="student.id">
          <div class="student-info">
            <strong>{{ student.name }}</strong>
            <br />

            <b>Email: </b>
            <span>{{ student.email }}</span>
            <br />

            <b>Matrículas prévias: </b>
            <span>{{ 0 }}</span>
            <br />

            <b>Turnos: </b>
            <span
              v-for="enrolledShift in student.shifts"
              :key="enrolledShift?.id"
              class="shifts-span"
            >
              {{ enrolledShift?.name }}
            </span>
          </div>

          <div>
            <Link :to="'/alunos/' + student.id">Perfil</Link>
            <Link
              :to="{
                path: '/alocacao-manual',
                query: { studentId: student.id },
              }"
              >Editar turnos</Link
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

.details-card {
  strong {
    font-weight: bold;
  }

  p {
    display: inline;
    span {
      color: var(--destructive-color);
    }
  }
}

.occupancy-warning {
  color: red;
}

.shifts-list,
.students-list {
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

.students-list {
  li {
    display: flex;
    justify-content: space-between;
  }
}

.filters-wrapper {
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1.25rem;

  .filter-dropdown {
    max-width: 160px;
  }

  input {
    width: 240px;
    height: 36px;
  }
}

.edit-classroom-btn-container {
  display: flex;
  flex-direction: column;
  max-width: fit-content;
  button {
    text-align: end;
  }
}
</style>
