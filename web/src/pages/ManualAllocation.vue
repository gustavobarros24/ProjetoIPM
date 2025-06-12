<script lang="ts">
import Button from '@/components/Button.vue'
import Calendar from '@/components/Calendar.vue'
import Card from '@/components/Card/Card.vue'
import CardDescription from '@/components/Card/CardDescription.vue'
import CardHeader from '@/components/Card/CardHeader.vue'
import CardTitle from '@/components/Card/CardTitle.vue'
import Combobox from '@/components/Combobox.vue'
import Container from '@/components/Container.vue'
import { ref, computed, watch } from 'vue'
import { getShiftsByCourseId } from '@/services/shiftsService'
import { getStudentProfile } from '@/services/authService'
import { getAllStudents } from '@/services/studentsService'
import { getAllCourses } from '@/services/coursesService'
import { manualAllocation } from '@/services/allocationsService'
import { useRoute } from 'vue-router'
import type { FormatedShiftType } from '@/types'
import { removeConflictById } from '@/services/conflictsService'
import { useGlobalDialog } from '@/composables/useGlobalDialog'

export default {
  components: {
    Container,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    Calendar,
    Combobox,
    Button,
  },
  setup() {
    const { showDialog } = useGlobalDialog()
    const route = useRoute()
    const loading = ref(false)
    const selectedStudent = ref<{ id: string; label: string } | null>(null)
    const selectedCourse = ref<{ id: string; label: string } | null>(null)
    const students = ref<{ id: string; label: string; enrolled?: number[] }[]>([])
    const courses = ref<{ id: string; label: string }[]>([])
    const selectedShifts = ref<{ [type: string]: string | null }>({
      T: null,
      TP: null,
      PL: null,
    })
    const shifts = ref<{ id: string; label: string; type: string; start: string; end: string }[]>(
      [],
    )
    const enrolledShifts = ref<FormatedShiftType[]>([])
    const loadingShifts = ref(false)
    const fetchedShifts = ref<FormatedShiftType[]>([])

    const showShifts = computed(() => selectedStudent.value && selectedCourse.value)

    const enrolledCourses = computed(() => {
      if (!selectedStudent.value) return []

      const student = students.value.find((s) => s.id === selectedStudent.value?.id)
      if (!student || !student.enrolled) return []

      return courses.value.filter((course) => student.enrolled?.includes(Number(course.id)))
    })

    const fetchShifts = async (courseId: string) => {
      loadingShifts.value = true
      try {
        const fetched = await getShiftsByCourseId(courseId)
        fetchedShifts.value = fetched
        shifts.value = fetched.map((shift) => ({
          id: shift.id,
          label: `${shift.course?.abbreviation}-${shift.name}: ${shift.enrolledCount}/${shift.classroom?.capacity}`,
          type: shift.type,
          start: shift.startTime,
          end: shift.endTime,
          from: shift.from,
          to: shift.to,
          capacity: shift.classroom?.capacity,
          enrolledCount: shift.enrolledCount,
          daysOfWeek: shift.daysOfWeek,
        }))
      } catch (error) {
        console.error('Erro ao buscar os turnos:', error)
      } finally {
        loadingShifts.value = false
      }
    }

    const fetchStudentProfile = async (studentId: string) => {
      loadingShifts.value = true
      try {
        const profile = await getStudentProfile(studentId)
        enrolledShifts.value = profile.shifts
      } catch (error) {
        console.error('Erro ao buscar o perfil do aluno:', error)
      } finally {
        loadingShifts.value = false
      }
    }

    const fetchStudents = async () => {
      try {
        const fetchedStudents = await getAllStudents()
        students.value = fetchedStudents.map((student) => ({
          id: String(student.id),
          label: student.name,
          enrolled: (student as any).enrolled,
        }))
      } catch (error) {
        console.error('Erro ao buscar os alunos:', error)
      }
    }

    const fetchCourses = async () => {
      try {
        const fetchedCourses = await getAllCourses()
        courses.value = fetchedCourses.map((course) => ({
          id: String(course.id),
          label: course.name,
        }))
      } catch (error) {
        console.error('Erro ao buscar os cursos:', error)
      }
    }

    const groupedShifts = computed(() => {
      return shifts.value.reduce(
        (groups, shift) => {
          if (!groups[shift.type]) {
            groups[shift.type] = []
          }
          groups[shift.type].push({ ...shift, hasConflict: checkShiftConflict(shift) })
          return groups
        },
        {} as {
          [type: string]: {
            id: string
            label: string
            type: string
            start: string
            end: string
            capacity: number
            enrolledCount: number
            hasConflict: boolean
          }[]
        },
      )
    })

    const isOverlapping = (shiftA: any, shiftB: any) => {
      const sameDay = shiftA.daysOfWeek[0] === shiftB.daysOfWeek[0]
      const overlaps =
        (shiftA.from < shiftB.from && shiftA.to > shiftB.from) || // start before, end after
        (shiftA.from >= shiftB.from && shiftA.from < shiftB.to) // start in the middle
      return sameDay && overlaps
    }

    const checkShiftConflict = (shift: any): boolean => {
      return enrolledShifts.value.some((enrolledShift) => isOverlapping(shift, enrolledShift))
    }

    const calendarEvents = computed(() => {
      const studentEnrolled = enrolledShifts.value.map((enrolledShift) => {
        const hasOverlap = enrolledShifts.value.some(
          (someShift) =>
            someShift.id !== enrolledShift.id && isOverlapping(enrolledShift, someShift),
        )

        const isOfSelectedCourse = selectedCourse.value?.id === String(enrolledShift.courseId)

        // Check if this enrolled shift is of a type that has a selected replacement
        const willBeReplaced =
          isOfSelectedCourse &&
          selectedShifts.value[enrolledShift.type] !== null &&
          selectedShifts.value[enrolledShift.type] !== enrolledShift.id

        return {
          ...enrolledShift,
          classNames: hasOverlap
            ? ['conflict']
            : [
                'subscribed',
                isOfSelectedCourse
                  ? willBeReplaced
                    ? 'old-subscribed'
                    : 'subscribed-matchcourse'
                  : 'subscribed',
                //willBeReplaced ? 'old-subscribed' : 'subscribed',
              ],
        }
      })

      const availableShifts = fetchedShifts.value
        .filter((shift) => !enrolledShifts.value.some((enrolled) => enrolled.id === shift.id)) // exclude already enrolled shifts
        .map((shift) => {
          const isSelected = Object.values(selectedShifts.value).includes(shift.id)
          const hasConflict = checkShiftConflict(shift)
          return {
            ...shift,
            classNames: isSelected ? (hasConflict ? ['conflict'] : ['selected']) : ['available'],
          }
        })

      return studentEnrolled.concat(availableShifts)
    })

    watch(selectedStudent, (student, oldStudent) => {
      // Reset when student changes or is cleared
      if (
        (oldStudent !== undefined && student?.id !== oldStudent?.id) ||
        (oldStudent && !student)
      ) {
        selectedCourse.value = null
        selectedShifts.value = { T: null, TP: null, PL: null }
        enrolledShifts.value = []
        shifts.value = []
        fetchedShifts.value = []
      }

      if (student?.id) {
        fetchStudentProfile(student.id)
      }
    })

    watch([selectedStudent, selectedCourse], ([_, course]) => {
      if (course?.id) {
        fetchShifts(course.id)
      }
    })

    fetchStudents() // Fetch students on component setup
    fetchCourses() // Fetch courses on component setup

    // watch query values from URL
    watch(
      () => route.query,
      async (query) => {
        if (query.studentId || query.courseId) {
          // Ensure students and courses are fetched before processing the query
          if (students.value.length === 0) {
            await fetchStudents()
          }
          if (courses.value.length === 0) {
            await fetchCourses()
          }

          selectedStudent.value = students.value.find((s) => s.id === query.studentId) || null
          selectedCourse.value = courses.value.find((c) => c.id === query.courseId) || null

          // Fetch shifts if a courseId is provided
          if (query.courseId) {
            await fetchShifts(query.courseId as string)
          }

          // Ensure the selectedCourse dropdown reflects the selected value
          if (query.courseId && selectedCourse.value === null) {
            const course = courses.value.find((c) => c.id === query.courseId)
            if (course) {
              selectedCourse.value = course
            }
          }

          console.log('ATUALIZANDO QUERY')
          console.log(selectedStudent.value)
          console.log(selectedCourse.value)
        }
      },
      { immediate: true },
    )

    const handleClickEvent = (event: any) => {
      const shiftId = event.event.id
      const shiftType = event.event.extendedProps.type

      // do nothing if the user is already enrolled in the clicked event
      if (enrolledShifts.value.some((enrolled) => enrolled.id === shiftId)) {
        console.log(`Já inscrito no turno ${shiftId}`)
        return
      }

      // toggle/update the selected shift
      selectedShifts.value[shiftType] = shiftId === selectedShifts.value[shiftType] ? null : shiftId

      console.log(`Turno selecionado ${shiftId} do tipo ${shiftType}`)
    }

    const applyChanges = async () => {
      if (!selectedStudent.value || !selectedCourse.value) {
        console.error('Aluno ou curso não selecionado.')
        return
      }

      // check if some of the selected shifts is causing a conflict
      const shiftsCausingConflict = Object.entries(selectedShifts.value).filter(([_, shiftId]) => {
        if (!shiftId) return false

        const shift = fetchedShifts.value.find((s) => s.id === shiftId)
        return shift && checkShiftConflict(shift)
      })

      // if yes, ask the user to continue
      if (shiftsCausingConflict.length > 0) {
        const conflictingShiftsDetails = shiftsCausingConflict.map(([type, shiftId]) => {
          const shift = fetchedShifts.value.find((s) => s.id === shiftId)
          return `${shift?.name || shiftId}`
        })

        const shouldContinue = await showDialog(
          `Os seguintes turnos estão causando conflitos: ${conflictingShiftsDetails.join(', ')}. Deseja continuar?`,
        )

        if (!shouldContinue) return
      } else {
        const shouldContinue = await showDialog(
          'Você tem certeza de que deseja aplicar as mudanças selecionadas?',
        )

        if (!shouldContinue) return
      }

      loading.value = true
      try {
        for (const [type, newShiftId] of Object.entries(selectedShifts.value)) {
          if (!newShiftId) continue

          const oldShift = enrolledShifts.value.find((shift) => shift.type === type)
          const oldShiftId = oldShift ? oldShift.id : null

          await manualAllocation({
            studentId: selectedStudent.value.id,
            newShiftId: newShiftId,
            oldShiftId: oldShiftId || '',
          })

          console.log(`Turno atualizado: ${type} -> ${newShiftId}`)
        }

        // If a conflictId exists in the query params, remove the conflict
        const conflictId = route.query.conflictId as string
        if (conflictId) {
          await removeConflictById(conflictId)
          console.log(`Conflito ${conflictId} removido com sucesso.`)
        }

        // Refresh enrolled shifts after applying changes
        await fetchStudentProfile(selectedStudent.value.id)
        console.log('Mudanças aplicadas com sucesso.')

        // Reload the page with only studentId and courseId in the query params
        const { id: studentId } = selectedStudent.value
        const { id: courseId } = selectedCourse.value
        window.location.href = `${window.location.pathname}?studentId=${studentId}&courseId=${courseId}`
      } catch (error) {
        console.error('Erro ao aplicar mudanças:', error)
      } finally {
        loading.value = false
      }
    }

    const isApplyDisabled = computed(() => {
      return (
        !selectedStudent.value ||
        !selectedCourse.value ||
        !Object.values(selectedShifts.value).some((shift) => shift !== null)
      )
    })

    return {
      selectedStudent,
      selectedCourse,
      students,
      courses,
      enrolledCourses,
      selectedShifts,
      shifts,
      enrolledShifts,
      groupedShifts,
      showShifts,
      loadingShifts,
      calendarEvents,
      handleClickEvent,
      applyChanges,
      checkShiftConflict,
      isApplyDisabled,
    }
  },
}
</script>

