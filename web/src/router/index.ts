import { createWebHistory, createRouter, type RouteRecordRaw } from 'vue-router'

import Login from '@/pages/Login.vue'
import NotFound from '@/pages/NotFound.vue'
import Inbox from '@/pages/Inbox.vue'
import RequestDetails from '@/pages/RequestDetails.vue'

import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/main'
import CoursesList from '@/pages/CoursesList.vue'
import ConflictsList from '@/pages/ConflictsList.vue'
import CourseDetails from '@/pages/CourseDetails.vue'
import StudentProfile from '@/pages/StudentProfile.vue'
import NewRequest from '@/pages/NewRequest.vue'
import ManualAllocation from '@/pages/ManualAllocation.vue'
import AutomaticAllocation from '@/pages/AutomaticAllocation.vue'
import DirectorProfile from '@/pages/DirectorProfile.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/unidades-curriculares',
  },
  {
    path: '/perfil',
    component: DirectorProfile,
  },
  {
    path: '/alunos/:id',
    component: StudentProfile,
  },
  {
    path: '/unidades-curriculares',
    name: 'unidades-curriculares',
    component: CoursesList,
  },
  {
    path: '/unidades-curriculares/:id',
    component: CourseDetails,
  },
  {
    path: '/conflitos',
    name: 'conflitos',
    component: ConflictsList,
  },
  {
    path: '/pedidos',
    name: 'pedidos',
    component: Inbox,
  },
  {
    path: '/pedidos/novo',
    name: 'novo-pedido',
    component: NewRequest,
  },
  {
    path: '/pedidos/:id',
    component: RequestDetails,
  },
  {
    path: '/alocacao-manual',
    component: ManualAllocation,
  },
  {
    path: '/alocacao-manual/:id',
    component: ManualAllocation,
  },
  {
    path: '/alocacao-automatica',
    component: AutomaticAllocation,
  },
  {
    path: '/auth',
    name: 'login',
    component: Login,
    // prevent showing login page when authenticated
    beforeEnter: (to, from) => {
      const authStore = useAuthStore(pinia)

      if (authStore.isAuthenticated && to.name === 'login') {
        return { name: from.name }
      }
    },
  },
  { path: '/404', name: 'not-found', component: NotFound },

  { path: '/:pathMatch(.*)*', redirect: '/404' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// global auth guard
router.beforeEach((to) => {
  const auth = useAuthStore(pinia)

  const publicPages = ['login', 'not-found']
  if (publicPages.includes(to.name as string)) {
    return true
  }

  if (!auth.isAuthenticated) {
    return { name: 'login' }
  }

  const role = auth.user?.role
  if (role === 'DIRECTOR') return true

  if (role === 'STUDENT') {
    if (
      to.path.startsWith('/alunos/') ||
      to.path.startsWith('/pedidos') ||
      to.path.startsWith('/unidades-curriculares/')
    ) {
      return true
    }

    return { name: 'not-found' }
  }
})

export default router
