// Replace ALL content in src/services/timetableApi.ts with this:

const API_BASE_URL = 'http://localhost:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

export const timetableApi = {
  getTimetableEntries: async (filters: { 
    teacher_id?: number; 
    academic_year?: string; 
    semester?: number;
    level?: string;
    department?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const url = `${API_BASE_URL}/api/timetable/entries/?${queryParams}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  createTimetableEntry: async (entry: {
    course_id: number;
    teacher_id: number;
    time_slot_id: number;
    room_id: number;
    academic_year?: string;
    semester?: number;
    notes?: string;
  }) => {
    const url = `${API_BASE_URL}/api/timetable/entries/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(entry),
    });
    
    return handleResponse(response);
  },

  updateTimetableEntry: async (id: number, updates: any) => {
    const url = `${API_BASE_URL}/api/timetable/entries/${id}/`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    
    return handleResponse(response);
  },

  deleteTimetableEntry: async (id: number) => {
    const url = `${API_BASE_URL}/api/timetable/entries/${id}/`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  },

  getTimeSlots: async () => {
    const url = `${API_BASE_URL}/api/timetable/timeslots/`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  createTimeSlot: async (timeSlot: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    duration_minutes: number;
  }) => {
    const url = `${API_BASE_URL}/api/timetable/timeslots/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(timeSlot),
    });
    
    return handleResponse(response);
  },

  getRooms: async () => {
    const url = `${API_BASE_URL}/api/timetable/rooms/`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  createRoom: async (room: {
    name: string;
    capacity: number;
    building?: string;
    floor?: string;
    equipment?: string[];
  }) => {
    const url = `${API_BASE_URL}/api/timetable/rooms/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(room),
    });
    
    return handleResponse(response);
  },

  getTeachers: async () => {
    const url = `${API_BASE_URL}/api/timetable/teachers/`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  getCourses: async () => {
    const url = `${API_BASE_URL}/api/timetable/courses/`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  getAcademicLevels: async () => {
    const url = `${API_BASE_URL}/api/levels/`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  getCurrentSessions: async (teacherId?: number) => {
    return [];
  },

  getClassrooms: async () => {
    return timetableApi.getRooms();
  },
};