<template>
  <Container class="container">
    <h1>Alocação Manual em Turno</h1>

    <Card class="card">
      <CardHeader>
        <CardTitle>Configuração</CardTitle>
        <CardDescription>Indique um aluno e uma UC da sua matrícula.</CardDescription>
      </CardHeader>

      <div class="combobox-container">
        <Combobox placeholder="Selecionar aluno..." :options="students" v-model="selectedStudent" />
        <Combobox
          placeholder="Selecionar UC..."
          :options="enrolledCourses"
          v-model="selectedCourse"
          :disabled="!selectedStudent"
        />
      </div>

      <div v-if="showShifts" class="shifts">
        <!--
          <p>Indique para que turnos mover o aluno.</p>
        -->
        <div v-if="loadingShifts">Carregando turnos...</div>
        <div v-else class="shift-columns">
          <div v-for="(shifts, type) in groupedShifts" :key="type" class="shift-column">
            <!--
              <h4>{{ type }}</h4>
            -->
            <div
              v-for="shift in shifts"
              :key="shift.id"
              class="shift-option"
              :class="{
                enrolled: enrolledShifts.some((enrolled: any) => enrolled.id === shift.id),
              }"
            >
              <input
                type="radio"
                :id="shift.id"
                :name="`shift-${type}`"
                :value="shift.id"
                v-model="selectedShifts[type]"
                :disabled="enrolledShifts.some((enrolled: any) => enrolled.id === shift.id)"
              />
              <label :for="shift.id"
                >{{ shift.label }}
                <span v-if="shift.enrolledCount >= shift.capacity" class="warning">(LOTADO)</span>
                <span v-if="shift.hasConflict" class="destructive">(CONFLITO)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <Card class="card">
      <CardTitle>Horário do Aluno</CardTitle>

      <Calendar :events="calendarEvents" :eventClick="handleClickEvent" :loading="loadingShifts" />
    </Card>

    <footer>
      <Button :loading="loadingShifts" :disabled="isApplyDisabled" @click="applyChanges">
        Aplicar
      </Button>
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

.combobox-container {
  display: flex;
  gap: 1rem; /* Adjust the gap between comboboxes as needed */
  align-items: center; /* Align items vertically */
}

.card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.shifts {
  margin-top: 1rem;
}

.shift-columns {
  display: flex;
  gap: 2.5rem;
}

.shift-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.shift-option.enrolled {
  opacity: 0.25;
}

footer {
  display: flex;
  justify-content: end;
}

.warning {
  color: var(--warning-color);
}

.destructive {
  color: var(--destructive-color);
}
</style>
