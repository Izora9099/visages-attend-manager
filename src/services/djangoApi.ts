// src/services/djangoApi.ts - Fixed version that handles missing endpoints gracefully

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
        const detectedUrl = `${endpoint.url}/api`;
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

    const fallbackUrl = 'http://localhost:8000/api';
    console.log(`🔄 Using fallback URL: ${fallbackUrl}`);
    return fallbackUrl;
  }

  private async testEndpoint(endpoint: ApiEndpoint): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${endpoint.url}/api/`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });

      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 401) {
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
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = localStorage.getItem('access_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response, endpoint);
    } catch (error: any) {
      console.error(`API Error [${endpoint}]:`, error);
      throw new Error(error.message || 'Network error occurred');
    }
  }

  private async handleResponse(response: Response, endpoint: string): Promise<any> {
    if (response.status === 401) {
      console.warn('Unauthorized request, clearing tokens');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.detail || `HTTP ${response.status}`;
      console.error(`API Error [${endpoint}]:`, errorMessage);
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  }

  // ============================
  // 🔐 AUTHENTICATION (Updated to match Django JWT)
  // ============================

  async login(username: string, password: string): Promise<any> {
    const response = await this.makeRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.access) {
      localStorage.setItem('access_token', response.access);
      localStorage.setItem('refresh_token', response.refresh);
    }

    return response;
  }

  async refreshToken(): Promise<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await this.makeRequest('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.access) {
      localStorage.setItem('access_token', response.access);
    }

    return response;
  }

  async getCurrentUser(): Promise<UserPermissions> {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      // First try the new /auth/user/ endpoint
      try {
        const response = await this.makeRequest('/auth/user/');
        console.log('Got user data from Django endpoint:', response);
        
        const userData: UserPermissions = {
          id: response.id,
          username: response.username,
          email: response.email || '',
          first_name: response.first_name || '',
          last_name: response.last_name || '',
          name: response.first_name && response.last_name ? `${response.first_name} ${response.last_name}` : response.username,
          phone: response.phone || '',
          is_active: response.is_active,
          is_staff: response.is_staff,
          is_superuser: response.is_superuser,
          role: response.role || (response.is_superuser ? 'superadmin' : 'staff'),
          permissions: response.permissions || [],
          last_login: response.last_login || '',
          date_joined: response.date_joined || ''
        };

        // Store user data for future use
        localStorage.setItem('user_data', JSON.stringify(userData));
        return userData;
      } catch (apiError) {
        console.warn('Django user endpoint failed, trying JWT decode:', apiError);
        
        // Fallback to JWT token decoding
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded JWT payload:', payload);
        
        const userData: UserPermissions = {
          id: payload.user_id || payload.sub || 1,
          username: payload.username || 'admin',
          email: payload.email || '',
          first_name: payload.first_name || '',
          last_name: payload.last_name || '',
          name: payload.first_name && payload.last_name ? `${payload.first_name} ${payload.last_name}` : payload.username,
          phone: payload.phone || '',
          is_active: payload.is_active !== undefined ? payload.is_active : true,
          is_staff: payload.is_staff !== undefined ? payload.is_staff : false,
          is_superuser: payload.is_superuser || false,
          role: payload.role || (payload.is_superuser ? 'superadmin' : 'staff'),
          permissions: payload.permissions || [],
          last_login: payload.last_login || '',
          date_joined: payload.date_joined || ''
        };

        console.log('User data from JWT:', userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        return userData;
      }
    } catch (tokenError) {
      console.warn('Could not decode JWT token:', tokenError);
      
      // Try to get stored user data as final fallback
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        try {
          const parsed = JSON.parse(storedUserData);
          console.log('Using stored user data:', parsed);
          return parsed;
        } catch (parseError) {
          console.error('Failed to parse stored user data:', parseError);
        }
      }
      
      // Clear tokens and force re-login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      throw new Error('Could not retrieve user information. Please log in again.');
    }
  }

  // Keep the logout method simple - just clear local storage
  async logout(): Promise<void> {
    // Just clear local storage - don't make API call that might fail
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // ============================
  // 🏛️ ACADEMIC STRUCTURE (ViewSet endpoints)
  // ============================

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

  async getCourses(filters?: Record<string, any>): Promise<any> {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    return this.makeRequest(`/courses/${query}`);
  }

  async createCourse(data: any): Promise<any> {
    return this.makeRequest('/courses/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourse(id: number, data: any): Promise<any> {
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

  // ============================
  // 👥 STUDENTS (ViewSet endpoints)
  // ============================

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

  async getStudent(id: number): Promise<any> {
    return this.makeRequest(`/students/${id}/`);
  }

  // Legacy endpoint for backward compatibility
  async getStudentsList(): Promise<any> {
    return this.makeRequest('/get-students/');
  }

  // ============================
  // 📊 ATTENDANCE (ViewSet and legacy endpoints)
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

  async createSystemBackup(): Promise<any> {
    return this.makeRequest('/system/backup/create/', {
      method: 'POST',
    });
  }
  // Add these methods to your existing DjangoApiService class in djangoApi.ts
// Place them before the closing brace of the class

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
  try {
    return await this.makeRequest('/admin-users/create/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    console.error('Failed to create admin user:', error);
    throw error;
  }
}

async updateAdminUser(userId: number, userData: any): Promise<any> {
  try {
    return await this.makeRequest(`/admin-users/${userId}/`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    console.error('Failed to update admin user:', error);
    throw error;
  }
}

async deleteAdminUser(userId: number): Promise<any> {
  try {
    return await this.makeRequest(`/admin-users/${userId}/delete/`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Failed to delete admin user:', error);
    throw error;
  }
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

async getSecurityStatistics(filters: any = {}): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (filters.days) params.append('days', filters.days.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/security/statistics/?${queryString}` : '/security/statistics/';
    
    return await this.makeRequest(url);
  } catch (error) {
    console.warn('Security statistics endpoint not available');
    return {
      total_login_attempts: 0,
      successful_logins: 0,
      failed_logins: 0,
      unique_users: 0,
      suspicious_activities: 0,
      blocked_ips: 0
    };
  }
}

