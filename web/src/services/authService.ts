import type { RoleType } from '@/stores/auth'
import { api } from './api'
import { ServerError } from '@/errors/server-error'
import {
  formatShiftToCalendarEvent,
  getAllocationsByStudentId,
  getCourseFromJSON,
  getShiftById,
  getStudentShiftsByCourse,
} from './utilts'
import { type ShiftType, type StudentType } from '@/types'

type LoginRespose = {
  id: string
  email: string
  password: string
}[]

type LoginStudentRespose = StudentType[]

type LoginFunction = (
  email: string,
  password: string,
) => Promise<{ id: string; email: string; role: RoleType }>

export const login: LoginFunction = async (email, password) => {
  try {
    // busca diretores
    const { data } = await api.get<LoginRespose>('/directors', {
      params: { email },
    })

    // é diretor
    if (data.length !== 0) {
      const director = data[0]
      // senha correta
      if (director.password === password) {
        return {
          id: director.id,
          email: director.email,
          role: 'DIRECTOR',
        }
      }

      throw new Error('Credenciais inválidas')
    }

    // busca alunos
    const { data: studentsData } = await api.get<LoginStudentRespose>('/students', {
      params: { email },
    })

    // é aluno
    if (studentsData.length !== 0) {
      const student = studentsData[0]
      // senha correta
      if (student.password === password) {
        return {
          id: student.id,
          email: student.email,
          role: 'STUDENT',
        }
      }

      throw new Error('Credenciais inválidas')
    }

    throw new Error('Credenciais inválidas')
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}

type GetStudentProfileRespose = StudentType[]

export async function getStudentProfile(studentId: string | number) {
  try {
    const { data } = await api.get<GetStudentProfileRespose>('/students', {
      params: { id: studentId },
    })

    const student = data[0]

    // get enrolled courses
    const coursesEnrolled = student.enrolled.map(getCourseFromJSON)
    const enrolledWithShifts = coursesEnrolled.map((course) => ({
      ...course,
      shifts: getStudentShiftsByCourse(student.id, course!.id),
    }))

    const studentAllocations = getAllocationsByStudentId(student.id)
    const studentShifts = studentAllocations.map((allocation) => getShiftById(allocation.shiftId))

    // format shifts to event type
    const formatedShifts = studentShifts.map((s) => formatShiftToCalendarEvent(s as ShiftType))

    const profile = {
      ...data[0],
      shifts: formatedShifts,
      courses: enrolledWithShifts,
    }

    return profile
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}

type GetDirectorProfileResponse = {
  id: string
  email: string
  name: string
}

export async function getDirectorProfile(directorId: string | number) {
  try {
    const { data } = await api.get<GetDirectorProfileResponse[]>('/directors', {
      params: { id: directorId },
    })

    return data[0]
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}
