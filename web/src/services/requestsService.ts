import dayjs from 'dayjs'
import { api } from './api'
import { pinia } from '@/main'
import { useAuthStore } from '@/stores/auth'
import type { ShiftRequestType, ShiftType } from '@/types'
import { getOneAllocationByIds } from './utilts'
import { ServerError } from '@/errors/server-error'

type CreateShiftRequestPayload = {
  message: string
  shiftId: number
  courseId: number
  oldShiftId: number
}

export async function createNewShiftRequest({
  message,
  shiftId,
  courseId,
  oldShiftId,
}: CreateShiftRequestPayload) {
  const auth = useAuthStore(pinia)

  await api
    .post<ShiftRequestType>('/shiftRequests', {
      shiftId,
      oldShiftId,
      courseId,
      message,
      studentId: +auth.user!.id,
      response: null,
      alternativeShiftId: null,
      responseSeenByStudent: false,
      createdAt: dayjs().format('YYYY/MM/DD HH:mm'),
      accepted: false,
    })
    .then(console.log)
    .catch(console.log)
}

type AcceptRequestPayload = {
  shiftRequestsId: string
  studentId: string
  newShiftId: string
  oldShiftId: string
  message: string
}

export async function acceptRequest({
  shiftRequestsId,
  message,
  studentId,
  newShiftId,
  oldShiftId,
}: AcceptRequestPayload) {
  try {
    const oldAllocation = getOneAllocationByIds(studentId, oldShiftId)

    const newAllocation = {
      shiftId: Number(newShiftId),
      studentId: Number(studentId),
    }
    await Promise.all([
      // transfere o turno do aluno
      api.post('/allocations', newAllocation),
      api.delete(`/allocations/${oldAllocation?.id}`),
      // adiciona mensagem de resposta
      api.patch(`/shiftRequests/${shiftRequestsId}`, { response: message, accepted: true }),
    ])
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}

type RejectRequestPayload = {
  shiftRequestsId: string
  message: string
}

export async function rejectRequest({ shiftRequestsId, message }: RejectRequestPayload) {
  try {
    await api.patch(`/shiftRequests/${shiftRequestsId}`, {
      response: message,
      accepted: false,
    })
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}
