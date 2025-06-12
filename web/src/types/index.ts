import type { formatShiftToCalendarEvent } from '@/services/utilts'

export const daysOfWeek = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
}

export const daysOfWeekPT = {
  Monday: 'Segunda-feira',
  Tuesday: 'Terça-feira',
  Wednesday: 'Quarta-feira',
  Thursday: 'Quinta-feira',
  Friday: 'Sexta-feira',
}

export const shiftTypePT = {
  TP: 'Teórico-Prático',
  T: 'Teórico',
  PL: 'Prático-Laboral',
}

export type ShiftType = {
  id: string
  courseId: number
  classroomId: number
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
  from: number
  to: number
  type: 'TP' | 'T' | 'PL'
  name: string
  teacherId: number
  totalStudentsRegistered: number
}

export type FormatedShiftType = ReturnType<typeof formatShiftToCalendarEvent>

export type StudentType = {
  id: string
  name: string
  email: string
  password: string
  specialStatus?: boolean
  enrolled: number[]
}

export type ShiftRequestType = {
  id: string
  shiftId: number
  oldShiftId: number
  courseId: number
  studentId: number
  response: string | null
  alternativeShiftId: number | null
  responseSeenByStudent: boolean
  message: string | null
  createdAt: string
  accepted: boolean
}

export type ClassroomRequestType = {
  id: string
  classroomId: number
  oldClassroomId: number
  teacherId: number
  response: null | string
  responseSeenByTeacher: boolean
  message: string | null
  createdAt: string
}

export type CourseType = {
  id: string
  name: string
  abbreviation: string
  year: number
  semester: number
  degreeId: number
}

export type ConflictType = {
  id: string
  studentId: number
  courseIDs: number[]
  shiftIDs: number[]
}

export type ClassroomType = {
  id: string
  name: string
  capacity: number
  buildingId: number
}

export type BuildingType = {
  id: string
  name: string
  abbreviation: string
}
