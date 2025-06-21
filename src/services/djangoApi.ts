// Django API service for FACE.IT application
// Updated to work with your existing Django backend structure

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.111:8000/api';

class DjangoApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `API Error: ${response.status}`);
    }
    return response.json();
  }

  // ============================
  // 🔐 AUTH
  // ============================

  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await this.handleResponse(res);
    
    // Store user data if it's included in the response
    if (data.user) {
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }
    
    return data;
  }

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      const res = await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ 
          refresh_token: refreshToken 
        }),
      });
      
      if (res.ok) {
        return await this.handleResponse(res);
      }
      
      return { success: true, message: 'Logged out locally' };
    } catch (error) {
      console.warn('Logout API call failed, but continuing with local logout:', error);
      return { success: true, message: 'Logged out locally' };
    }
  }

  // Get current authenticated user
  async getCurrentUser() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/user/`, {
        headers: this.getHeaders(),
      });
      
      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Store user data for future use
      localStorage.setItem('user_data', JSON.stringify(data));
      
      return data;
    } catch (error) {
      // Fallback: try to get user data from localStorage (from login response)
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

  // Update current user profile
  async updateCurrentUserProfile(updateData: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/user/`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Failed to update profile: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Update stored user data
      localStorage.setItem('user_data', JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const res = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    return this.handleResponse(res);
  }

  // ============================
  // 👤 STUDENTS
  // ============================

  async getStudents() {
    const res = await fetch(`${API_BASE_URL}/students/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async createStudent(studentData: any) {
    const res = await fetch(`${API_BASE_URL}/students/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(studentData),
    });
    return this.handleResponse(res);
  }

  async updateStudent(id: number, studentData: any) {
    const res = await fetch(`${API_BASE_URL}/students/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(studentData),
    });
    return this.handleResponse(res);
  }
  
  async deleteStudent(id: number) {
    const res = await fetch(`${API_BASE_URL}/students/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.ok;
  }

  // ============================
  // 📆 ATTENDANCE
  // ============================

  // GET attendance records
  async getAttendance(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/attendance-records/${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async markAttendance(attendanceData: any) {
    const res = await fetch(`${API_BASE_URL}/attendance/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(attendanceData),
    });
    return this.handleResponse(res);
  }

  // PUT update attendance
  async updateAttendance(id: number, data: { status?: string; check_in?: string }) {
    const res = await fetch(`${API_BASE_URL}/attendance-records/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(res);
  }

  async getAttendanceSummary() {
    const res = await fetch(`${API_BASE_URL}/attendance-summary/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  // ============================
  // 🧠 FACE RECOGNITION
  // ============================

  async uploadFaceImage(studentId: number, imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('student_id', studentId.toString());

    const res = await fetch(`${API_BASE_URL}/face-recognition/upload/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
      },
      body: formData,
    });
    return this.handleResponse(res);
  }

  async recognizeFace(imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const res = await fetch(`${API_BASE_URL}/face-recognition/recognize/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
      },
      body: formData,
    });
    return this.handleResponse(res);
  }

  // ============================
  // 📄 REPORTS
  // ============================

  async generateReport(reportType: string, filters: any) {
    const res = await fetch(`${API_BASE_URL}/reports/${reportType}/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(filters),
    });
    return this.handleResponse(res);
  }

  // ============================
  // 👨‍💼 ADMIN USERS
  // ============================

  async getAdminUsers() {
    const response = await fetch(`${API_BASE_URL}/admin-users/`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    console.log("🧪 Raw response:", text);
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("❌ Failed to parse JSON:", e);
      throw new Error("Response is not valid JSON");
    }
  }

  async createAdminUser(userData: any) {
    const response = await fetch(`${API_BASE_URL}/admin-users/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async updateAdminUser(id: number, userData: any) {
    const res = await fetch(`${API_BASE_URL}/admin-users/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(res);
  }

  async deleteAdminUser(id: number) {
    const response = await fetch(`${API_BASE_URL}/admin-users/${id}/`, {
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
    const res = await fetch(`${API_BASE_URL}/security/user-activities/${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async getLoginAttempts(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/security/login-attempts/${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async getActiveSessions() {
    const res = await fetch(`${API_BASE_URL}/security/active-sessions/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async terminateSession(sessionId: string) {
    const res = await fetch(`${API_BASE_URL}/security/terminate-session/${sessionId}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async getSecuritySettings() {
    const res = await fetch(`${API_BASE_URL}/security/settings/`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }

  async updateSecuritySettings(settings: any) {
    const res = await fetch(`${API_BASE_URL}/security/settings/update/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(settings),
    });
    return this.handleResponse(res);
  }

  async exportActivityLog(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/security/export/activity-log/${query}`, {
      headers: this.getHeaders(),
    });
    
    if (!res.ok) {
      throw new Error(`Export failed: ${res.status}`);
    }
    
    return res.blob(); // Return blob for file download
  }

  async getSecurityStatistics(filters?: Record<string, any>) {
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/security/statistics/${query}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(res);
  }
}


export const getSystemSettings = async () => {
  const response = await apiClient.get('/api/system/settings/');
  return response.data;
};

export const updateSystemSettings = async (settings: any) => {
  const response = await apiClient.post('/api/system/settings/update/', settings);
  return response.data;
};

export const getSystemStats = async () => {
  const response = await apiClient.get('/api/system/stats/');
  return response.data;
};

export const testEmailSettings = async () => {
  const response = await apiClient.post('/api/system/email/test/');
  return response.data;
};

export const createBackup = async () => {
  const response = await apiClient.post('/api/system/backup/create/');
  return response.data;
};

export const getSystemHealth = async () => {
  const response = await apiClient.get('/api/system/health/');
  return response.data;
};

export const djangoApi = new DjangoApiService();