// src/services/djangoApi.ts - Complete updated version with attendance fixes

import { UserPermissions } from '@/types/permissions';

interface ApiEndpoint {
  url: string;
  name: string;
  priority: number;
}

class DjangoApiService {
  private baseUrl: string | null = null;
  private lastDetectionTime: number = 0;
  private readonly detectionCacheMs = 30000; // 30 seconds
  private isRefreshing = false;

  private readonly possibleEndpoints: ApiEndpoint[] = [
    { url: 'http://localhost:8000', name: 'Development', priority: 1 },
    { url: 'http://127.0.0.1:8000', name: 'Local IPv4', priority: 2 },
    { url: 'http://localhost:8080', name: 'Alternative Dev', priority: 3 },
    { url: 'http://192.168.1.100:8000', name: 'LAN', priority: 4 },
  ];

  async getApiUrl(): Promise<string> {
    if (this.baseUrl && Date.now() - this.lastDetectionTime < this.detectionCacheMs) {
      return this.baseUrl;
    }

    const detectedUrl = await this.detectBackendUrl();
    this.baseUrl = detectedUrl;
    return detectedUrl;
  }

  private async detectBackendUrl(): Promise<string> {
    console.log('🚀 Starting Django backend auto-detection...');
    this.lastDetectionTime = Date.now();
    
    const sortedEndpoints = [...this.possibleEndpoints].sort((a, b) => a.priority - b.priority);

    for (const endpoint of sortedEndpoints) {
      const isReachable = await this.testEndpoint(endpoint);
      if (isReachable) {
        // Note: No /api prefix since your URLs don't use it at root level
        const detectedUrl = endpoint.url;
        console.log(`🎯 Selected Django backend: ${detectedUrl} (${endpoint.name})`);
        return detectedUrl;
      }
    }

    console.warn('⚠️ No Django backend detected, using fallback...');
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl) {
      console.log(`🔄 Using environment variable: ${envUrl}`);
      return envUrl;
    }

