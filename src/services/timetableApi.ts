// Timetable API service with dummy data
import { Course, TimeSlot, Room, TimetableEntry, AcademicLevel, SessionInfo } from '@/types/timetable';

// Dummy data
const DUMMY_COURSES: Course[] = [
  {
    id: 1,
    code: 'CSC101',
    name: 'Introduction to Computer Science',
    credits: 3,
    department: 'Computer Science',
    level: '100',
    description: 'Basic concepts of computer science',
    prerequisites: [],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    code: 'MTH201',
    name: 'Calculus I',
    credits: 4,
    department: 'Mathematics',
    level: '200',
    description: 'Differential calculus',
    prerequisites: ['MTH101'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    code: 'PHY301',
    name: 'Quantum Physics',
    credits: 3,
    department: 'Physics',
    level: '300',
    description: 'Introduction to quantum mechanics',
    prerequisites: ['PHY201', 'MTH201'],
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const DUMMY_TIMESLOTS: TimeSlot[] = [
  { id: 1, day_of_week: 0, start_time: '08:00', end_time: '10:00', duration_minutes: 120 },
  { id: 2, day_of_week: 0, start_time: '10:30', end_time: '12:30', duration_minutes: 120 },
  { id: 3, day_of_week: 1, start_time: '08:00', end_time: '10:00', duration_minutes: 120 },
  { id: 4, day_of_week: 1, start_time: '14:00', end_time: '16:00', duration_minutes: 120 },
  { id: 5, day_of_week: 2, start_time: '08:00', end_time: '10:00', duration_minutes: 120 },
];

const DUMMY_ROOMS: Room[] = [
  {
    id: 1,
    name: 'Room A101',
    capacity: 50,
    building: 'Academic Block A',
    equipment: ['Projector', 'Whiteboard', 'Sound System'],
    is_available: true
  },
  {
    id: 2,
    name: 'Lab B201',
    capacity: 30,
    building: 'Science Block B',
    equipment: ['Computers', 'Projector', 'Lab Equipment'],
    is_available: true
  },
  {
    id: 3,
    name: 'Lecture Hall C301',
    capacity: 200,
    building: 'Main Hall C',
    equipment: ['Projector', 'Sound System', 'Recording Equipment'],
    is_available: true
  }
];

const DUMMY_LEVELS: AcademicLevel[] = [
  {
    id: 1,
    level_code: '100',
    level_name: 'Level 100',
    required_courses: ['CSC101', 'MTH101', 'ENG101'],
    total_credits: 18,
    is_active: true
  },
  {
    id: 2,
    level_code: '200',
    level_name: 'Level 200',
    required_courses: ['CSC201', 'MTH201', 'STA201'],
    total_credits: 21,
    is_active: true
  }
];

export const timetableApi = {
  // Courses
  getCourses: async (): Promise<Course[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return DUMMY_COURSES;
  },

  createCourse: async (course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newCourse: Course = {
      ...course,
      id: Math.max(...DUMMY_COURSES.map(c => c.id)) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    DUMMY_COURSES.push(newCourse);
    return newCourse;
  },

  updateCourse: async (id: number, updates: Partial<Course>): Promise<Course> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = DUMMY_COURSES.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Course not found');
    
    DUMMY_COURSES[index] = {
      ...DUMMY_COURSES[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    return DUMMY_COURSES[index];
  },

  deleteCourse: async (id: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = DUMMY_COURSES.findIndex(c => c.id === id);
    if (index !== -1) {
      DUMMY_COURSES.splice(index, 1);
    }
  },

  // Time Slots
  getTimeSlots: async (): Promise<TimeSlot[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return DUMMY_TIMESLOTS;
  },

  // Rooms
  getRooms: async (): Promise<Room[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return DUMMY_ROOMS;
  },

  // Academic Levels
  getAcademicLevels: async (): Promise<AcademicLevel[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return DUMMY_LEVELS;
  },

  /**
   * Get timetable entries with optional filters
   */
  async getTimetableEntries(filters: { teacher_id?: number } = {}) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const timetableEntries = [
      {
        id: 1,
        course: DUMMY_COURSES[0],
        teacher: { id: 1, name: 'Dr. Smith', email: 'smith@university.edu' },
        timeslot: DUMMY_TIMESLOTS[0],
        room: DUMMY_ROOMS[0],
        academic_year: '2024',
        semester: 'Fall',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    if (filters.teacher_id) {
      return timetableEntries.filter(entry => entry.teacher.id === filters.teacher_id);
    }

    return timetableEntries;
  },

  createTimetableEntry: async (entry: Omit<TimetableEntry, 'id' | 'created_at' | 'updated_at'>): Promise<TimetableEntry> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      ...entry,
      id: Math.floor(Math.random() * 1000),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  // Current Sessions
  getCurrentSessions: async (teacherId?: number): Promise<SessionInfo[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, need to adjust for our system

    // Mock current sessions based on time
    return [
      {
        id: 1,
        course: DUMMY_COURSES[0],
        teacher: { id: 1, name: 'Dr. Smith' },
        start_time: '08:00',
        end_time: '10:00',
        status: currentHour >= 8 && currentHour < 10 ? 'active' : 'scheduled',
        attendance_count: 23,
        total_enrolled: 45
      }
    ];
  }
};
