import { defineStore } from 'pinia'

export interface IUserInfo {
  id: string
  email: string
  role: RoleType
}

export type RoleType = 'DIRECTOR' | 'STUDENT' | 'TEACHER'

interface IState {
  user: null | IUserInfo
}

const USER_STORAGE_KEY = 'ipm-gp25_28:user'

export const useAuthStore = defineStore('auth', {
  state: (): IState => ({
    user: JSON.parse(localStorage.getItem(USER_STORAGE_KEY) ?? 'null'),
  }),

  getters: {
    isAuthenticated: (state) => state.user !== null,
  },

  actions: {
    updateUser(id: string, email: string, role: RoleType) {
      this.user = { id, email, role }

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.user))
    },

    deleteUser() {
      this.user = null
      localStorage.removeItem(USER_STORAGE_KEY)
    },
  },
})