    const fallbackUrl = 'http://localhost:8000';
    console.log(`🔄 Using fallback URL: ${fallbackUrl}`);
    return fallbackUrl;
  }

  private async testEndpoint(endpoint: ApiEndpoint): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      // Test the root API endpoint
      const response = await fetch(`${endpoint.url}/`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });

      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 401 || response.status === 403) {
        console.log(`✅ Django backend reachable: ${endpoint.url} (${endpoint.name})`);
        return true;
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log(`⏰ Timeout testing: ${endpoint.url} (${endpoint.name})`);
      } else {
        console.log(`❌ Error testing ${endpoint.url} (${endpoint.name}):`, error.message);
      }
    }
    return false;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const apiUrl = await this.getApiUrl();
    const url = `${apiUrl}${endpoint}`;
    
    const token = localStorage.getItem('access_token');
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
      console.log(`🔑 Request to ${endpoint} - Token: ${token.substring(0, 20)}...`);
    } else {
      console.warn(`⚠️ Request to ${endpoint} - NO TOKEN FOUND`);
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log(`📡 Making ${config.method || 'GET'} request to ${endpoint}`);
      const response = await fetch(url, config);
      return await this.handleResponse(response, endpoint);
    } catch (error: any) {
      console.error(`❌ API Error [${endpoint}]:`, error);
      throw new Error(error.message || 'Network error occurred');
    }
  }

  private async handleResponse(response: Response, endpoint: string): Promise<any> {
    console.log(`📨 Response from ${endpoint}: ${response.status} ${response.statusText}`);

    if (response.status === 401 && !this.isRefreshing) {
      console.log('🔄 Attempting token refresh...');
      const refreshed = await this.refreshToken();
      if (refreshed) {
        console.log('✅ Token refreshed, retrying request...');
        return this.makeRequest(endpoint);
      } else {
        console.log('❌ Token refresh failed, redirecting to login...');
        this.logout();
        throw new Error('Session expired. Please log in again.');
      }
    }

    if (!response.ok) {
      let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
        
        // Create error object with additional context
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).errors = errorData;
        throw error;
      } catch (jsonError) {
        throw new Error(errorMessage);
      }
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  }

  // ============================
  // 🔐 AUTHENTICATION (Matches your URLs exactly)
  // ============================
  
  async login(username: string, password: string): Promise<any> {
    console.log('🔑 Attempting login...');
    const response = await this.makeRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.access && response.refresh) {
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
      console.log('✅ Login successful');
      return response;
    }
    throw new Error('Invalid response format');
  }

  async refreshToken(): Promise<boolean> {
    if (this.isRefreshing) return false;
    
    this.isRefreshing = true;
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        return false;
      }

      const response = await this.makeRequest('/auth/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.access) {
        localStorage.setItem('access_token', response.access);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  async getCurrentUser(): Promise<any> {
    return this.makeRequest('/auth/user/');
  }

  async logout(): Promise<void> {
    console.log('👋 Logging out...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  }

  // ============================
  // 🏛️ ACADEMIC STRUCTURE (ViewSet endpoints - matches your router)
  // ============================

  // DEPARTMENTS
  async getDepartments(filters?: Record<string, any>): Promise<any> {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    return this.makeRequest(`/departments/${query}`);
  }

  async createDepartment(data: any): Promise<any> {
    return this.makeRequest('/departments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDepartment(id: number): Promise<any> {
    return this.makeRequest(`/departments/${id}/`);
  }

  async updateDepartment(id: number, data: any): Promise<any> {
    return this.makeRequest(`/departments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDepartment(id: number): Promise<any> {
    return this.makeRequest(`/departments/${id}/`, {
      method: 'DELETE',
    });
  }

  // SPECIALIZATIONS
  async getSpecializations(filters?: Record<string, any>): Promise<any> {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    return this.makeRequest(`/specializations/${query}`);
  }

  async createSpecialization(data: any): Promise<any> {
    return this.makeRequest('/specializations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSpecialization(id: number): Promise<any> {
    return this.makeRequest(`/specializations/${id}/`);
  }

  async updateSpecialization(id: number, data: any): Promise<any> {
    return this.makeRequest(`/specializations/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSpecialization(id: number): Promise<any> {
    return this.makeRequest(`/specializations/${id}/`, {
      method: 'DELETE',
    });
  }

  // LEVELS
  async getLevels(filters?: Record<string, any>): Promise<any> {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    return this.makeRequest(`/levels/${query}`);
  }

  async createLevel(data: any): Promise<any> {
    return this.makeRequest('/levels/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLevel(id: number): Promise<any> {
    return this.makeRequest(`/levels/${id}/`);
  }

  async updateLevel(id: number, data: any): Promise<any> {
    return this.makeRequest(`/levels/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteLevel(id: number): Promise<any> {
    return this.makeRequest(`/levels/${id}/`, {
      method: 'DELETE',
    });
  }

  // COURSES
  async getCourses(filters?: Record<string, any>): Promise<any> {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    return this.makeRequest(`/courses/${query}`);
  }

  async createCourse(data: any): Promise<any> {
    console.log('📚 Creating course with data:', data);
    return this.makeRequest('/courses/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCourse(id: number): Promise<any> {
    return this.makeRequest(`/courses/${id}/`);
  }

  async updateCourse(id: number, data: any): Promise<any> {
    console.log('📝 Updating course:', id, data);
    return this.makeRequest(`/courses/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCourse(id: number): Promise<any> {
    return this.makeRequest(`/courses/${id}/`, {
      method: 'DELETE',
    });
  }

  // Course extended actions (matches your custom endpoints)
  async getCourseStudents(courseId: number): Promise<any> {
    try {
      const response = await this.makeRequest(`/courses/${courseId}/students/`);
      console.log(`📚 Course ${courseId} students:`, response);
      return response || [];
    } catch (error) {
      console.error(`❌ Error fetching students for course ${courseId}:`, error);
      return [];
    }
  }

  async getCourseAttendance(courseId: number): Promise<any> {
    return this.makeRequest(`/courses/${courseId}/attendance/`);
  }

  async enrollStudentsInCourse(courseId: number, studentIds: number[]): Promise<any> {
    return this.makeRequest(`/courses/${courseId}/enroll-students/`, {
      method: 'POST',
      body: JSON.stringify({ student_ids: studentIds }),
    });
  }

  // STUDENTS
  async getStudents(filters?: Record<string, any>): Promise<any> {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    return this.makeRequest(`/students/${query}`);
  }

  async createStudent(data: any): Promise<any> {
    return this.makeRequest('/students/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStudent(id: number): Promise<any> {
    return this.makeRequest(`/students/${id}/`);
  }

  async updateStudent(id: number, data: any): Promise<any> {
    return this.makeRequest(`/students/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStudent(id: number): Promise<any> {
    return this.makeRequest(`/students/${id}/`, {
      method: 'DELETE',
    });
  }

  // Student extended actions (matches your custom endpoints)
  async getStudentCourses(studentId: number): Promise<any> {
    return this.makeRequest(`/students/${studentId}/courses/`);
  }

  async enrollStudentInCourses(studentId: number, courseIds: number[]): Promise<any> {
    return this.makeRequest(`/students/${studentId}/enroll-courses/`, {
      method: 'POST',
      body: JSON.stringify({ course_ids: courseIds }),
    });
  }

  async autoAssignStudentCourses(studentId: number): Promise<any> {
    return this.makeRequest(`/students/${studentId}/auto-assign-courses/`, {
      method: 'POST',
    });
  }

  async getStudentAttendanceSummary(studentId: number): Promise<any> {
    return this.makeRequest(`/students/${studentId}/attendance-summary/`);
  }

  // Legacy endpoint for backward compatibility
  async getStudentsList(): Promise<any> {
    return this.makeRequest('/get-students/');
  }

  // ============================
  // 🎓 ENHANCED ATTENDANCE & ENROLLMENT METHODS (NEW)
  // ============================

  async getStudentsWithEnrollment(filters?: Record<string, any>): Promise<any[]> {
    try {
      const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
      const response = await this.makeRequest(`/students/${query}`);
      
      // Ensure each student has enrollment information
      const students = response.results || response;
      return students.map((student: any) => ({
        id: student.id,
        name: student.full_name || `${student.first_name} ${student.last_name}`.trim(),
        first_name: student.first_name,
        last_name: student.last_name,
        matric_number: student.matric_number,
        email: student.email,
        department: student.department,
        level: student.level,
        enrolled_courses: student.enrolled_courses || [],
        status: student.status || 'active'
      }));
    } catch (error) {
      console.error('❌ Error fetching students with enrollment:', error);
      return [];
    }
  }

  async enrollStudentInCourse(studentId: number, courseId: number): Promise<any> {
    try {
      return await this.makeRequest(`/students/${studentId}/enroll-courses/`, {
        method: 'POST',
        body: JSON.stringify({ course_ids: [courseId] }),
      });
    } catch (error) {
      console.error(`❌ Error enrolling student ${studentId} in course ${courseId}:`, error);
      throw error;
    }
  }

  async checkStudentEnrollment(studentId: number, courseId: number): Promise<boolean> {
    try {
      const student = await this.getStudent(studentId);
      const enrolledCourseIds = student.enrolled_courses?.map((course: any) => course.id) || [];
      return enrolledCourseIds.includes(courseId);
    } catch (error) {
      console.error(`❌ Error checking enrollment for student ${studentId}:`, error);
      return false;
    }
  }

  // Enhanced attendance marking with enrollment validation
  async markAttendanceWithValidation(attendanceData: {
    student: number;
    course: number;
    status: string;
    notes?: string;
  }): Promise<any> {
    try {
      // First check if student is enrolled in the course
      const isEnrolled = await this.checkStudentEnrollment(attendanceData.student, attendanceData.course);
      
      if (!isEnrolled) {
        // Auto-enroll the student if they're not enrolled
        console.log(`🔄 Auto-enrolling student ${attendanceData.student} in course ${attendanceData.course}`);
        await this.enrollStudentInCourse(attendanceData.student, attendanceData.course);
      }
      
      // Now mark attendance
      return await this.markAttendance(attendanceData);
    } catch (error) {
      console.error('❌ Error marking attendance with validation:', error);
      throw error;
    }
  }

  // Get students enrolled in a specific course with full details
  async getEnrolledStudentsForCourse(courseId: number): Promise<any[]> {
    try {
      const response = await this.makeRequest(`/courses/${courseId}/students/`);
      console.log(`📚 Enrolled students for course ${courseId}:`, response);
      
      // Ensure proper formatting
      return (response || []).map((student: any) => ({
        id: student.id,
        name: student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || student.name || 'Unknown Student',
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        matric_number: student.matric_number || '',
        email: student.email || '',
        department: student.department || null,
        level: student.level || null,
        status: student.status || 'active'
      }));
    } catch (error) {
      console.error(`❌ Error fetching enrolled students for course ${courseId}:`, error);
      return [];
    }
  }

  // ============================
  // 📊 ATTENDANCE (ViewSet and custom endpoints)
  // ============================

  async getAttendanceRecords(filters?: Record<string, any>): Promise<any> {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    return this.makeRequest(`/attendance/${query}`);
  }

  async markAttendance(attendanceData: any): Promise<any> {
    return this.makeRequest('/attendance/', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async getAttendanceRecord(id: number): Promise<any> {
    return this.makeRequest(`/attendance/${id}/`);
  }

  async updateAttendance(id: number, data: { status?: string; check_in?: string }): Promise<any> {
    return this.makeRequest(`/attendance/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAttendance(id: number): Promise<any> {
    return this.makeRequest(`/attendance/${id}/`, {
      method: 'DELETE',
    });
  }

  // Legacy endpoint for getting attendance summary
  async getAttendanceSummary(): Promise<any> {
    return this.makeRequest('/get-attendance/');
  }

  // ============================
  // 🎯 SESSION MANAGEMENT (Matches your session endpoints)
  // ============================

  async startAttendanceSession(sessionData: any): Promise<any> {
    return this.makeRequest('/sessions/start/', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async endAttendanceSession(sessionData: any): Promise<any> {
    return this.makeRequest('/sessions/end/', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async sessionBasedAttendance(attendanceData: any): Promise<any> {
    return this.makeRequest('/attendance/checkin/', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async getSessionStats(sessionId: string): Promise<any> {
    return this.makeRequest(`/sessions/${sessionId}/stats/`);
  }

  // ============================
  // 🧠 FACE RECOGNITION (Legacy endpoints)
  // ============================

  async uploadFaceImage(studentId: number, imageFile: File): Promise<any> {
    const apiUrl = await this.getApiUrl();
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('student_id', studentId.toString());

    const response = await fetch(`${apiUrl}/register-student/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
      },
      body: formData,
    });
    
    return this.handleResponse(response, '/register-student/');
  }

  async recognizeFace(imageFile: File): Promise<any> {
    const apiUrl = await this.getApiUrl();
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${apiUrl}/recognize-face/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
      },
      body: formData,
    });
    
    return this.handleResponse(response, '/recognize-face/');
  }

  // ============================
  // 📊 DASHBOARD & ANALYTICS (Custom endpoints with fallbacks)
  // ============================

  async getDashboardStats(): Promise<any> {
    try {
      return await this.makeRequest('/dashboard/stats/');
    } catch (error) {
      console.warn('Dashboard stats endpoint not available, using mock data');
      return {
        total_students: 0,
        total_courses: 0,
        total_departments: 0,
        total_teachers: 0,
        active_sessions: 0,
        total_attendance_records: 0,
        todays_attendance_count: 0,
        todays_attendance_rate: 0,
        weekly_attendance_trend: [],
        recent_activities: []
      };
    }
  }

  async getDepartmentStats(): Promise<any> {
    try {
      return await this.makeRequest('/analytics/departments/');
    } catch (error) {
      console.warn('Department stats endpoint not available');
      return [];
    }
  }

  async getCourseStats(): Promise<any> {
    try {
      return await this.makeRequest('/analytics/courses/');
    } catch (error) {
      console.warn('Course stats endpoint not available');
      return [];
    }
  }

  async getTeacherStats(): Promise<any> {
    try {
      return await this.makeRequest('/analytics/teachers/');
    } catch (error) {
      console.warn('Teacher stats endpoint not available');
      return [];
    }
  }

  // ============================
  // 📚 ENROLLMENT MANAGEMENT (Custom endpoints)
  // ============================

  async manageStudentEnrollment(enrollmentData: any): Promise<any> {
    return this.makeRequest('/enrollment/student/', {
      method: 'POST',
      body: JSON.stringify(enrollmentData),
    });
  }

  async bulkEnrollment(bulkData: any): Promise<any> {
    return this.makeRequest('/enrollment/bulk/', {
      method: 'POST',
      body: JSON.stringify(bulkData),
    });
  }

  // ============================
  // ⚙️ SYSTEM MANAGEMENT (Custom endpoints)
  // ============================

  async getSystemStats(): Promise<any> {
    try {
      return await this.makeRequest('/system/stats/');
    } catch (error) {
      console.warn('System stats endpoint not available');
      return {};
    }
  }

  async getSystemSettings(): Promise<any> {
    try {
      return await this.makeRequest('/system/settings/');
    } catch (error) {
      console.warn('System settings endpoint not available');
      return {};
    }
  }

  async updateSystemSettings(settings: any): Promise<any> {
    return this.makeRequest('/system/settings/update/', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  async testEmailSettings(): Promise<any> {
    return this.makeRequest('/system/test-email/', {
      method: 'POST',
    });
  }

  async createSystemBackup(): Promise<any> {
    return this.makeRequest('/system/backup/create/', {
      method: 'POST',
    });
  }

  // ============================
  // 👥 ADMIN USER MANAGEMENT
  // ============================

  async getAdminUsers(): Promise<any[]> {
    try {
      return await this.makeRequest('/admin-users/');
    } catch (error) {
      console.warn('Admin users endpoint not available');
      return [];
    }
  }

  async createAdminUser(userData: any): Promise<any> {
    return this.makeRequest('/admin-users/create/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateAdminUser(userId: number, userData: any): Promise<any> {
    return this.makeRequest(`/admin-users/${userId}/`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteAdminUser(userId: number): Promise<any> {
    return this.makeRequest(`/admin-users/${userId}/delete/`, {
      method: 'DELETE',
    });
  }

  // ============================
  // 🔒 SECURITY MANAGEMENT
  // ============================

  async getUserActivities(filters: any = {}): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters.days) params.append('days', filters.days.toString());
      if (filters.user && filters.user !== 'all') params.append('user', filters.user);
      if (filters.action && filters.action !== 'all') params.append('action', filters.action);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      
      const queryString = params.toString();
      const url = queryString ? `/security/activities/?${queryString}` : '/security/activities/';
      
      return await this.makeRequest(url);
    } catch (error) {
      console.warn('User activities endpoint not available');
      return [];
    }
  }

  async getLoginAttempts(filters: any = {}): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filters.days) params.append('days', filters.days.toString());
      
      const queryString = params.toString();
      const url = queryString ? `/security/login-attempts/?${queryString}` : '/security/login-attempts/';
      
      return await this.makeRequest(url);
    } catch (error) {
      console.warn('Login attempts endpoint not available');
      return [];
    }
  }

  async getActiveSessions(): Promise<any[]> {
    try {
      return await this.makeRequest('/security/active-sessions/');
    } catch (error) {
      console.warn('Active sessions endpoint not available');
      return [];
    }
  }

  async getSecurityStatistics(): Promise<any> {
    try {
      return await this.makeRequest('/security/statistics/');
    } catch (error) {
      console.warn('Security statistics endpoint not available');
      return {};
    }
  }

  async getSecuritySettings(): Promise<any> {
    try {
      return await this.makeRequest('/security/settings/');
    } catch (error) {
      console.warn('Security settings endpoint not available');
      return {};
    }
  }

  async updateSecuritySettings(settings: any): Promise<any> {
    return this.makeRequest('/security/settings/update/', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  async terminateSession(sessionId: string): Promise<any> {
    return this.makeRequest(`/security/sessions/${sessionId}/terminate/`, {
      method: 'POST',
    });
  }

  // ============================
  // 📅 TIMETABLE MANAGEMENT (Matches your timetable URLs)
  // ============================

  async getTimetableEntries(): Promise<any> {
    return this.makeRequest('/api/timetable/entries/');
  }

  async createTimetableEntry(entryData: any): Promise<any> {
    return this.makeRequest('/api/timetable/entries/', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  }

  async getTimetableEntry(entryId: number): Promise<any> {
    return this.makeRequest(`/api/timetable/entries/${entryId}/`);
  }

  async updateTimetableEntry(entryId: number, entryData: any): Promise<any> {
    return this.makeRequest(`/api/timetable/entries/${entryId}/`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    });
  }

  async deleteTimetableEntry(entryId: number): Promise<any> {
    return this.makeRequest(`/api/timetable/entries/${entryId}/`, {
      method: 'DELETE',
    });
  }

  async getTimeSlots(): Promise<any> {
    return this.makeRequest('/api/timetable/timeslots/');
  }

  async getRooms(): Promise<any> {
    return this.makeRequest('/api/timetable/rooms/');
  }

  async getTimetableTeachers(): Promise<any> {
    return this.makeRequest('/api/timetable/teachers/');
  }

  async getTimetableCourses(): Promise<any> {
    return this.makeRequest('/api/timetable/courses/');
  }

  // ============================
  // 👤 HALL OF FACES (HOF) SYSTEM
  // ============================

  async detectFacesHOF(imageFile: File): Promise<any> {
    const apiUrl = await this.getApiUrl();
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${apiUrl}/api/faces/detect-hof/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
      },
      body: formData,
    });
    
    return this.handleResponse(response, '/api/faces/detect-hof/');
  }

  async getHOFSystemStatus(): Promise<any> {
    return this.makeRequest('/api/hof/status/');
  }

  // ============================
  // 🔍 UTILITY METHODS
  // ============================

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Check if user has specific permissions (if you implement this)
  async checkPermissions(permission: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user.permissions?.includes(permission) || user.is_superuser;
    } catch (error) {
      return false;
    }
  }

  // Debug method for troubleshooting user permissions
  async debugCurrentUser(): Promise<any> {
    try {
      const user = await this.getCurrentUser();
      console.log('🔍 Current User Debug Info:', {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_superuser: user.is_superuser,
        is_staff: user.is_staff,
        is_active: user.is_active,
        permissions: user.permissions || []
      });
      return user;
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      throw error;
    }
  }

  // ============================
  // 🏥 TEACHER-SPECIFIC METHODS
  // ============================

  async getTeacherCourses(teacherId: number): Promise<any[]> {
    try {
      // Get courses taught by a specific teacher
      const response = await this.getCourses({ teacher: teacherId });
      return response.results || response || [];
    } catch (error) {
      console.error(`❌ Error fetching courses for teacher ${teacherId}:`, error);
      return [];
    }
  }

  async getTeacherStudents(teacherId: number): Promise<any[]> {
    try {
      // Get all students enrolled in courses taught by this teacher
      const courses = await this.getTeacherCourses(teacherId);
      const allStudents: any[] = [];
      
      for (const course of courses) {
        const courseStudents = await this.getCourseStudents(course.id);
        allStudents.push(...courseStudents);
      }
      
      // Remove duplicates based on student ID
      const uniqueStudents = allStudents.filter((student, index, self) => 
        index === self.findIndex(s => s.id === student.id)
      );
      
      return uniqueStudents;
    } catch (error) {
      console.error(`❌ Error fetching students for teacher ${teacherId}:`, error);
      return [];
    }
  }

  // ============================
  // 📈 ENHANCED ANALYTICS METHODS
  // ============================

  async getAttendanceAnalytics(filters: {
    courseId?: number;
    studentId?: number;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<any> {
    try {
      const params = new URLSearchParams();
      
      if (filters.courseId) params.append('course_id', filters.courseId.toString());
      if (filters.studentId) params.append('student_id', filters.studentId.toString());
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      
      const queryString = params.toString();
      const url = queryString ? `/attendance/analytics/?${queryString}` : '/attendance/analytics/';
      
      return await this.makeRequest(url);
    } catch (error) {
      console.warn('Attendance analytics endpoint not available');
      return {
        total_records: 0,
        present_count: 0,
        absent_count: 0,
        late_count: 0,
        attendance_rate: 0,
        trend_data: []
      };
    }
  }

  async getCourseAttendanceRate(courseId: number): Promise<number> {
    try {
      const analytics = await this.getAttendanceAnalytics({ courseId });
      return analytics.attendance_rate || 0;
    } catch (error) {
      console.error(`❌ Error getting attendance rate for course ${courseId}:`, error);
      return 0;
    }
  }

  async getStudentAttendanceRate(studentId: number): Promise<number> {
    try {
      const analytics = await this.getAttendanceAnalytics({ studentId });
      return analytics.attendance_rate || 0;
    } catch (error) {
      console.error(`❌ Error getting attendance rate for student ${studentId}:`, error);
      return 0;
    }
  }

  // ============================
  // 🔧 BULK OPERATIONS
  // ============================

  async bulkMarkAttendance(attendanceRecords: Array<{
    student: number;
    course: number;
    status: string;
    notes?: string;
  }>): Promise<any> {
    try {
      const results = [];
      
      for (const record of attendanceRecords) {
        try {
          const result = await this.markAttendanceWithValidation(record);
          results.push({ success: true, record, result });
        } catch (error) {
          results.push({ success: false, record, error: error.message });
        }
      }
      
      return {
        total: attendanceRecords.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      console.error('❌ Error in bulk attendance marking:', error);
      throw error;
    }
  }

  async bulkEnrollStudentsInCourse(courseId: number, studentIds: number[]): Promise<any> {
    try {
      return await this.enrollStudentsInCourse(courseId, studentIds);
    } catch (error) {
      console.error(`❌ Error bulk enrolling students in course ${courseId}:`, error);
      throw error;
    }
  }

  // ============================
  // 🔍 SEARCH & FILTERING HELPERS
  // ============================

  async searchStudents(query: string, filters?: Record<string, any>): Promise<any[]> {
    try {
      const searchFilters = {
        search: query,
        ...filters
      };
      
      const response = await this.getStudents(searchFilters);
      return response.results || response || [];
    } catch (error) {
      console.error('❌ Error searching students:', error);
      return [];
    }
  }

  async searchCourses(query: string, filters?: Record<string, any>): Promise<any[]> {
    try {
      const searchFilters = {
        search: query,
        ...filters
      };
      
      const response = await this.getCourses(searchFilters);
      return response.results || response || [];
    } catch (error) {
      console.error('❌ Error searching courses:', error);
      return [];
    }
  }

  // ============================
  // 📱 MOBILE APP COMPATIBILITY
  // ============================

  async getMobileAppInfo(): Promise<any> {
    try {
      return await this.makeRequest('/mobile/app-info/');
    } catch (error) {
      console.warn('Mobile app info endpoint not available');
      return {
        version: '1.0.0',
        features: ['attendance', 'face_recognition'],
        status: 'active'
      };
    }
  }

  async syncMobileData(data: any): Promise<any> {
    try {
      return await this.makeRequest('/mobile/sync/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Mobile sync endpoint not available');
      return { success: false, message: 'Sync not available' };
    }
  }

  // ============================
  // 📊 REPORTING METHODS
  // ============================

  async generateAttendanceReport(filters: {
    courseId?: number;
    studentId?: number;
    startDate?: string;
    endDate?: string;
    format?: 'json' | 'csv' | 'pdf';
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      
      if (filters.courseId) params.append('course_id', filters.courseId.toString());
      if (filters.studentId) params.append('student_id', filters.studentId.toString());
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.format) params.append('format', filters.format);
      
      const queryString = params.toString();
      const url = `/reports/attendance/?${queryString}`;
      
      return await this.makeRequest(url);
    } catch (error) {
      console.warn('Attendance report endpoint not available');
      return null;
    }
  }

  async exportData(type: 'students' | 'courses' | 'attendance', format: 'csv' | 'xlsx' = 'csv'): Promise<any> {
    try {
      return await this.makeRequest(`/export/${type}/?format=${format}`);
    } catch (error) {
      console.warn(`Export ${type} endpoint not available`);
      return null;
    }
  }
}

// Export singleton instance
export const djangoApi = new DjangoApiService();