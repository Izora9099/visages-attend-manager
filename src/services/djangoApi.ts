
// Django API service for FACE.IT application
// This file contains all the API calls that will interact with Django backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class DjangoApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  }

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return response.json();
  }

  // Student management endpoints
  async getStudents() {
    const response = await fetch(`${API_BASE_URL}/students/`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async createStudent(studentData: any) {
    const response = await fetch(`${API_BASE_URL}/students/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(studentData),
    });
    return response.json();
  }

  async updateStudent(id: number, studentData: any) {
    const response = await fetch(`${API_BASE_URL}/students/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(studentData),
    });
    return response.json();
  }

  async deleteStudent(id: number) {
    const response = await fetch(`${API_BASE_URL}/students/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return response.ok;
  }

  // Attendance endpoints
  async getAttendance(filters?: any) {
    const queryParams = filters ? `?${new URLSearchParams(filters)}` : '';
    const response = await fetch(`${API_BASE_URL}/attendance/${queryParams}`, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async markAttendance(attendanceData: any) {
    const response = await fetch(`${API_BASE_URL}/attendance/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(attendanceData),
    });
    return response.json();
  }

  async updateAttendance(id: number, attendanceData: any) {
    const response = await fetch(`${API_BASE_URL}/attendance/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(attendanceData),
    });
    return response.json();
  }

  // Facial recognition endpoints
  async uploadFaceImage(studentId: number, imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('student_id', studentId.toString());

    const response = await fetch(`${API_BASE_URL}/face-recognition/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: formData,
    });
    return response.json();
  }

  async recognizeFace(imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/face-recognition/recognize/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: formData,
    });
    return response.json();
  }

  // Reports endpoints
  async generateReport(reportType: string, filters: any) {
    const response = await fetch(`${API_BASE_URL}/reports/${reportType}/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(filters),
    });
    return response.json();
  }

  // Admin users endpoints
  async getAdminUsers() {
    const response = await fetch(`${API_BASE_URL}/admin-users/`, {
      headers: this.getHeaders(),
    });
    return response.json();
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
    const response = await fetch(`${API_BASE_URL}/admin-users/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return response.json();
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
