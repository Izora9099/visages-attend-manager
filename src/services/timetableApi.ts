// Mock timetable API — delegates to djangoApi mock service.

import { djangoApi } from './djangoApi';

export const timetableApi = {
  getEntries: (filters?: Record<string, any>) => djangoApi.getTimetableEntries(filters),
  createEntry: (data: any) => djangoApi.createTimetableEntry(data),
  updateEntry: (id: number, data: any) => djangoApi.updateTimetableEntry(id, data),
  deleteEntry: (id: number) => djangoApi.deleteTimetableEntry(id),
  getTimeSlots: () => djangoApi.getTimeSlots(),
  getRooms: () => djangoApi.getRooms(),
  getTeachers: () => djangoApi.getTimetableTeachers(),
  getCourses: () => djangoApi.getTimetableCourses(),
  getClassrooms: () => djangoApi.getRooms(),
  getAcademicLevels: () => djangoApi.getLevels(),
  getCurrentSessions: () => Promise.resolve([]),
  getTeacherSchedule: (teacherId: number) => djangoApi.getTimetableEntries({ teacher_id: teacherId }),
  getRoomSchedule: (roomId: number) => djangoApi.getTimetableEntries({ room_id: roomId }),
  getCourseSchedule: (courseId: number) => djangoApi.getTimetableEntries({ course_id: courseId }),
};

export default timetableApi;
