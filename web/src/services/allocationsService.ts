import { ServerError } from '@/errors/server-error'
import { api } from './api'
import { getOneAllocationByIds } from './utilts'

type AcceptRequestPayload = {
  studentId: string
  newShiftId: string
  oldShiftId: string
}

export async function manualAllocation({
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
      // FIXME: adicionar POST conflict se turno der conflito
    ])
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}
