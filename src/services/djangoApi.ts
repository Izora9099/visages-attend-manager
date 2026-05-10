// Mock API service — no backend calls. All data lives in src/data/mockData.ts.

import * as db from '@/data/mockData';

const delay = (ms = 150) => new Promise(r => setTimeout(r, ms));

let nextId = () => Date.now();

// Mutable in-memory copies so CRUD operations persist during the session
let departments = [...db.departments];
let specializations = [...db.specializations];
let levels = [...db.levels];
let courses = [...db.courses];
let students = [...db.students];
let adminUsers = [...db.adminUsers];
let attendance = [...db.attendanceRecords];
let sessions = [...db.attendanceSessions];
let activities = [...db.userActivities];
let timetable = [...db.timetableEntries];
let systemSettings = { ...db.systemSettings };
let securitySettings = { ...db.securitySettings };

function paginate<T>(arr: T[], filters: Record<string, any> = {}) {
  const page = Number(filters.page) || 1;
  const size = Number(filters.page_size) || 50;
  const results = arr.slice((page - 1) * size, page * size);
  return { count: arr.length, results };
}

class DjangoApiService {
  // ── Auth ──────────────────────────────────────────────────────────────
  async login(username: string, password: string) {
    await delay();
    if (!username || !password) throw new Error('Username and password are required.');
    const user = adminUsers.find(u => u.username === username) || adminUsers[0];
    return { access: 'mock-token', refresh: 'mock-refresh', user };
  }

  async getCurrentUser() {
    await delay();
    const stored = localStorage.getItem('mock_user');
    if (stored) return JSON.parse(stored);
    return adminUsers[0];
  }

  async logout() {
    localStorage.removeItem('mock_user');
  }

  async refreshToken() { return true; }

