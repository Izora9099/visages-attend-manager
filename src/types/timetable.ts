
// Core timetable types
export interface Course {
  id: number;
  code: string;
  name: string;
  credits: number;
  department: string;
  level: string;
  description?: string;
  prerequisites?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: number;
  day_of_week: number; // 0 = Monday, 6 = Sunday
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  duration_minutes: number;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  building?: string;
  equipment?: string[];
  is_available: boolean;
}

export interface TimetableEntry {
  id: number;
  course: Course;
  teacher: {
    id: number;
    name: string;
    email: string;
  };
  timeslot: TimeSlot;
  room: Room;
  academic_year: string;
  semester: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicLevel {
  id: number;
  level_code: string; // e.g., "100", "200", "300", "400"
  level_name: string; // e.g., "Level 100", "Level 200"
  required_courses: string[]; // Array of course codes
  total_credits: number;
  is_active: boolean;
}

export interface TimetableConflict {
  type: 'teacher' | 'room' | 'student';
  message: string;
  conflicting_entries: TimetableEntry[];
}

export interface SessionInfo {
  id: number;
  course: Course;
  teacher: {
    id: number;
    name: string;
  };
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  attendance_count: number;
  total_enrolled: number;
}
