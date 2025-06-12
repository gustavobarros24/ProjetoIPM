import { api } from './api'
import { ServerError } from '@/errors/server-error'
import {
  formatShiftToCalendarEvent,
  getCourseFromJSON,
  getShiftById,
  getStudentFromJSON,
} from './utilts'
import type { ShiftRequestType } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/main'

type GetShiftsRespose = ShiftRequestType[]

export async function getInbox() {
  try {
    const auth = useAuthStore(pinia)

    const params = auth.user?.role === 'STUDENT' ? { studentId: auth.user.id } : undefined

    const { data } = await api.get<GetShiftsRespose>('/shiftRequests', { params })

    const requestsWithAuthor = data.map((shiftRequest) => ({
      ...shiftRequest,
      author: getStudentFromJSON(shiftRequest.studentId)?.name,
    }))

    const requestsWithCourseName = requestsWithAuthor.map((request) => ({
      ...request,
      courseName: getCourseFromJSON(request.courseId)?.name,
    }))

    const closed = requestsWithCourseName.filter((req) => req.response !== null)
    const open = requestsWithCourseName.filter((req) => req.response === null)

    const inbox = {
      closed,
      open,
    }

    return inbox
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}

export async function getShiftRequestById(id: string | string[]) {
  try {
    const { data } = await api.get<ShiftRequestType[]>('/shiftRequests', { params: { id } })

    const requestWithAuthor = {
      ...data[0],
      author: getStudentFromJSON(data[0].shiftId),
    }

    const requestWithCourseName = {
      ...requestWithAuthor,
      courseName: getCourseFromJSON(data[0].courseId)?.name,
      course: getCourseFromJSON(data[0].courseId),
    }

    const newShift = getShiftById(data[0].shiftId)
    const oldShift = getShiftById(data[0].oldShiftId)
    const requestWithShifts = {
      ...requestWithCourseName,
      newShift: formatShiftToCalendarEvent(newShift!),
      oldShift: formatShiftToCalendarEvent(oldShift!),
    }

    return requestWithShifts
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}

export async function countPendentInbox() {
  try {
    const auth = useAuthStore(pinia)

    const params = auth.user?.role === 'STUDENT' ? { studentId: auth.user.id } : undefined

    const { data } = await api.get<ShiftRequestType[]>('/shiftRequests?response=null', { params })

    return data.length
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}
