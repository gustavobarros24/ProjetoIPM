import { daysOfWeek, type ShiftType } from '@/types'
import jsondb from '../../trabalhodb.json'
import { chooseEventClassNames } from './shiftsService'

export function getStudentFromJSON(id: string | number) {
  return jsondb.students.find((student) => student.id == id)
}

export function getCourseFromJSON(id: string | number) {
  return jsondb.courses.find((course) => course.id == id)
}

export function getClassromFromJSON(id: string | number) {
  return jsondb.classrooms.find((c) => c.id == id)
}

export function getBuildingFromJSON(id: string | number) {
  return jsondb.buildings.find((b) => b.id == id)
}

export function getTeacherFromJSON(id: string | number) {
  return jsondb.teachers.find((teacher) => teacher.id == id)
}

export function getStudentsEnrolledInCourse(courseId: string | number) {
  const enrolled = jsondb.students.filter((student) => student.enrolled.includes(Number(courseId)))

  const enrolledWithShifts = enrolled.map((s) => ({
    ...s,
    shifts: getStudentShiftsByCourse(s.id, courseId),
  }))

  return enrolledWithShifts
}

export function getCourseShifts(courseId: string | number) {
  const shifts = jsondb.shifts.filter((s) => s.courseId == Number(courseId))
  return shifts
}

export function getStudentsWithShiftsPercentage(courseId: string | number) {
  const totalEnrolled = getStudentsEnrolledInCourse(courseId)

  // Get all shifts for the course
  const courseShifts = getCourseShifts(courseId)

  // Count the number of students enrolled in at least one shift
  const studentsWithShifts = totalEnrolled.filter((student) =>
    jsondb.allocations.some(
      (allocation) =>
        allocation.studentId == Number(student.id) &&
        courseShifts.some((shift) => Number(shift.id) == allocation.shiftId),
    ),
  )

  const percentage = (studentsWithShifts.length / totalEnrolled.length) * 100

  return percentage
}

export function getStudentShiftsByCourse(
  studentId: string | number,
  courseId: string | number,
): ShiftType[] {
  const courseShifts = getCourseShifts(courseId)

  // Filter allocations for the given student and course
  const userAllocations = jsondb.allocations.filter(
    (allocation) =>
      allocation.studentId == Number(studentId) &&
      courseShifts.some((shift) => Number(shift.id) == allocation.shiftId),
  )

  // Map allocations to their corresponding shifts
  const userShifts = userAllocations.map((allocation) =>
    courseShifts.find((shift) => Number(shift.id) === allocation.shiftId),
  )

  return userShifts as ShiftType[]
}

export function getAllocationsByStudentId(studentId: string) {
  return jsondb.allocations.filter((allocation) => allocation.studentId === +studentId)
}

export function getOneAllocationByIds(studentId: string, shiftId: string) {
  return jsondb.allocations.find(
    (allocation) => allocation.studentId == +studentId && allocation.shiftId == +shiftId,
  )
}

export function getShiftById(shiftId: string | number) {
  const shift = jsondb.shifts.find((shift) => shift.id == shiftId) as ShiftType | undefined
  return shift
}

export function formatShiftToCalendarEvent(shift: ShiftType) {
  const course = getCourseFromJSON(String(shift.courseId))
  const classroom = getClassromFromJSON(String(shift.classroomId))
  const building = getBuildingFromJSON(String(classroom!.buildingId))
  const teacher = getTeacherFromJSON(String(shift.teacherId))

  return {
    ...shift,
    id: String(shift.id),
    title: `${course?.abbreviation}-${shift.name}`,
    daysOfWeek: [daysOfWeek[shift.day]],
    startTime: shift.from + ':00:00',
    endTime: shift.to + ':00:00',
    course,
    classroom,
    building,
    teacher,
    classNames: [] as string[],
    enrolledCount: countStudentsInShift(shift.id),
    // ...chooseEventClassNames(shift),
  }
}

export function getCoursePercentageConflicts(courseId: string | number): number {
  const totalEnrolled = getStudentsEnrolledInCourse(courseId)
  if (totalEnrolled.length === 0) {
    return 0 // avoid division by zero
  }

  // find conflicts that involve the given courseId
  const courseConflicts = jsondb.conflicts.filter((conflict) =>
    conflict.courseIDs.includes(Number(courseId)),
  )

  // get the IDs of students enrolled in these conflicts
  const conflictedStudentIds = new Set(courseConflicts.map((conflict) => conflict.studentId))

  // count how many of the enrolled students are in the conflicted set
  const conflictedEnrolledCount = totalEnrolled.filter((student) =>
    conflictedStudentIds.has(Number(student.id)),
  ).length

  const percentage = (conflictedEnrolledCount / totalEnrolled.length) * 100

  return percentage
}

export function countStudentsInShift(shiftId: string | number): number {
  return jsondb.allocations.filter((allocation) => allocation.shiftId == +shiftId).length
}

export function getSmallestTPPLClassroomCapacity(courseId: string | number): number {
  
  const tpPlShifts = getCourseShifts(courseId)
    .filter(shift =>
      shift.type === 'TP' || shift.type === 'PL'
    );
  
  // If no TP/PL shifts found
  if (tpPlShifts.length === 0) return 0;
  
  // Get unique classrooms from these shifts
  const classroomIds = [...new Set(
    tpPlShifts
    .map(shift => Number(shift.classroomId))
  )];
  
  const classrooms = jsondb.classrooms
    .filter(classroom =>
      classroomIds.includes(Number(classroom.id))
    );
  
  // If no classrooms found
  if (classrooms.length === 0) return 0;
  
  const smallestClassroom = classrooms.reduce((prev, current) => 
    (prev.capacity < current.capacity) ? prev : current
  );
  
  return smallestClassroom.capacity;
}