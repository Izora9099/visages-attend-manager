// src/services/djangoApi.ts - Optimized version with failure reporting

import { getApiBaseUrl, apiConfig } from '@/config/api';

class DjangoApiService {
  private apiBaseUrl: string | null = null;
  private initializationPromise: Promise<void> | null = null;

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

  // ============================
  // 🔐 AUTH
  // ============================

  async login(username: string, password: string) {
    const data = await this.makeRequest('/auth/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    // Store user data if it's included in the response
    if (data.user) {
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }
    
    return data;
  }

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      const data = await this.makeRequest('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      }, false); // Don't retry logout requests
      
      return data;
    } catch (error) {
      console.warn('Logout API call failed, but continuing with local logout:', error);
      return { success: true, message: 'Logged out locally' };
    }
  }

  async getCurrentUser() {
    try {
      const data = await this.makeRequest('/auth/user/');
      
      // Store user data for future use
      localStorage.setItem('user_data', JSON.stringify(data));
      
      return data;
    } catch (error) {
      // Fallback: try to get user data from localStorage
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        try {
          return JSON.parse(storedUserData);
        } catch (e) {
          console.error('Failed to parse stored user data:', e);
        }
      }
      
      // Ultimate fallback: decode JWT token
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
            name: payload.name || 'Admin User',
          };
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
      }
      
      throw error;
    }
  }

  async updateCurrentUserProfile(updateData: any) {
    const data = await this.makeRequest('/auth/user/', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    
    // Update stored user data
    localStorage.setItem('user_data', JSON.stringify(data));
    
    return data;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.makeRequest('/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }

  // ============================
  // 👤 STUDENTS
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
  // 📆 ATTENDANCE
  // ============================

  async getAttendance(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    return this.makeRequest(`/attendance-records/${query}`);
  }

  async markAttendance(attendanceData: any) {
    return this.makeRequest('/attendance/', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async updateAttendance(id: number, data: { status?: string; check_in?: string }) {
    return this.makeRequest(`/attendance-records/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAttendanceSummary() {
    return this.makeRequest('/attendance-summary/');
  }

  // ============================
  // 🧠 FACE RECOGNITION
  // ============================

  async uploadFaceImage(studentId: number, imageFile: File) {
    const apiUrl = await this.getApiUrl();
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('student_id', studentId.toString());

    const response = await fetch(`${apiUrl}/face-recognition/upload/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
      },
      body: formData,
    });
    
    return this.handleResponse(response, '/face-recognition/upload/');
  }

  async recognizeFace(imageFile: File) {
    const apiUrl = await this.getApiUrl();
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${apiUrl}/face-recognition/recognize/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
      },
      body: formData,
    });
    
    return this.handleResponse(response, '/face-recognition/recognize/');
  }

  // ============================
  // 📄 REPORTS
  // ============================

  async generateReport(reportType: string, filters: any) {
    return this.makeRequest(`/reports/${reportType}/`, {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  // ============================
  // 👨‍💼 ADMIN USERS
  // ============================

  async getAdminUsers() {
    return this.makeRequest('/admin-users/');
  }

  async createAdminUser(userData: any) {
    return this.makeRequest('/admin-users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateAdminUser(id: number, userData: any) {
    return this.makeRequest(`/admin-users/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteAdminUser(id: number) {
    const apiUrl = await this.getApiUrl();
    const response = await fetch(`${apiUrl}/admin-users/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return response.ok;
  }

  // ============================
  // 🛡️ SECURITY DASHBOARD
  // ============================

  async getUserActivities(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    return this.makeRequest(`/security/user-activities/${query}`);
  }

  async getLoginAttempts(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    return this.makeRequest(`/security/login-attempts/${query}`);
  }

  async getActiveSessions() {
    return this.makeRequest('/security/active-sessions/');
  }

  async terminateSession(sessionId: string) {
    return this.makeRequest(`/security/terminate-session/${sessionId}/`, {
      method: 'DELETE',
    });
  }

  async getSecuritySettings() {
    return this.makeRequest('/security/settings/');
  }

  async updateSecuritySettings(settings: any) {
    return this.makeRequest('/security/settings/update/', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  async exportActivityLog(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    const apiUrl = await this.getApiUrl();
    
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
    return this.makeRequest(`/security/statistics/${query}`);
  }

  // ============================
  // ⚙️ SYSTEM SETTINGS
  // ============================

  async getSystemSettings() {
    return this.makeRequest('/api/system/settings/');
  }

  async updateSystemSettings(settings: any) {
    return this.makeRequest('/api/system/settings/update/', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  }

  async getSystemStats() {
    return this.makeRequest('/api/system/stats/');
  }

  async testEmailSettings() {
    return this.makeRequest('/api/system/email/test/', {
      method: 'POST',
    });
  }

  async createBackup() {
    return this.makeRequest('/api/system/backup/create/', {
      method: 'POST',
    });
  }

  async getSystemHealth() {
    return this.makeRequest('/api/system/health/');
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
      await this.getSystemHealth();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const djangoApi = new DjangoApiService();