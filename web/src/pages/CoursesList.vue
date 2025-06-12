<script lang="ts">
import Card from '@/components/Card/Card.vue'
import Container from '@/components/Container.vue'
import Link from '@/components/Link.vue'
import Skeleton from '@/components/Skeleton.vue'
import TableBody from '@/components/Table/TableBody.vue'
import TableCell from '@/components/Table/TableCell.vue'
import Table from '@/components/Table/TableComponent.vue'
import TableHead from '@/components/Table/TableHead.vue'
import TableHeader from '@/components/Table/TableHeader.vue'
import { getAllCoursesByYear } from '@/services/coursesService'

type CoursesByYear = Awaited<ReturnType<typeof getAllCoursesByYear>>

interface IListData {
  years: CoursesByYear
  loading: boolean
}

export default {
  components: {
    Container,
    Card,
    Link,
    Skeleton,
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableCell,
  },
  data(): IListData {
    return {
      loading: false,
      years: [],
    }
  },
  async mounted() {
    try {
      this.loading = true
      this.years = await getAllCoursesByYear()
    } catch (err) {
      console.log(err)
    } finally {
      this.loading = false
    }
  },
}
</script>

<template>
  <Container class="container">
    <h1>Unidades Curriculares</h1>

    <div v-if="loading" class="skeleton-container">
      <Card>
        <Skeleton class="skeleton-title" />
        <Skeleton class="skeleton-table" />
        <Skeleton class="skeleton-tbody" />
      </Card>
      <Card>
        <Skeleton class="skeleton-title" />
        <Skeleton class="skeleton-table" />
        <Skeleton class="skeleton-tbody" />
      </Card>
    </div>

    <Card v-else v-for="(year, index) in years" :key="index">
      <h3>{{ index }}&ordm; ano</h3>

      <Table>
        <TableHeader>
          <tr>
            <TableHead>Semestre</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead class="students-count-header">Alunos</TableHead>
            <TableHead class="conflicts-perc-header">Conflitos</TableHead>
            <TableHead></TableHead>
          </tr>
        </TableHeader>

        <TableBody>
          <tr v-for="course in year" :key="course.id">
            <TableCell>{{ course.semester }}&ordm;</TableCell>
            <TableCell>
              {{ course.name }}
              <span class="students-count-data-mobile">{{ course.enrolled.length }} aloc.</span>
              <span
                class="conflicts-perc-data-mobile"
                :class="{ 'has-conflicts': course.conflictsPercent > 0 }"
                >{{ course.conflictsPercent }}% conflitos</span
              >
            </TableCell>
            <TableCell class="students-count-data">{{ course.enrolled.length }}</TableCell>
            <TableCell
              class="conflicts-perc-data"
              :class="{ 'has-conflicts': course.conflictsPercent > 0 }"
              >{{ course.conflictsPercent }}%</TableCell
            >
            <TableCell>
              <Link :to="`/unidades-curriculares/${course.id}`">Detalhes de UC</Link>
            </TableCell>
          </tr>
        </TableBody>
      </Table>
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

table {
  .students-count-header,
  .conflicts-perc-header,
  .students-count-data,
  .conflicts-perc-data {
    display: none;
  }

  .students-count-data-mobile {
    display: block;
    color: var(--color-text-muted);
    font-size: 0.875em;
  }

  .conflicts-perc-data-mobile {
    display: block;
    font-size: 0.875em;
  }

  td:first-child,
  th:first-child {
    max-width: 80px;
  }

  td:nth-child(2),
  th:nth-child(2) {
    width: minmax(80px, 100%);
  }

  /* conflicts */
  .conflicts-perc-data-mobile.has-conflicts {
    color: var(--destructive-color);
  }
}

@media (min-width: 769px) {
  table {
    .conflicts-perc-header,
    .conflicts-perc-data {
      display: table-cell;
    }

    .conflicts-perc-data-mobile {
      display: none;
    }

    /* conflicts */
    .conflicts-perc-data.has-conflicts {
      color: var(--destructive-color);
    }
  }
}

@media (min-width: 1024px) {
  table {
    .students-count-header,
    .students-count-data {
      display: table-cell;
    }

    .students-count-data-mobile {
      display: none;
    }
  }
}

.skeleton-title {
  height: 1.875rem;
  width: 120px;
}

.skeleton-table {
  margin-top: 1.25rem;
  height: 48px;
  width: 100%;
}

.skeleton-tbody {
  margin-top: 1.25rem;
  height: 64px;
  width: 100%;
}
</style>
