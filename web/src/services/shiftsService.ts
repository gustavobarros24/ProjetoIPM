import { api } from './api'
import { ServerError } from '@/errors/server-error'
import { formatShiftToCalendarEvent } from './utilts'
import { type ShiftType } from '@/types'

type GetShiftsByCourseIdResponse = Array<
  ShiftType & {
    subscribed?: boolean
    conflict?: boolean
  }
>

export async function getShiftsByCourseId(courseId: string) {
  try {
    const { data } = await api.get<GetShiftsByCourseIdResponse>(`/shifts?courseId=${courseId}`)

    // FIXME: hard coded just for test
    // data[0].subscribed = true
    // data[5].conflict = true
    // data[6].conflict = true

    const formatedShifts = data.map((s) => formatShiftToCalendarEvent(s as ShiftType))

    return formatedShifts
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}

export async function updateShiftClassroom(shiftId: string, newClassroomId: number) {
  try {
    const { data } = await api.patch(`/shifts/${shiftId}`, { classroomId: newClassroomId })
    return data
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}

export function chooseEventClassNames(shift: GetShiftsByCourseIdResponse[number]) {
  if (shift.conflict)
    return {
      classNames: ['conflict'],
    }

  if (shift.subscribed)
    return {
      classNames: ['subscribed'],
    }

  return {
    classNames: ['available'],
  }
}
