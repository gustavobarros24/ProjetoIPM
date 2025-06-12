import type { RoleType } from '@/stores/auth'
import type { RouteLocationRaw } from 'vue-router'

export interface NavItem {
  label: string
  to: RouteLocationRaw
  roles: RoleType[]
}

export function navItems(id?: string): NavItem[] {
  return [
    {
      label: 'Unidades Curriculares',
      to: { name: 'unidades-curriculares' },
      roles: ['DIRECTOR'],
    },
    {
      label: 'Horário',
      to: { path: '/alunos/' + id },
      roles: ['STUDENT'],
    },
    {
      label: 'Pedidos',
      to: { name: 'pedidos' },
      roles: ['DIRECTOR', 'STUDENT'],
    },
    {
      label: 'Conflitos',
      to: { name: 'conflitos' },
      roles: ['DIRECTOR'],
    },
  ]
}
