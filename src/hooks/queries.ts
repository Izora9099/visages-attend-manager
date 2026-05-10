/**
 * Central React Query hooks.
 *
 * Every component that needs server data should import from here instead of
 * calling djangoApi directly with useEffect/useState. This gives us caching,
 * background re-fetching, and cache invalidation for free.
 *
 * Query key structure:
 *   - List:   [entity]            e.g. ['departments']
 *   - List+f: [entity, filters]   e.g. ['students', { department: 1 }]
 *   - Detail: [entity, id]        e.g. ['students', 5]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { djangoApi } from '@/services/djangoApi';
import type {
  StudentFilters,
  CourseFilters,
  AttendanceFilters,
} from '@/types';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const qk = {
  departments:       () => ['departments']                              as const,
  specializations:   (f?: Record<string, unknown>) => ['specializations', f]  as const,
  levels:            () => ['levels']                                   as const,

  courses:           (f?: CourseFilters)    => ['courses', f]          as const,
  course:            (id: number)           => ['courses', id]         as const,

  students:          (f?: StudentFilters)   => ['students', f]         as const,
  student:           (id: number)           => ['students', id]        as const,

  attendance:        (f?: AttendanceFilters)=> ['attendance', f]       as const,

  dashboardStats:    () => ['dashboard-stats']                          as const,
  departmentStats:   () => ['department-stats']                         as const,
  courseStats:       () => ['course-stats']                             as const,
  teacherStats:      () => ['teacher-stats']                            as const,

  adminUsers:        () => ['admin-users']                              as const,
  systemSettings:    () => ['system-settings']                          as const,
  securitySettings:  () => ['security-settings']                        as const,
  securityStats:     () => ['security-stats']                           as const,
  userActivities:    () => ['user-activities']                          as const,
  loginAttempts:     () => ['login-attempts']                           as const,
  activeSessions:    () => ['active-sessions']                          as const,

  timetable:         (f?: Record<string, unknown>) => ['timetable', f] as const,
  timeSlots:         () => ['time-slots']                               as const,
  rooms:             () => ['rooms']                                    as const,
  timetableTeachers: () => ['timetable-teachers']                       as const,
  timetableCourses:  () => ['timetable-courses']                        as const,
} as const;

// ─── Departments ──────────────────────────────────────────────────────────────

export function useDepartments() {
  return useQuery({ queryKey: qk.departments(), queryFn: () => djangoApi.getDepartments() });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => djangoApi.createDepartment(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: qk.departments() }); },
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      djangoApi.updateDepartment(id, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: qk.departments() }); },
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => djangoApi.deleteDepartment(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: qk.departments() }); },
  });
}

// ─── Specializations ──────────────────────────────────────────────────────────

export function useSpecializations(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: qk.specializations(filters),
    queryFn: () => djangoApi.getSpecializations(filters ?? {}),
  });
}

export function useCreateSpecialization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => djangoApi.createSpecialization(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['specializations'] }); },
  });
}

export function useUpdateSpecialization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      djangoApi.updateSpecialization(id, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['specializations'] }); },
  });
}

export function useDeleteSpecialization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => djangoApi.deleteSpecialization(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['specializations'] }); },
  });
}

// ─── Levels ───────────────────────────────────────────────────────────────────

export function useLevels() {
  return useQuery({ queryKey: qk.levels(), queryFn: () => djangoApi.getLevels() });
}

export function useCreateLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => djangoApi.createLevel(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: qk.levels() }); },
  });
}

export function useUpdateLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      djangoApi.updateLevel(id, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: qk.levels() }); },
  });
}

export function useDeleteLevel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => djangoApi.deleteLevel(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: qk.levels() }); },
  });
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export function useCourses(filters?: CourseFilters) {
  return useQuery({
    queryKey: qk.courses(filters),
    queryFn: () => djangoApi.getCourses(filters ?? {}),
  });
}

export function useCourse(id: number) {
  return useQuery({
    queryKey: qk.course(id),
    queryFn: () => djangoApi.getCourse(id),
    enabled: id > 0,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => djangoApi.createCourse(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['courses'] }); },
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      djangoApi.updateCourse(id, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['courses'] }); },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => djangoApi.deleteCourse(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['courses'] }); },
  });
}

// ─── Students ─────────────────────────────────────────────────────────────────

export function useStudents(filters?: StudentFilters) {
  return useQuery({
    queryKey: qk.students(filters),
    queryFn: () => djangoApi.getStudents(filters ?? {}),
  });
}

export function useStudent(id: number) {
  return useQuery({
    queryKey: qk.student(id),
    queryFn: () => djangoApi.getStudent(id),
    enabled: id > 0,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => djangoApi.createStudent(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['students'] }); },
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      djangoApi.updateStudent(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => djangoApi.deleteStudent(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['students'] }); },
  });
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export function useAttendance(filters?: AttendanceFilters) {
  return useQuery({
    queryKey: qk.attendance(filters),
    queryFn: () => djangoApi.getAttendanceRecords(filters ?? {}),
  });
}

export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => djangoApi.markAttendance(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['attendance'] }); },
  });
}

export function useUpdateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      djangoApi.updateAttendance(id, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['attendance'] }); },
  });
}

export function useDeleteAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => djangoApi.deleteAttendance(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['attendance'] }); },
  });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({ queryKey: qk.dashboardStats(), queryFn: () => djangoApi.getDashboardStats() });
}

export function useDepartmentStats() {
  return useQuery({ queryKey: qk.departmentStats(), queryFn: () => djangoApi.getDepartmentStats() });
}

export function useCourseStats() {
  return useQuery({ queryKey: qk.courseStats(), queryFn: () => djangoApi.getCourseStats() });
}

export function useTeacherStats() {
  return useQuery({ queryKey: qk.teacherStats(), queryFn: () => djangoApi.getTeacherStats() });
}

// ─── Admin Users ──────────────────────────────────────────────────────────────

export function useAdminUsers() {
  return useQuery({ queryKey: qk.adminUsers(), queryFn: () => djangoApi.getAdminUsers() });
}

export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => djangoApi.createAdminUser(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: qk.adminUsers() }); },
  });
}

export function useUpdateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      djangoApi.updateAdminUser(id, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: qk.adminUsers() }); },
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => djangoApi.deleteAdminUser(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: qk.adminUsers() }); },
  });
}

// ─── Security ─────────────────────────────────────────────────────────────────

export function useUserActivities() {
  return useQuery({ queryKey: qk.userActivities(), queryFn: () => djangoApi.getUserActivities() });
}

export function useLoginAttempts() {
  return useQuery({ queryKey: qk.loginAttempts(), queryFn: () => djangoApi.getLoginAttempts() });
}

export function useActiveSessions() {
  return useQuery({ queryKey: qk.activeSessions(), queryFn: () => djangoApi.getActiveSessions() });
}

export function useSecurityStats() {
  return useQuery({ queryKey: qk.securityStats(), queryFn: () => djangoApi.getSecurityStatistics() });
}

export function useSecuritySettings() {
  return useQuery({ queryKey: qk.securitySettings(), queryFn: () => djangoApi.getSecuritySettings() });
}

export function useUpdateSecuritySettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => djangoApi.updateSecuritySettings(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: qk.securitySettings() }); },
  });
}

// ─── System Settings ──────────────────────────────────────────────────────────

export function useSystemSettings() {
  return useQuery({ queryKey: qk.systemSettings(), queryFn: () => djangoApi.getSystemSettings() });
}

export function useUpdateSystemSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => djangoApi.updateSystemSettings(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: qk.systemSettings() }); },
  });
}

// ─── Timetable ────────────────────────────────────────────────────────────────

export function useTimetable(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: qk.timetable(filters),
    queryFn: () => djangoApi.getTimetableEntries(filters ?? {}),
  });
}

export function useTimeSlots() {
  return useQuery({ queryKey: qk.timeSlots(), queryFn: () => djangoApi.getTimeSlots() });
}

export function useRooms() {
  return useQuery({ queryKey: qk.rooms(), queryFn: () => djangoApi.getRooms() });
}

export function useTimetableTeachers() {
  return useQuery({ queryKey: qk.timetableTeachers(), queryFn: () => djangoApi.getTimetableTeachers() });
}

export function useTimetableCourses() {
  return useQuery({ queryKey: qk.timetableCourses(), queryFn: () => djangoApi.getTimetableCourses() });
}

export function useCreateTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => djangoApi.createTimetableEntry(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['timetable'] }); },
  });
}

export function useUpdateTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      djangoApi.updateTimetableEntry(id, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['timetable'] }); },
  });
}

export function useDeleteTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => djangoApi.deleteTimetableEntry(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['timetable'] }); },
  });
}
