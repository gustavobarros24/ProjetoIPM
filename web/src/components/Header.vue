<script lang="ts">
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import Link from './Link.vue'
import LogoutButton from './LogoutButton.vue'
import { navItems } from '@/router/rules'
import { getAllConflicts } from '@/services/conflictsService'
import Badge from './Badge.vue'
import { countPendentInbox } from '@/services/inboxService'

export default {
  components: { Link, LogoutButton, Badge },
  data() {
    const authStore = useAuthStore()

    const { user } = storeToRefs(authStore)

    return {
      user,
      isOpen: false,
      conflictCount: 0,
      inboxPendentCount: 0,
    }
  },
  async created() {
    try {
      const [conflicts, inboxCount] = await Promise.all([getAllConflicts(), countPendentInbox()])
      this.conflictCount = conflicts.length
      this.inboxPendentCount = inboxCount
    } catch (error) {
      console.error('Erro ao buscar conflitos:', error)
      throw error
    }
  },
  computed: {
    allowedNav() {
      return navItems(this.user?.id).filter((i) =>
        this.user?.role ? i.roles.includes(this.user.role) : false,
      )
    },
  },
  methods: {
    toggleSidebar() {
      this.isOpen = !this.isOpen
    },
    closeSidebar() {
      this.isOpen = false
    },
  },
}
</script>

<template>
  <header :class="{ 'solo-logo': !user }">
    <!-- mobile hamburger -->
    <button v-if="user" class="hamburger" aria-label="Open menu" @click="toggleSidebar">☰</button>

    <!-- logo + (hidden on mobile) nav -->
    <div class="header-left">
      <div class="logo-wrapper">
        <span class="logo"><span class="blue">uni</span>SHIFT</span>
      </div>
      <nav v-if="user" class="nav-links">
        <Link v-for="link in allowedNav" :key="link.label" :to="link.to" variant="ghost">
          {{ link.label }}
          <Badge
            v-if="link.label === 'Conflitos' && conflictCount > 0"
            variant="destructive"
            class="badge"
            >{{ conflictCount }}</Badge
          >
          <Badge
            v-else-if="link.label === 'Pedidos' && inboxPendentCount > 0"
            variant="pending"
            class="badge"
            >{{ inboxPendentCount }}</Badge
          >
        </Link>
        <div v-if="user.role === 'DIRECTOR'" class="dropdown">
          <span class="dropdown-trigger"
            >Alocação <i class="pi pi-angle-down" style="font-size: 0.75rem"></i
          ></span>

          <div class="dropdown-content">
            <Link to="/alocacao-manual" variant="ghost">Alocação Manual</Link>
            <Link to="/alocacao-automatica" variant="ghost">Alocação Automática</Link>
          </div>
        </div>
      </nav>
    </div>

    <!-- hidden on mobile -->
    <div v-if="user" class="auth-area">
      <Link :to="user.role === 'DIRECTOR' ? '/perfil' : `/alunos/${user.id}`">
        {{ user.email }}
      </Link>
      <LogoutButton />
    </div>
  </header>

  <!-- SIDEBAR + OVERLAY -->
  <div v-if="isOpen" class="overlay" @click="closeSidebar"></div>

  <aside v-if="user" class="sidebar" :class="{ open: isOpen }">
    <button class="close-btn" aria-label="Close menu" @click="closeSidebar">✕</button>
    <nav class="sidebar-nav">
      <Link v-for="link in allowedNav" :key="link.label" :to="link.to" variant="ghost">
        {{ link.label }}
        <Badge
          v-if="link.label === 'Conflitos' && conflictCount > 0"
          variant="destructive"
          class="badge"
          >{{ conflictCount }}</Badge
        >
        <Badge
          v-else-if="link.label === 'Pedidos' && inboxPendentCount > 0"
          variant="pending"
          class="badge"
          >{{ inboxPendentCount }}</Badge
        >
      </Link>
      <div v-if="user.role === 'DIRECTOR'">
        <Link to="/alocacao-manual" variant="ghost" @click.native="closeSidebar"
          >Alocação Manual</Link
        >
        <Link to="/alocacao-automatica" variant="ghost" @click.native="closeSidebar"
          >Alocação Automática</Link
        >
      </div>
      <div class="sidebar-auth">
        <Link :to="user.role === 'DIRECTOR' ? '/perfil' : `/alunos/${user.id}`">
          {{ user.email }}
        </Link>
        <LogoutButton @click.native="closeSidebar" />
      </div>
    </nav>
  </aside>
</template>

<style scoped>
header {
  position: relative;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  height: 58px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.05);
  background-color: var(--color-background);
  z-index: 99;
}

.hamburger {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.header-left {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
}

.nav-links,
.auth-area {
  display: none;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  span {
    font-weight: bold;
  }
}
.blue {
  color: var(--primary-color);
}

/* overlay covers the screen when sidebar is open */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

/* hidden by default; v-if only renders when isOpen */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 75vw;
  max-width: 300px;
  background: white;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 101;
  padding: 1rem;
}

/* when open, slides in */
.sidebar.open {
  transform: translateX(0);
}

/* close button in sidebar */
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  float: right;
  cursor: pointer;
}

/* stack links & auth in sidebar */
.sidebar-nav,
.sidebar-nav div {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-nav {
  margin-top: 2rem;
}

.sidebar-auth {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (min-width: 768px) {
  /* turn header into a two-cell flex: [header-left]   [auth-area] */
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.875rem;
  }

  header.solo-logo {
    justify-content: center;
  }

  .hamburger {
    display: none;
  }

  .header-left {
    position: static;
    transform: none;
  }

  .nav-links {
    display: flex;
    margin-left: 1.875rem;
  }

  .nav-links a,
  .auth-area,
  .dropdown-trigger {
    font-size: 0.875rem;
  }

  .dropdown {
    display: flex;
    position: relative;

    .dropdown-trigger {
      padding: 0.5rem 0.625rem;
      height: 42px;
    }

    .dropdown-content {
      background: var(--color-background);
      box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      display: none;
      position: absolute;
      z-index: 1;
      top: 100%;

      a {
        text-wrap: nowrap;
      }
    }

    &:hover .dropdown-content {
      display: flex;
      flex-direction: column;
      width: fit-content;
    }
  }

  .auth-area {
    display: flex;
    align-items: center;
    margin-left: auto;
    gap: 1rem;
  }

  .overlay,
  .sidebar {
    display: none;
  }
}

.badge {
  margin-left: 0.5rem;
}
</style>
