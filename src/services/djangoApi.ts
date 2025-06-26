// src/services/djangoApi.ts - Updated to match Django URL patterns

import { getApiBaseUrl, apiConfig } from '@/config/api';

class DjangoApiService {
  private apiBaseUrl: string | null = null;
  private initializationPromise: Promise<void> | null = null;
  private defaults: { headers: { common: { [key: string]: string } } } = {
    headers: {
      common: {},
    },
  };

  /**
   * Initialize the API service with auto-detected URL
   */
  private async initialize(): Promise<void> {
    if (this.apiBaseUrl) {
      return; // Already initialized
    }

    if (this.initializationPromise) {
      return this.initializationPromise; // Wait for ongoing initialization
    }

    this.initializationPromise = (async () => {
      try {
        console.log('🔧 Initializing Django API service...');
        this.apiBaseUrl = await getApiBaseUrl();
        console.log(`✅ Django API service initialized with URL: ${this.apiBaseUrl}`);
      } catch (error) {
        console.error('❌ Failed to initialize Django API service:', error);
        this.apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Get the current API base URL (with auto-initialization)
   */
  private async getApiUrl(): Promise<string> {
    await this.initialize();
    return this.apiBaseUrl!;
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  /**
   * Handle API responses with smart failure reporting
   */
  private async handleResponse(response: Response, endpoint?: string) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || `API Error: ${response.status}`;
      
      if (endpoint) {
        console.error(`❌ API Error at ${endpoint}:`, errorMessage);
      }
      
      // ✅ Report connection failures to trigger smart re-detection
      if (response.status >= 500 || response.status === 0 || response.status === 404) {
        console.log('📊 Reporting connection failure to auto-detection system');
        apiConfig.reportConnectionFailure();
      }
      
      throw new Error(errorMessage);
    }
    
    // ✅ Report successful connection
    apiConfig.reportConnectionSuccess();
    return response.json();
  }

  /**
   * Make an API request with smart retry logic
   */
  private async makeRequest(
    endpoint: string, 
    options: RequestInit = {},
    retryOnError: boolean = true
  ): Promise<any> {
    const apiUrl = await this.getApiUrl();
    const fullUrl = `${apiUrl}${endpoint}`;
    
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      return await this.handleResponse(response, endpoint);
    } catch (error) {
      // ✅ Only retry on specific failures and if we haven't retried yet
      if (retryOnError && error instanceof Error && this.shouldRetryRequest(error)) {
        console.log(`🔄 Request failed to ${endpoint}, checking if re-detection is needed...`);
        
        // Force re-detection if we've had too many failures
        const detectionStatus = apiConfig.getDetectionStatus();
        if (detectionStatus.shouldDetectNow) {
          try {
            console.log(`🔄 Re-detecting backend for retry...`);
            const newApiUrl = await apiConfig.forceRedetection();
            
            if (newApiUrl !== apiUrl) {
              console.log(`🔄 Retrying request with new URL: ${newApiUrl}`);
              this.apiBaseUrl = newApiUrl;
              
              // Retry the request once with new URL
              const newFullUrl = `${newApiUrl}${endpoint}`;
              const retryResponse = await fetch(newFullUrl, {
                ...options,
                headers: {
                  ...this.getHeaders(),
                  ...options.headers,
                },
              });
              
              return await this.handleResponse(retryResponse, endpoint);
            }
          } catch (retryError) {
            console.error('❌ Retry after re-detection also failed:', retryError);
          }
        }
      }
      
      throw error;
    }
  }

  /**
   * Determine if a request should be retried based on the error
   */
  private shouldRetryRequest(error: Error): boolean {
    const retryableErrors = [
      'fetch',
      'network',
      'connection',
      'timeout',
      'failed to fetch',
      'networkerror'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return retryableErrors.some(keyword => errorMessage.includes(keyword));
  }

  /**
   * Set the authentication token for API requests
   */
  setAuthToken(token: string | null) {
    if (token) {
      this.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('access_token', token);
    } else {
      delete this.defaults.headers.common['Authorization'];
      localStorage.removeItem('access_token');
    }
  }

  // ============================
  // 🔐 AUTHENTICATION (Updated to match Django URLs)
  // ============================

  /**
   * Login with username and password - Updated to use Django's auth/login/ endpoint
   */
  async login(username: string, password: string) {
    try {
      const apiUrl = await this.getApiUrl();
      const loginUrl = `${apiUrl}/auth/login/`;
      
      console.log('API Base URL:', apiUrl);
      console.log('Attempting login to:', loginUrl);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          password,
        }),
      });

      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('Login failed:', {
          status: response.status,
          statusText: response.statusText,
          response: responseData,
          url: loginUrl,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(
          responseData.detail || 
          responseData.message || 
          'Login failed. Please check your credentials.'
        );
      }

      console.log('Login successful, tokens received');
      return { data: responseData };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Token-based login - Updated to use Django's auth/login/ endpoint
   */
  async loginWithToken(username: string, password: string) {
    const data = await this.makeRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    // Store user data if it's included in the response
    if (data.user) {
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }
    
    return data;
  }

  /**
   * Get current user - Note: Django doesn't have this endpoint by default
   * You'll need to create a view for this or use the token refresh endpoint
   */
  async getCurrentUser() {
    try {
      // Try to get user data from stored token or localStorage
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        try {
          return JSON.parse(storedUserData);
        } catch (e) {
          console.error('Failed to parse stored user data:', e);
        }
      }
      
      // Fallback: decode JWT token if available
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return {
            id: payload.user_id,
            username: payload.username || 'User',
            email: payload.email || '',
            first_name: payload.first_name || '',
            last_name: payload.last_name || '',
            name: payload.name || 'User',
          };
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
      }
      
      throw new Error('No user data available');
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  async getCurrentUserWithToken() {
    return this.getCurrentUser();
  }

  /**
   * Logout - Updated for Django pattern
   */
  async logout() {
    try {
      // Clear tokens regardless of server response
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      delete this.defaults.headers.common['Authorization'];
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear tokens even if there's an error
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      delete this.defaults.headers.common['Authorization'];
      return false;
    }
  }

  async logoutWithToken() {
    return this.logout();
  }

  async updateCurrentUserProfile(updateData: any) {
    // Since there's no user update endpoint in your Django config,
    // we'll store it locally for now
    const currentData = await this.getCurrentUser();
    const updatedData = { ...currentData, ...updateData };
    localStorage.setItem('user_data', JSON.stringify(updatedData));
    return updatedData;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.makeRequest('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }

  // ============================
  // 👤 STUDENTS (Updated to match Django ViewSet patterns)
  // ============================

  async getStudents() {
    return this.makeRequest('/students/');
  }

  async createStudent(studentData: any) {
    return this.makeRequest('/students/', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id: number, studentData: any) {
    return this.makeRequest(`/students/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }
  
  async deleteStudent(id: number) {
    const apiUrl = await this.getApiUrl();
    const response = await fetch(`${apiUrl}/students/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return response.ok;
  }

  // ============================
  // 📆 ATTENDANCE (Updated to match Django ViewSet patterns)
  // ============================

  async getAttendance(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    return this.makeRequest(`/attendance/${query}`);
  }

  async markAttendance(attendanceData: any) {
    return this.makeRequest('/attendance/', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async updateAttendance(id: number, data: { status?: string; check_in?: string }) {
    return this.makeRequest(`/attendance/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAttendanceSummary() {
    // Using the legacy endpoint that exists in your Django URLs
    return this.makeRequest('/get-attendance/');
  }

  // ============================
  // 🧠 FACE RECOGNITION (Updated to match Django patterns)
  // ============================

  async uploadFaceImage(studentId: number, imageFile: File) {
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

  async recognizeFace(imageFile: File) {
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
  // 📊 DASHBOARD & ANALYTICS (Updated to match Django patterns)
  // ============================

  async getDashboardStats() {
    return this.makeRequest('/dashboard/stats/');
  }

  async getDepartmentStats() {
    return this.makeRequest('/analytics/departments/');
  }

  async getCourseStats() {
    return this.makeRequest('/analytics/courses/');
  }

  async getTeacherStats() {
    return this.makeRequest('/analytics/teachers/');
  }

  // ============================
  // 🏛️ ACADEMIC STRUCTURE (Updated to match Django ViewSet patterns)
  // ============================

  async getDepartments() {
    return this.makeRequest('/departments/');
  }

  async createDepartment(departmentData: any) {
    return this.makeRequest('/departments/', {
      method: 'POST',
      body: JSON.stringify(departmentData),
    });
  }

  async updateDepartment(id: number, departmentData: any) {
    return this.makeRequest(`/departments/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(departmentData),
    });
  }

  async deleteDepartment(id: number) {
    const apiUrl = await this.getApiUrl();
    const response = await fetch(`${apiUrl}/departments/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return response.ok;
  }

  async getSpecializations() {
    return this.makeRequest('/specializations/');
  }

  async createSpecialization(specializationData: any) {
    return this.makeRequest('/specializations/', {
      method: 'POST',
      body: JSON.stringify(specializationData),
    });
  }

  async updateSpecialization(id: number, specializationData: any) {
    return this.makeRequest(`/specializations/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(specializationData),
    });
  }

  async deleteSpecialization(id: number) {
    const apiUrl = await this.getApiUrl();
    const response = await fetch(`${apiUrl}/specializations/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return response.ok;
  }

  async getLevels() {
    return this.makeRequest('/levels/');
  }

  async createLevel(levelData: any) {
    return this.makeRequest('/levels/', {
      method: 'POST',
      body: JSON.stringify(levelData),
    });
  }

  async updateLevel(id: number, levelData: any) {
    return this.makeRequest(`/levels/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(levelData),
    });
  }

  async deleteLevel(id: number) {
    const apiUrl = await this.getApiUrl();
    const response = await fetch(`${apiUrl}/levels/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return response.ok;
  }

  async getCourses() {
    return this.makeRequest('/courses/');
  }

  async createCourse(courseData: any) {
    return this.makeRequest('/courses/', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id: number, courseData: any) {
    return this.makeRequest(`/courses/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id: number) {
    const apiUrl = await this.getApiUrl();
    const response = await fetch(`${apiUrl}/courses/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return response.ok;
  }

  // ============================
  // 📄 REPORTS
  // ============================

  async generateReport(reportType: string, filters: any) {
    // This would need to be implemented in Django
    return this.makeRequest(`/reports/${reportType}/`, {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // ============================
  // ⚙️ SYSTEM (Updated to match Django patterns)
  // ============================

  async getSystemStats() {
    return this.makeRequest('/system/stats/');
  }

  async getSystemHealth() {
    // Since this endpoint doesn't exist in Django, we'll use system stats as a health check
    return this.makeRequest('/system/stats/');
  }

  async getSystemSettings() {
    // This would need to be implemented in Django
    return this.makeRequest('/system/settings/');
  }

  async updateSystemSettings(settings: any) {
    // This would need to be implemented in Django
    return this.makeRequest('/system/settings/', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  async testEmailSettings() {
    // This would need to be implemented in Django
    return this.makeRequest('/system/email/test/', {
      method: 'POST',
    });
  }

  async createBackup() {
    // This would need to be implemented in Django
    return this.makeRequest('/system/backup/create/', {
      method: 'POST',
    });
  }

  // ============================
  // 📱 SESSION MANAGEMENT (Updated to match Django patterns)
  // ============================

  async startAttendanceSession(sessionData: any) {
    return this.makeRequest('/sessions/start/', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async endAttendanceSession(sessionData: any) {
    return this.makeRequest('/sessions/end/', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async sessionBasedAttendance(attendanceData: any) {
    return this.makeRequest('/attendance/checkin/', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async getSessionStats(sessionId: string) {
    return this.makeRequest(`/sessions/${sessionId}/stats/`);
  }

  // ============================
  // 📊 ENROLLMENT MANAGEMENT (Updated to match Django patterns)
  // ============================

  async manageStudentEnrollment(enrollmentData: any) {
    return this.makeRequest('/enrollment/student/', {
      method: 'POST',
      body: JSON.stringify(enrollmentData),
    });
  }

  async bulkEnrollment(bulkData: any) {
    return this.makeRequest('/enrollment/bulk/', {
      method: 'POST',
      body: JSON.stringify(bulkData),
    });
  }

  // ============================
  // 🚀 QUICK ACCESS (Updated to match Django patterns)
  // ============================

  async getQuickDepartments() {
    return this.makeRequest('/quick/departments/');
  }

  async getQuickSpecializations() {
    return this.makeRequest('/quick/specializations/');
  }

  async getQuickLevels() {
    return this.makeRequest('/quick/levels/');
  }

  async getQuickCourses() {
    return this.makeRequest('/quick/courses/');
  }

  // ============================
  // 🛡️ SECURITY DASHBOARD (Placeholder - would need Django implementation)
  // ============================

  async getUserActivities(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    // This would need to be implemented in Django
    return this.makeRequest(`/security/user-activities/${query}`);
  }

  async getLoginAttempts(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    // This would need to be implemented in Django
    return this.makeRequest(`/security/login-attempts/${query}`);
  }

  async getActiveSessions() {
    // This would need to be implemented in Django
    return this.makeRequest('/security/active-sessions/');
  }

  async terminateSession(sessionId: string) {
    // This would need to be implemented in Django
    return this.makeRequest(`/security/terminate-session/${sessionId}/`, {
      method: 'DELETE',
    });
  }

  async getSecuritySettings() {
    // This would need to be implemented in Django
    return this.makeRequest('/security/settings/');
  }

  async updateSecuritySettings(settings: any) {
    // This would need to be implemented in Django
    return this.makeRequest('/security/settings/update/', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  async exportActivityLog(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    const apiUrl = await this.getApiUrl();
    
    // This would need to be implemented in Django
    const response = await fetch(`${apiUrl}/security/export/activity-log/${query}`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    
    return response.blob();
  }

  async getSecurityStatistics(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    // This would need to be implemented in Django
    return this.makeRequest(`/security/statistics/${query}`);
  }

  // ============================
  // 👨‍💼 ADMIN USERS (Placeholder - would need Django implementation)
  // ============================

  async getAdminUsers() {
    // This would need to be implemented in Django
    return this.makeRequest('/admin-users/');
  }

  async createAdminUser(userData: any) {
    // This would need to be implemented in Django
    return this.makeRequest('/admin-users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateAdminUser(id: number, userData: any) {
    // This would need to be implemented in Django
    return this.makeRequest(`/admin-users/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteAdminUser(id: number) {
    const apiUrl = await this.getApiUrl();
    // This would need to be implemented in Django
    const response = await fetch(`${apiUrl}/admin-users/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return response.ok;
  }

  // ============================
  // 🔧 UTILITY METHODS
  // ============================

  /**
   * Get current API configuration info
   */
  async getApiInfo() {
    await this.initialize();
    return {
      currentUrl: this.apiBaseUrl,
      detectionStatus: apiConfig.getDetectionStatus(),
      possibleEndpoints: apiConfig.getPossibleEndpoints(),
    };
  }

  /**
   * Force re-detection of Django backend
   */
  async reconnect() {
    console.log('🔄 Forcing Django backend reconnection...');
    this.apiBaseUrl = null;
    this.initializationPromise = null;
    await apiConfig.forceRedetection();
    return this.initialize();
  }

  /**
   * Check if API is currently connected (lightweight check)
   */
  async isConnected(): Promise<boolean> {
    try {
      // ✅ Use a lightweight endpoint check
      await this.getSystemStats();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const djangoApi = new DjangoApiService();