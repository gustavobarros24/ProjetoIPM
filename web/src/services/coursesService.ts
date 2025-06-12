import { ServerError } from '@/errors/server-error'
import { api } from './api'
import {
  getCoursePercentageConflicts,
  getCourseShifts,
  getStudentsEnrolledInCourse,
  getStudentsWithShiftsPercentage,
} from './utilts'
import type { BuildingType, ClassroomType, CourseType, StudentType } from '@/types'

type CourseByYear = CourseType & {
  enrolled: StudentType[]
  conflictsPercent: number
}

type GetAllCoursesResponse = CourseType[]

export async function getAllCoursesByYear() {
  try {
    const { data } = await api.get<GetAllCoursesResponse>('/courses')

    const groupedByYear: Record<number, CourseByYear[]> = data.reduce(
      (acc, course) => {
        if (!acc[course.year]) {
          acc[course.year] = []
        }

        const studentsEnrolled = getStudentsEnrolledInCourse(course.id)
        acc[course.year].push({
          ...course,
          enrolled: studentsEnrolled,
          conflictsPercent: getCoursePercentageConflicts(course.id),
        })

        return acc
      },
      {} as Record<number, CourseByYear[]>,
    )

    return groupedByYear
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}

export async function getAllCourses() {
  try {
    const { data } = await api.get<GetAllCoursesResponse>('/courses')
    return data
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}

export async function getAllClassrooms() {
  try {
    const { data } = await api.get<ClassroomType[]>('/classrooms')
    return data
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}

export async function getAllClassroomsWithBuildings() {
  try {
    const classrooms = await getAllClassrooms()
    const { data: buildings } = await api.get<BuildingType[]>('/buildings')

    return classrooms.map((classroom) => ({
      ...classroom,
      building: buildings.find((b) => +b.id == classroom.buildingId),
    }))
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}

type GetCourseByIdResponse = CourseType[]

export async function getCourseById(id: string | string[]) {
  try {
    const { data } = await api.get<GetCourseByIdResponse>('/courses', { params: { id } })
    const course = data[0]

    const studentsEnrolled = getStudentsEnrolledInCourse(course.id)
    const shifts = getCourseShifts(course.id)
    const percentageEnrolled = getStudentsWithShiftsPercentage(course.id)

    return {
      ...course,
      enrolled: studentsEnrolled,
      shifts,
      percentageEnrolled,
    }
  } catch (err: any) {
    throw new ServerError(err.message)
  }
}
