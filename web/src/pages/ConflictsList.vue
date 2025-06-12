<script lang="ts">
import Card from '@/components/Card/Card.vue'
import Container from '@/components/Container.vue'
import Divider from '@/components/Divider.vue'
import Input from '@/components/Input.vue'
import Link from '@/components/Link.vue'
import { getAllConflicts } from '@/services/conflictsService'
import Dropdown, { type Option } from '@/components/Dropdown.vue'

type ConflictsType = Awaited<ReturnType<typeof getAllConflicts>>

interface IListData {
  conflicts: ConflictsType
  loading: boolean
  search: string
  selectedFilter: Option | null // Add a property to store the selected filter
}

export default {
  components: {
    Container,
    Card,
    Divider,
    Input,
    Link,
    Dropdown,
  },
  data(): IListData {
    return {
      search: '',
      loading: false,
      conflicts: [],
      selectedFilter: null, // Initialize the selected filter
    }
  },
  async mounted() {
    try {
      this.loading = true
      this.conflicts = await getAllConflicts()
    } catch (err) {
      console.log(err)
    } finally {
      this.loading = false
    }
  },
  computed: {
    filteredConflicts() {
      let filtered = this.conflicts?.filter(
        (conflict) =>
          conflict.student?.name.toLowerCase().includes(this.search.toLowerCase()) ||
          conflict.student?.email.toLowerCase().includes(this.search.toLowerCase()),
      )

      // Apply filter for special status if selected
      if (this.selectedFilter?.id === '1') {
        filtered = filtered.filter((conflict) => conflict.student?.specialStatus)
      }

      return filtered
    },
  },
}
</script>

<template>
  <Container class="container">
    <h1>Conflitos de Turno</h1>

    <Card>
      <h3>ALUNOS</h3>

      <header class="filters-wrapper">
        <Dropdown
          class="filter-dropdown"
          placeholder="Filtros"
          v-model="selectedFilter"
          :options="[
            { id: '1', label: 'Estatuto Especial' },
            { id: '2', label: 'Todos' },
          ]"
        />
        <Input
          aria-label="Pesquisar por nome ou email do aluno"
          v-model="search"
          placeholder="Nome/Email do aluno"
        />
      </header>

      <Divider class="divider" />

      <article v-for="conflict in filteredConflicts" :key="conflict.id" class="student-container">
        <div>
          <strong class="student-name">{{ conflict.student?.name }}</strong>
          <p>{{ conflict.student?.email }}</p>

          <span class="conflicts-list-label">Conflitos (1):</span>
          <ul>
            <li class="conflict-item">
              <p>
                {{ conflict.courses[0]?.abbreviation }}/{{ conflict.shifts[0]?.name }} com
                {{ conflict.courses[1]?.abbreviation }}/{{ conflict.shifts[1]?.name }}
              </p>
              <Link
                class="conflict-resolve-link"
                :to="{
                  path: '/alocacao-manual',
                  query: {
                    studentId: conflict.studentId,
                    courseId: conflict.courses[0]?.id,
                    conflictId: conflict.id,
                  },
                }"
              >
                Resolver
              </Link>
            </li>
          </ul>
        </div>

        <Link :to="`/alunos/${conflict.studentId}`">Ver aluno</Link>
      </article>
    </Card>
  </Container>
</template>

<style scoped>
.container,
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  h1 {
    font-weight: bold;
  }

  h3 {
    text-transform: uppercase;
    opacity: 0.25;
    font-weight: bold;
  }
}

.divider {
  margin: 1.25rem 0;
}

.filters-wrapper {
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 0.625rem;

  input {
    width: 240px;
    height: 36px;
  }
}

.conflict-resolve-link {
  font-weight: bold;
  color: var(--primary-color);
  text-decoration: underline;
}


.student-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;

  .student-name {
    font-size: 1.5rem;
  }

  .conflicts-list-label {
    display: block;
    margin-top: 1.25rem;
    font-size: 1.25em;
  }

  .conflict-item {
    display: flex;
    align-items: center;
  }
}
</style>
