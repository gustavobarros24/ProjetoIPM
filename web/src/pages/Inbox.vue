<script lang="ts">
import Button from '@/components/Button.vue'
import Container from '@/components/Container.vue'
import Link from '@/components/Link.vue'
import Skeleton from '@/components/Skeleton.vue'
import TableBody from '@/components/Table/TableBody.vue'
import TableCell from '@/components/Table/TableCell.vue'
import Table from '@/components/Table/TableComponent.vue'
import TableHead from '@/components/Table/TableHead.vue'
import TableHeader from '@/components/Table/TableHeader.vue'
import { getInbox } from '@/services/inboxService'
import { useAuthStore, type IUserInfo } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'

type InboxType = Awaited<ReturnType<typeof getInbox>>

interface IInboxData {
  inbox: InboxType | null
  loading: boolean
  user: IUserInfo | null
}

export default {
  components: {
    RouterLink,
    Button,
    Skeleton,
    Link,
    Container,
    Table,
    TableHeader,
    TableHead,
    TableBody,
    TableCell,
  },
  data(): IInboxData {
    const authStore = useAuthStore()
    const { user } = storeToRefs(authStore)

    return {
      inbox: null,
      loading: false,
      user: user.value,
    }
  },
  async mounted() {
    try {
      this.loading = true
      this.inbox = await getInbox()
    } catch (err: any) {
      // TODO: tratar erro corretamente
      console.log(err)
    } finally {
      this.loading = false
    }
  },
  computed: {
    reversedOpen() {
      return this.inbox?.open.slice(0).reverse()
    },
    reversedClosed() {
      return this.inbox?.closed.slice(0).reverse()
    },
  },
}
</script>

<template>
  <Container class="container">
    <h1>Pedidos</h1>

    <section class="card">
      <h3>NOVOS PEDIDOS</h3>

      <div v-if="loading">
        <Skeleton class="skeleton-btn" />
        <Skeleton class="skeleton-table" />
        <Skeleton class="skeleton-tbody" />
      </div>

      <div v-else-if="inbox?.open.length === 0" class="empty-state">
        <Link
          v-if="user?.role === 'STUDENT'"
          to="/pedidos/novo"
          variant="secondary"
          class="new-request-btn"
          >NOVO PEDIDO &raquo;</Link
        >

        <h3>Sem pedidos.</h3>
      </div>

      <div v-else>
        <Link
          v-if="user?.role === 'STUDENT'"
          to="/pedidos/novo"
          variant="secondary"
          class="new-request-btn"
          >NOVO PEDIDO &raquo;</Link
        >

        <Table>
          <TableHeader>
            <tr>
              <TableHead>AUTOR</TableHead>
              <TableHead class="date-header">DATA/HORA</TableHead>
              <TableHead>UC</TableHead>
              <TableHead></TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            <tr v-for="request in reversedOpen" :key="request.id">
              <TableCell>
                {{ request.author }}
                <span class="date-data-mobile">{{ request.createdAt }}</span>
              </TableCell>
              <TableCell class="date-data">{{ request.createdAt }}</TableCell>
              <TableCell>{{ request.courseName }}</TableCell>
              <TableCell>
                <Link :to="`/pedidos/${request.id}`">Detalhes</Link>
              </TableCell>
            </tr>
          </TableBody>
        </Table>
      </div>
    </section>

    <section class="card">
      <h3>PEDIDOS FECHADOS</h3>

      <div v-if="loading">
        <Skeleton class="skeleton-table" />
        <Skeleton class="skeleton-tbody" />
      </div>

      <div v-else-if="inbox?.closed.length === 0" class="empty-state">
        <h3>Sem pedidos.</h3>
      </div>

      <div v-else>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>AUTOR</TableHead>
              <TableHead class="date-header">DATA/HORA</TableHead>
              <TableHead>UC</TableHead>
              <TableHead></TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            <tr v-for="request in reversedClosed" :key="request.id">
              <TableCell>
                {{ request.author }}
                <span class="date-data-mobile">{{ request.createdAt }}</span>
              </TableCell>
              <TableCell class="date-data">{{ request.createdAt }}</TableCell>
              <TableCell>{{ request.courseName }}</TableCell>
              <TableCell>
                <Link :to="`/pedidos/${request.id}`">Detalhes</Link>
              </TableCell>
            </tr>
          </TableBody>
        </Table>
      </div>
    </section>
  </Container>
</template>

<style scoped>
.container {
  max-width: 1320px;
  margin: 1.25rem auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  h1 {
    font-weight: bold;
  }
}

.card {
  padding: 2.25rem;
  background-color: white;
  border-radius: 4px;

  h3 {
    font-size: 1rem;
    opacity: 0.25;
    font-weight: bold;
  }

  .new-request-btn {
    width: fit-content;
    margin-top: 1.25rem;
  }

  .empty-state {
    h3 {
      margin-top: 1.25rem;
      font-size: 1em;
      font-weight: normal;
      opacity: 1;
      text-align: center;
    }
  }
}

table {
  .date-header,
  .date-data {
    display: none;
  }

  .date-data-mobile {
    display: block;
    color: var(--color-text-muted);
    font-size: 0.875em;
  }

  /* Botao de detalhes */
  tr td:last-child {
    display: flex;
    justify-content: end;
  }
}

@media (min-width: 769px) {
  table {
    .date-header,
    .date-data {
      display: table-cell;
    }

    .date-data-mobile {
      display: none;
    }
  }
}

.skeleton-btn {
  margin-top: 1.25rem;
  height: 48px;
  width: 126px;
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
