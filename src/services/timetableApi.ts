// src/services/timetableApi.ts - Updated to match your Django URLs

import { djangoApi } from './djangoApi';

// Get API base URL from the main Django API service
const getApiBaseUrl = async (): Promise<string> => {
  return await djangoApi.getApiUrl();
};

// Get auth headers with token
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Handle API responses
const handleResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
    } catch (jsonError) {
      // If response is not JSON, keep the default error message
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
};

// Timetable API service that uses your exact Django URL structure
export const timetableApi = {
  // ============================
  // 📅 TIMETABLE ENTRIES (Matches /api/timetable/entries/)
  // ============================
  
  getEntries: async (filters?: Record<string, any>) => {
    const apiUrl = await getApiBaseUrl();
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    const url = `${apiUrl}/api/timetable/entries/${query}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  createEntry: async (entry: {
    course_id: number;
    teacher_id?: number;
    room_id?: number;
    time_slot_id: number;
    day_of_week: string;
    start_time: string;
    end_time: string;
    academic_year?: string;
    semester?: string;
  }) => {
    const apiUrl = await getApiBaseUrl();
    const url = `${apiUrl}/api/timetable/entries/`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(entry),
    });
    
    return handleResponse(response);
  },

  getEntry: async (entryId: number) => {
    const apiUrl = await getApiBaseUrl();
    const url = `${apiUrl}/api/timetable/entries/${entryId}/`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  updateEntry: async (entryId: number, entry: {
    course_id?: number;
    teacher_id?: number;
    room_id?: number;
    time_slot_id?: number;
    day_of_week?: string;
    start_time?: string;
    end_time?: string;
    academic_year?: string;
    semester?: string;
  }) => {
    const apiUrl = await getApiBaseUrl();
    const url = `${apiUrl}/api/timetable/entries/${entryId}/`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(entry),
    });
    
    return handleResponse(response);
  },

  deleteEntry: async (entryId: number) => {
    const apiUrl = await getApiBaseUrl();
    const url = `${apiUrl}/api/timetable/entries/${entryId}/`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // ============================
  // 🕐 TIME SLOTS (Matches /api/timetable/timeslots/)
  // ============================
  
  getTimeSlots: async () => {
    const apiUrl = await getApiBaseUrl();
    const url = `${apiUrl}/api/timetable/timeslots/`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  createTimeSlot: async (timeSlot: {
    name: string;
    start_time: string;
    end_time: string;
    description?: string;
  }) => {
    const apiUrl = await getApiBaseUrl();
    const url = `${apiUrl}/api/timetable/timeslots/`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(timeSlot),
    });
    
    return handleResponse(response);
  },

  updateTimeSlot: async (timeSlotId: number, timeSlot: {
    name?: string;
    start_time?: string;
    end_time?: string;
    description?: string;
  }) => {
    const apiUrl = await getApiBaseUrl();
    const url = `${apiUrl}/api/timetable/timeslots/${timeSlotId}/`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(timeSlot),
    });
    
    return handleResponse(response);
  },

  deleteTimeSlot: async (timeSlotId: number) => {
    const apiUrl = await getApiBaseUrl();
    const url = `${apiUrl}/api/timetable/timeslots/${timeSlotId}/`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // ============================
  // 🏢 ROOMS (Matches /api/timetable/rooms/)
  // ============================
  
  getRooms: async (filters?: Record<string, any>) => {
    const apiUrl = await getApiBaseUrl();
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    const url = `${apiUrl}/api/timetable/rooms/${query}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  createRoom: async (room: {
    name: string;
    code?: string;
    capacity?: number;
    room_type?: string;
    building?: string;
    floor?: string;
    equipment?: string[];
  }) => {
    const apiUrl = await getApiBaseUrl();
    const url = `${apiUrl}/api/timetable/rooms/`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(room),
    });
    
    return handleResponse(response);
  },

  updateRoom: async (roomId: number, room: {
    name?: string;
    code?: string;
    capacity?: number;
    room_type?: string;
    building?: string;
    floor?: string;
    equipment?: string[];
  }) => {
    const apiUrl = await getApiBaseUrl();
    const url = `${apiUrl}/api/timetable/rooms/${roomId}/`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(room),
    });
    
    return handleResponse(response);
  },

  deleteRoom: async (roomId: number) => {
    const apiUrl = await getApiBaseUrl();
    const url = `${apiUrl}/api/timetable/rooms/${roomId}/`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // ============================
  // 👨‍🏫 TEACHERS (Matches /api/timetable/teachers/)
  // ============================
  
  getTeachers: async (filters?: Record<string, any>) => {
    const apiUrl = await getApiBaseUrl();
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    const url = `${apiUrl}/api/timetable/teachers/${query}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // ============================
  // 📚 COURSES (Matches /api/timetable/courses/)
  // ============================
  
  getCourses: async (filters?: Record<string, any>) => {
    const apiUrl = await getApiBaseUrl();
    const query = filters ? `?${new URLSearchParams(filters).toString()}` : "";
    const url = `${apiUrl}/api/timetable/courses/${query}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // ============================
  // 🎓 ACADEMIC LEVELS (Uses main API - /levels/)
  // ============================
  
  getAcademicLevels: async () => {
    // This uses the main djangoApi service since it's part of the core academic structure
    return djangoApi.getLevels();
  },

  // ============================
  // 📊 TIMETABLE ANALYTICS & UTILITIES
  // ============================
  
  getCurrentSessions: async (teacherId?: number) => {
    const apiUrl = await getApiBaseUrl();
    let url = `${apiUrl}/api/timetable/entries/`;
    
    // Filter for current day and time
    const now = new Date();
    const currentDay = now.toLocaleLowerCase().split('').slice(0, 3).join(''); // e.g., 'mon', 'tue'
    const currentTime = now.toTimeString().slice(0, 5); // e.g., '14:30'
    
    const params = new URLSearchParams({
      day_of_week: currentDay,
      current_time: currentTime,
      ...(teacherId && { teacher_id: teacherId.toString() }),
    });
    
    url += `?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  getClassrooms: async () => {
    // Alias for getRooms to maintain compatibility
    return timetableApi.getRooms();
  },

  // Get timetable for specific date range
  getTimetableByDateRange: async (startDate: string, endDate: string, filters?: Record<string, any>) => {
    const apiUrl = await getApiBaseUrl();
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      ...filters,
    });
    
    const url = `${apiUrl}/api/timetable/entries/?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get conflicts in timetable
  getConflicts: async () => {
    const apiUrl = await getApiBaseUrl();
    const url = `${apiUrl}/api/timetable/entries/?check_conflicts=true`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get teacher's schedule
  getTeacherSchedule: async (teacherId: number, week?: string) => {
    const apiUrl = await getApiBaseUrl();
    const params = new URLSearchParams({
      teacher_id: teacherId.toString(),
      ...(week && { week }),
    });
    
    const url = `${apiUrl}/api/timetable/entries/?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get room schedule
  getRoomSchedule: async (roomId: number, week?: string) => {
    const apiUrl = await getApiBaseUrl();
    const params = new URLSearchParams({
      room_id: roomId.toString(),
      ...(week && { week }),
    });
    
    const url = `${apiUrl}/api/timetable/entries/?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // Get course schedule
  getCourseSchedule: async (courseId: number, week?: string) => {
    const apiUrl = await getApiBaseUrl();
    const params = new URLSearchParams({
      course_id: courseId.toString(),
      ...(week && { week }),
    });
    
    const url = `${apiUrl}/api/timetable/entries/?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },
};

export default timetableApi;