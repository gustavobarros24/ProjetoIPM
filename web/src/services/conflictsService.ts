import { ServerError } from '@/errors/server-error'
import { api } from './api'
import { getCourseFromJSON, getShiftById, getStudentFromJSON } from './utilts'
import type { ConflictType } from '@/types'

type GetAllConflictsResponse = ConflictType[]

export async function getAllConflicts() {
  try {
    const { data } = await api.get<GetAllConflictsResponse>('/conflicts')

    const conflicts = data.map((conflict) => ({
      ...conflict,
      student: getStudentFromJSON(conflict.studentId),
      courses: conflict.courseIDs.map(getCourseFromJSON),
      shifts: conflict.shiftIDs.map(getShiftById),
    }))

    return conflicts
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}

export async function removeConflictById(conflictId: string) {
  try {
    await api.delete(`/conflicts/${conflictId}`)
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}
