import { api } from './api'
import { ServerError } from '@/errors/server-error'
import type { StudentType } from '@/types'

type GetAllStudentsResponse = StudentType[]

export async function getAllStudents() {
  try {
    const { data } = await api.get<GetAllStudentsResponse>('/students')
    return data
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}