  // ── Departments ───────────────────────────────────────────────────────
  async getDepartments(_filters: Record<string, any> = {}) {
    await delay();
    return departments;
  }
  async createDepartment(data: any) {
    await delay();
    const item = { ...data, id: nextId(), is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    departments = [item, ...departments];
    return item;
  }
  async updateDepartment(id: number, data: any) {
    await delay();
    departments = departments.map(d => d.id === id ? { ...d, ...data, updated_at: new Date().toISOString() } : d);
    return departments.find(d => d.id === id);
  }
  async deleteDepartment(id: number) {
    await delay();
    departments = departments.filter(d => d.id !== id);
  }

  // ── Specializations ───────────────────────────────────────────────────
  async getSpecializations(filters: Record<string, any> = {}) {
    await delay();
    let list = specializations;
    if (filters.department) list = list.filter(s => s.department === Number(filters.department));
    return list;
  }
  async createSpecialization(data: any) {
    await delay();
    const dept = departments.find(d => d.id === Number(data.department));
    const item = { ...data, id: nextId(), department_name: dept?.department_name, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    specializations = [item, ...specializations];
    return item;
  }
  async updateSpecialization(id: number, data: any) {
    await delay();
    specializations = specializations.map(s => s.id === id ? { ...s, ...data, updated_at: new Date().toISOString() } : s);
    return specializations.find(s => s.id === id);
  }
  async deleteSpecialization(id: number) {
    await delay();
    specializations = specializations.filter(s => s.id !== id);
  }

  // ── Levels ────────────────────────────────────────────────────────────
  async getLevels(_filters: Record<string, any> = {}) {
    await delay();
    return levels;
  }
  async createLevel(data: any) {
    await delay();
    const item = { ...data, id: nextId(), is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    levels = [item, ...levels];
    return item;
  }
  async updateLevel(id: number, data: any) {
    await delay();
    levels = levels.map(l => l.id === id ? { ...l, ...data, updated_at: new Date().toISOString() } : l);
    return levels.find(l => l.id === id);
  }
  async deleteLevel(id: number) {
    await delay();
    levels = levels.filter(l => l.id !== id);
  }

  // ── Courses ───────────────────────────────────────────────────────────
  async getCourses(filters: Record<string, any> = {}) {
    await delay();
    let list = courses;
    if (filters.department) list = list.filter(c => c.department === Number(filters.department));
    if (filters.level) list = list.filter(c => c.level === Number(filters.level));
    if (filters.search) list = list.filter(c => c.course_name.toLowerCase().includes(filters.search.toLowerCase()) || c.course_code.toLowerCase().includes(filters.search.toLowerCase()));
    return list;
  }
  async getCourse(id: number) {
    await delay();
    return courses.find(c => c.id === id);
  }
  async createCourse(data: any) {
    await delay();
    const dept = departments.find(d => d.id === Number(data.department));
    const lvl = levels.find(l => l.id === Number(data.level));
    const item = { ...data, id: nextId(), department_name: dept?.department_name, level_name: lvl?.level_name, enrolled_students_count: 0, status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    courses = [item, ...courses];
    return item;
  }
  async updateCourse(id: number, data: any) {
    await delay();
    courses = courses.map(c => c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c);
    return courses.find(c => c.id === id);
  }
  async deleteCourse(id: number) {
    await delay();
    courses = courses.filter(c => c.id !== id);
  }
  async getCourseStudents(courseId: number) {
    await delay();
    return students.filter(s => s.enrolled_courses.includes(courseId));
  }
  async enrollStudentsInCourse(courseId: number, studentIds: number[]) {
    await delay();
    students = students.map(s => studentIds.includes(s.id) && !s.enrolled_courses.includes(courseId) ? { ...s, enrolled_courses: [...s.enrolled_courses, courseId] } : s);
    return { enrolled: studentIds.length };
  }

  // ── Students ──────────────────────────────────────────────────────────
  async getStudents(filters: Record<string, any> = {}) {
    await delay();
    let list = students;
    if (filters.department) list = list.filter(s => s.department === Number(filters.department));
    if (filters.level) list = list.filter(s => s.level === Number(filters.level));
    if (filters.specialization) list = list.filter(s => s.specialization === Number(filters.specialization));
    if (filters.status) list = list.filter(s => s.status === filters.status);
    if (filters.search) list = list.filter(s => s.full_name?.toLowerCase().includes(filters.search.toLowerCase()) || s.matric_number.toLowerCase().includes(filters.search.toLowerCase()));
    return paginate(list, filters);
  }
  async getStudent(id: number) {
    await delay();
    return students.find(s => s.id === id);
  }
  async createStudent(data: any) {
    await delay();
    const dept = departments.find(d => d.id === Number(data.department));
    const lvl = levels.find(l => l.id === Number(data.level));
    const spec = specializations.find(s => s.id === Number(data.specialization));
    const item = { ...data, id: nextId(), full_name: `${data.first_name} ${data.last_name}`, department_name: dept?.department_name, level_name: lvl?.level_name, specialization_name: spec?.specialization_name, enrolled_courses: [], face_images_count: 0, attendance_rate: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    students = [item, ...students];
    return item;
  }
  async updateStudent(id: number, data: any) {
    await delay();
    students = students.map(s => s.id === id ? { ...s, ...data, full_name: `${data.first_name || s.first_name} ${data.last_name || s.last_name}`, updated_at: new Date().toISOString() } : s);
    return students.find(s => s.id === id);
  }
  async deleteStudent(id: number) {
    await delay();
    students = students.filter(s => s.id !== id);
  }

  // ── Attendance ────────────────────────────────────────────────────────
  async getAttendanceRecords(filters: Record<string, any> = {}) {
    await delay();
    let list = attendance;
    if (filters.course_id) list = list.filter(a => a.course === Number(filters.course_id));
    if (filters.student_id) list = list.filter(a => a.student === Number(filters.student_id));
    if (filters.status) list = list.filter(a => a.status === filters.status);
    return paginate(list, filters);
  }
  async markAttendance(data: any) {
    await delay();
    const student = students.find(s => s.id === Number(data.student));
    const course = courses.find(c => c.id === Number(data.course));
    const item = { ...data, id: nextId(), student_name: student?.full_name, student_matric: student?.matric_number, course_name: course?.course_name, course_code: course?.course_code, check_in_time: new Date().toISOString(), date: new Date().toISOString().split('T')[0], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    attendance = [item, ...attendance];
    return item;
  }
  async updateAttendance(id: number, data: any) {
    await delay();
    attendance = attendance.map(a => a.id === id ? { ...a, ...data, updated_at: new Date().toISOString() } : a);
    return attendance.find(a => a.id === id);
  }
  async deleteAttendance(id: number) {
    await delay();
    attendance = attendance.filter(a => a.id !== id);
  }
  async markAttendanceWithValidation(data: any) { return this.markAttendance(data); }

  // ── Sessions ──────────────────────────────────────────────────────────
  async startAttendanceSession(data: any) {
    await delay();
    const course = courses.find(c => c.id === Number(data.course));
    const item = { ...data, id: nextId(), session_id: `SES-${Date.now()}`, course_name: course?.course_name, course_code: course?.course_code, start_time: new Date().toISOString(), status: 'active', present_count: 0, late_count: 0, absent_count: 0, created_at: new Date().toISOString() };
    sessions = [item, ...sessions];
    return item;
  }
  async endAttendanceSession(data: any) {
    await delay();
    sessions = sessions.map(s => s.session_id === data.session_id ? { ...s, status: 'completed', actual_end_time: new Date().toISOString() } : s);
    return sessions.find(s => s.session_id === data.session_id);
  }
  async getSessionStats(sessionId: string) {
    await delay();
    return sessions.find(s => s.session_id === sessionId);
  }

  // ── Dashboard ─────────────────────────────────────────────────────────
  async getDashboardStats() {
    await delay();
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendance.filter(a => a.date === today);
    return {
      total_students: students.filter(s => s.status === 'active').length,
      total_courses: courses.filter(c => c.status === 'active').length,
      total_departments: departments.filter(d => d.is_active).length,
      total_teachers: adminUsers.filter(u => u.role === 'teacher').length,
      active_sessions: sessions.filter(s => s.status === 'active').length,
      total_attendance_records: attendance.length,
      todays_attendance_count: todayRecords.length,
      todays_attendance_rate: todayRecords.length > 0 ? Math.round(todayRecords.filter(a => a.status === 'present').length / todayRecords.length * 100) : 0,
      weekly_attendance_trend: [
        { day: 'Mon', rate: 88 }, { day: 'Tue', rate: 82 }, { day: 'Wed', rate: 91 }, { day: 'Thu', rate: 85 }, { day: 'Fri', rate: 79 },
      ],
      recent_activities: activities.slice(0, 5),
    };
  }

  async getDepartmentStats() {
    await delay();
    return departments.map(dept => ({
      department_name: dept.department_name,
      total_students: students.filter(s => s.department === dept.id).length,
      total_courses: courses.filter(c => c.department === dept.id).length,
      total_specializations: specializations.filter(s => s.department === dept.id).length,
      average_attendance_rate: Math.floor(75 + Math.random() * 20),
    }));
  }

  async getCourseStats() {
    await delay();
    return courses.map(c => ({
      course_code: c.course_code,
      course_name: c.course_name,
      enrolled_students: c.enrolled_students_count || 0,
      total_attendance_records: attendance.filter(a => a.course === c.id).length,
      average_attendance_rate: Math.floor(70 + Math.random() * 25),
    }));
  }

  async getTeacherStats() {
    await delay();
    return adminUsers.filter(u => u.role === 'teacher').map(t => ({
      teacher_name: t.full_name,
      total_courses: courses.filter(c => c.teachers.includes(t.id)).length,
      total_students: 0,
      total_attendance_records: 0,
    }));
  }

  // ── Admin Users ───────────────────────────────────────────────────────
  async getAdminUsers() {
    await delay();
    return adminUsers.map(u => ({ ...u, name: u.full_name ?? `${u.first_name} ${u.last_name}` }));
  }
  async createAdminUser(data: any) {
    await delay();
    const item = { ...data, id: nextId(), full_name: `${data.first_name} ${data.last_name}`, is_active: true, is_2fa_enabled: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    adminUsers = [item, ...adminUsers];
    return item;
  }
  async updateAdminUser(id: number, data: any) {
    await delay();
    adminUsers = adminUsers.map(u => u.id === id ? { ...u, ...data, updated_at: new Date().toISOString() } : u);
    return adminUsers.find(u => u.id === id);
  }
  async deleteAdminUser(id: number) {
    await delay();
    adminUsers = adminUsers.filter(u => u.id !== id);
  }

  // ── Security ──────────────────────────────────────────────────────────
  async getUserActivities(_filters: any = {}) {
    await delay();
    return activities.slice(0, 20);
  }
  async getLoginAttempts() {
    await delay();
    return db.loginAttempts;
  }
  async getActiveSessions() {
    await delay();
    return db.activeSessions;
  }
  async getSecurityStatistics() {
    await delay();
    return { total_logins: 42, failed_logins: 3, active_sessions: 2, blocked_ips: 1 };
  }
  async getSecuritySettings() {
    await delay();
    return securitySettings;
  }
  async updateSecuritySettings(data: any) {
    await delay();
    securitySettings = { ...securitySettings, ...data, updated_at: new Date().toISOString() };
    return securitySettings;
  }
  async terminateSession(_sessionId: string) {
    await delay();
    return { success: true };
  }

  // ── System Settings ───────────────────────────────────────────────────
  async getSystemSettings() {
    await delay();
    return systemSettings;
  }
  async updateSystemSettings(data: any) {
    await delay();
    systemSettings = { ...systemSettings, ...data, updated_at: new Date().toISOString() };
    return systemSettings;
  }
  async createSystemBackup() {
    await delay();
    return { id: nextId(), status: 'completed', file_size_mb: 12, started_at: new Date().toISOString(), completed_at: new Date().toISOString() };
  }

  // ── Timetable ─────────────────────────────────────────────────────────
  async getTimetableEntries(filters: any = {}) {
    await delay();
    let list = timetable;
    if (filters.department && filters.department !== 'all') list = list.filter(t => t.department === filters.department);
    if (filters.level && filters.level !== 'all') list = list.filter(t => t.level === filters.level);
    return list;
  }
  async createTimetableEntry(data: any) {
    await delay();
    const item = { ...data, id: nextId() };
    timetable = [item, ...timetable];
    return item;
  }
  async updateTimetableEntry(id: number, data: any) {
    await delay();
    timetable = timetable.map(t => t.id === id ? { ...t, ...data } : t);
    return timetable.find(t => t.id === id);
  }
  async deleteTimetableEntry(id: number) {
    await delay();
    timetable = timetable.filter(t => t.id !== id);
  }
  async getTimeSlots() {
    await delay();
    return [
      { id: 1, name: 'Period 1', start_time: '08:00', end_time: '10:00' },
      { id: 2, name: 'Period 2', start_time: '10:00', end_time: '12:00' },
      { id: 3, name: 'Period 3', start_time: '13:00', end_time: '15:00' },
      { id: 4, name: 'Period 4', start_time: '15:00', end_time: '17:00' },
    ];
  }
  async getRooms() {
    await delay();
    return [
      { id: 1, name: 'CSE Lab 1', capacity: 40 },
      { id: 2, name: 'CSE Lab 2', capacity: 40 },
      { id: 3, name: 'EEE Hall A', capacity: 60 },
      { id: 4, name: 'BUS Room 1', capacity: 50 },
      { id: 5, name: 'MAT Room A', capacity: 45 },
    ];
  }
  async getTimetableTeachers() { return this.getAdminUsers().then(u => u.filter((a: any) => a.role === 'teacher')); }
  async getTimetableCourses() { return this.getCourses(); }

  // ── Misc helpers kept for compatibility ───────────────────────────────
  async getApiUrl() { return 'mock://localhost'; }
  async testConnection() { return true; }
  async getStudentAttendanceSummary(studentId: number) {
    await delay();
    const records = attendance.filter(a => a.student === studentId);
    return { total: records.length, present: records.filter(r => r.status === 'present').length, absent: records.filter(r => r.status === 'absent').length, late: records.filter(r => r.status === 'late').length };
  }

  // ── Aliases & missing methods ─────────────────────────────────────────
  async getSystemStats() {
    await delay();
    return { cpu_usage: 18, memory_usage: 42, disk_usage: 31, active_users: 4, total_requests_today: 128, uptime_hours: 720 };
  }

  async createBackup() { return this.createSystemBackup(); }

  async testEmailSettings() {
    await delay();
    return { success: true, message: 'Email settings OK (mock)' };
  }

  async exportActivityLog(_filters: any = {}) {
    await delay();
    const csv = 'timestamp,user,action,resource,status\n' +
      activities.map(a => `${a.timestamp},${a.user},${a.action},${a.resource},${a.status}`).join('\n');
    return new Blob([csv], { type: 'text/csv' });
  }

  async updateCurrentUserProfile(data: any) {
    await delay();
    const stored = localStorage.getItem('mock_user');
    if (stored) {
      const updated = { ...JSON.parse(stored), ...data };
      localStorage.setItem('mock_user', JSON.stringify(updated));
      return updated;
    }
    return data;
  }
}

export const djangoApi = new DjangoApiService();
