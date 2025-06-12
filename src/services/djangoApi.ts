// Django API service for FACE.IT application
// Handles all API calls to the Django backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

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
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    return response.json();
  }

  // ============================
  // 🔐 AUTH
  // ============================

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(res);
  }

  async logout() {
    const res = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: this.getHeaders(),
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

  async getAttendance(filters?: any) {
    const query = filters ? `?${new URLSearchParams(filters)}` : '';
    const res = await fetch(`${API_BASE_URL}/attendance/${query}`, {
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

  async updateAttendance(id: number, attendanceData: any) {
    const res = await fetch(`${API_BASE_URL}/attendance/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(attendanceData),
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
    return response.json();
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
}

export const djangoApi = new DjangoApiService();
