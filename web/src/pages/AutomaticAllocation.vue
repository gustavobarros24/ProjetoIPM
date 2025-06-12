<script lang="ts">
import Button from '@/components/Button.vue'
import Card from '@/components/Card/Card.vue'
import CardTitle from '@/components/Card/CardTitle.vue'
import Container from '@/components/Container.vue'
import Dropdown from '@/components/Dropdown.vue'
import Input from '@/components/Input.vue'
import TableBody from '@/components/Table/TableBody.vue'
import TableCell from '@/components/Table/TableCell.vue'
import Table from '@/components/Table/TableComponent.vue'
import TableHead from '@/components/Table/TableHead.vue'
import TableHeader from '@/components/Table/TableHeader.vue'
import { getSmallestTPPLClassroomCapacity } from '@/services/utilts'
import { getAllCourses } from '@/services/coursesService'
import type { CourseType } from '@/types'

type CoursesType = Awaited<ReturnType<typeof getAllCourses>>
type OptionType = { id: string; label: string }

interface DataReturnType {
  courses: CoursesType
  loading: boolean
  options: OptionType[]
  selectedPriorities: Record<string, OptionType | null>
  maxSeats: Record<string, string>
}

export default {
  components: {
    Container,
    Card,
    CardTitle,
    Table,
    TableHeader,
    TableHead,
    TableBody,
    TableCell,
    Input,
    Dropdown,
    Button,
  },
  data(): DataReturnType & { successMessage: boolean; isApplying: boolean } {
    return {
      courses: [],
      loading: false,
      options: [
        {
          id: '1',
          label: 'id (predefinido)',
        },
        {
          id: '2',
          label: 'média global',
        },
        {
          id: '3',
          label: 'qtd. matriculas prévias',
        },
      ],
      selectedPriorities: {},
      maxSeats: {},
      successMessage: false,
      isApplying: false,
    }
  },
  methods: {
    async applyAllocation() {
      const shouldContinue = await this.$confirm(
        'Tem certeza que deseja aplicar a alocação automática? Esta ação não poderá ser desfeita.',
      )
      if (!shouldContinue) return

      this.isApplying = true
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        this.successMessage = true
      } catch (err) {
        console.error('Erro ao aplicar alocação:', err)
      } finally {
        this.isApplying = false
      }
    },

    getSmallestTPPLClassroomCapacity(courseId: string) {
      return getSmallestTPPLClassroomCapacity(courseId)
    },

    handleSeatInput(event: Event, courseId: string) {
      const input = event.target as HTMLInputElement
      const maxCapacity = this.getSmallestTPPLClassroomCapacity(courseId)
      let value = parseInt(input.value) || 0

      // Immediately enforce the max limit
      if (value > maxCapacity) {
        value = maxCapacity
        input.value = value.toString()
      }

      // Update the reactive property
      this.maxSeats[courseId] = value.toString()
    },

    handleSeatBlur(courseId: string) {
      const maxCapacity = this.getSmallestTPPLClassroomCapacity(courseId)
      let value = parseInt(this.maxSeats[courseId]) || 0

      // Final validation on blur
      value = Math.max(0, Math.min(value, maxCapacity))
      this.maxSeats[courseId] = value.toString()
    },
  },
  watch: {
    courses(newCourses) {
      newCourses.forEach((course: CourseType) => {
        if (!this.selectedPriorities[course.id]) {
          this.selectedPriorities[course.id] = this.options[0]
        }
        if (!this.maxSeats[course.id]) {
          this.maxSeats[course.id] = ''
        }
      })
    },
  },
  async mounted() {
    this.loading = true
    try {
      const courses = await getAllCourses()
      this.courses = courses

      this.maxSeats = {}
      courses.forEach((course: CourseType) => {
        const maxCapacity = this.getSmallestTPPLClassroomCapacity(course.id)
        this.maxSeats[course.id] = Math.max(0, maxCapacity).toString()
      })
    } catch (err: any) {
      console.error('Erro ao buscar cursos:', err)
    } finally {
      this.loading = false
    }
  },
}
</script>

<template>
  <Container class="container">
    <h1>Alocação Automática em Turno</h1>

    <Card>
      <CardTitle>Configuração</CardTitle>

      <div class="tooltip">O Max TP/PL é limitado pela sala mais pequena em uso.</div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead class="course-name-header">Unidade Curricular</TableHead>
            <TableHead class="max-seats-header">MAX TP/PL</TableHead>
            <TableHead class="priority-header">Prioridade de Alunos</TableHead>
          </tr>
        </TableHeader>

        <TableBody>
          <tr v-for="course in courses" :key="course.id" class="table-row">
            <TableCell class="course-name-cell">
              <b class="course-name">{{ course.name }}</b>
              <div class="max-seats-mobile">
                <label for="max-seats" class="mobile-label">MAX TP/PL:</label>
                <Input
                  :model-value="maxSeats[course.id]"
                  @input="handleSeatInput($event, course.id)"
                  @blur="handleSeatBlur(course.id)"
                  type="number"
                  class="small-input"
                  :min="0"
                  :max="getSmallestTPPLClassroomCapacity(course.id)"
                />
                <span>lugares</span>
              </div>
              <div class="priority-mobile">
                <span>Prioridade:</span>
                <Dropdown :options="options" v-model="selectedPriorities[course.id]" />
              </div>
            </TableCell>
            <TableCell class="max-seats-cell">
              <div class="input-container">
                <Input
                  :model-value="maxSeats[course.id]"
                  @input="handleSeatInput($event, course.id)"
                  @blur="handleSeatBlur(course.id)"
                  type="number"
                  class="small-input"
                  :min="0"
                  :max="getSmallestTPPLClassroomCapacity(course.id)"
                />
                <span>lugares</span>
              </div>
            </TableCell>
            <TableCell class="priority-cell">
              <Dropdown :options="options" v-model="selectedPriorities[course.id]" />
            </TableCell>
          </tr>
        </TableBody>
      </Table>

      <footer class="footer">
        <span v-if="successMessage" class="success-message">Alocação aplicada com sucesso.</span>
        <Button :loading="isApplying" @click="applyAllocation">Aplicar</Button>
      </footer>
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
}

.tooltip {
  background-color: hsl(212, 100%, 68%, 0.2);
  color: hsl(210, 100%, 38%);

  padding: 0.625rem;
  border-radius: 4px;
  text-align: center;

  margin-top: 1.25rem;
}

.input-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-container span {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.small-input {
  width: 8rem;
  text-align: center;
}

.footer {
  margin-top: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
}

.success-message {
  color: var(--primary-color);
  font-weight: bold;
}

.max-seats-mobile {
  input {
    margin-right: 0.5rem;
  }
}

table {
  .max-seats-header,
  .priority-header,
  .max-seats-cell,
  .priority-cell {
    display: none;
  }

  .max-seats-mobile,
  .priority-mobile {
    display: block;
    font-size: 0.875em;
    margin-top: 0.5rem;
  }

  .mobile-label {
    display: block;
    margin-bottom: 0.25rem;
  }

  .course-name {
    font-size: 1.125rem;
  }
}

@media (min-width: 769px) {
  table {
    .max-seats-header,
    .max-seats-cell {
      display: table-cell;
    }

    .max-seats-mobile {
      display: none;
    }

    td {
      vertical-align: bottom;
    }
  }
}

@media (min-width: 1024px) {
  table {
    .priority-header,
    .priority-cell {
      display: table-cell;
    }

    .priority-mobile {
      display: none;
    }
  }
}
</style>