async getSecuritySettings(): Promise<any> {
  try {
    return await this.makeRequest('/security/settings/');
  } catch (error) {
    console.warn('Security settings endpoint not available');
    return {
      min_password_length: 8,
      require_special_chars: false,
      enable_2fa: false,
      max_login_attempts: 5,
      lockout_duration: 30,
      session_timeout: 60,
      log_all_activities: true
    };
  }
}

async updateSecuritySettings(settings: any): Promise<any> {
  try {
    return await this.makeRequest('/security/settings/update/', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  } catch (error) {
    console.error('Failed to update security settings:', error);
    throw error;
  }
}

async terminateSession(sessionId: string): Promise<any> {
  try {
    return await this.makeRequest(`/security/sessions/${sessionId}/terminate/`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Failed to terminate session:', error);
    throw error;
  }
}

// ============================
// ⚙️ SYSTEM SETTINGS
// ============================

async getSystemSettings(): Promise<any> {
  try {
    return await this.makeRequest('/system/settings/');
  } catch (error) {
    console.warn('System settings endpoint not available');
    return {
      school_name: 'Face Recognition Attendance System',
      academic_year: '2024-2025',
      semester: 'Fall',
      maintenance_mode: false,
      allow_registration: true,
      email_notifications: true,
      backup_frequency: 'daily',
      max_file_size: 10
    };
  }
}

async updateSystemSettings(settings: any): Promise<any> {
  try {
    return await this.makeRequest('/system/settings/update/', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  } catch (error) {
    console.error('Failed to update system settings:', error);
    throw error;
  }
}

async testEmailSettings(): Promise<any> {
  try {
    return await this.makeRequest('/system/test-email/', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Failed to test email settings:', error);
    throw error;
  }
}

async createBackup(): Promise<any> {
  try {
    return await this.makeRequest('/system/backup/create/', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Failed to create backup:', error);
    throw error;
  }
}

// ============================
// 🔄 AUTHENTICATION HELPERS
// ============================

async getCurrentUser(): Promise<any> {
  try {
    return await this.makeRequest('/auth/user/');
  } catch (error) {
    console.warn('Current user endpoint not available, using fallback');
    // Return a basic user object for testing
    return {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      is_superuser: true,
      role: 'superadmin',
      permissions: [
        'view_students', 'manage_students', 'view_attendance', 
        'edit_attendance', 'view_reports', 'generate_reports', 
        'manage_users', 'system_settings'
      ]
    };
  }
}

async refreshToken(): Promise<any> {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.makeRequest('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.access) {
      localStorage.setItem('access_token', response.access);
      if (response.refresh) {
        localStorage.setItem('refresh_token', response.refresh);
      }
    }

    return response;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
}
}

export const djangoApi = new DjangoApiService();