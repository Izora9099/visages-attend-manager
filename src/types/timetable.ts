// Updated src/types/timetable.ts
// Replace your existing types with these updated ones

export interface TimeSlot {
  id: number;
  day_of_week: number; // 0 = Monday, 6 = Sunday
  day_name: string;
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  duration_minutes: number;
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  building?: string;
  floor?: string;
  equipment?: string[];
  is_available: boolean;
}

export interface Course {
  id: number;
  course_code: string;
  course_name: string;
  credits: number;
  level: {
    id: number;
    level_name: string;
  };
  department: {
    id: number;
    name: string;
  };
}

export interface Teacher {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
}

export interface TimetableEntry {
  id: number;
  course: Course;
  teacher: Teacher;
  time_slot: TimeSlot;
  room: Room;
  academic_year: string;
  semester: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// For creating/updating timetable entries
export interface TimetableEntryCreate {
  course_id: number;
  teacher_id: number;
  time_slot_id: number;
  room_id: number;
  academic_year?: string;
  semester?: number;
  notes?: string;
}

export interface TimetableEntryUpdate extends Partial<TimetableEntryCreate> {
  is_active?: boolean;
}

// For filtering timetable entries
export interface TimetableFilters {
  teacher_id?: number;
  academic_year?: string;
  semester?: number;
  level?: string;
  department?: string;
}

// Legacy types for backward compatibility
export interface AcademicLevel {
  id: number;
  level_code: string;
  level_name: string;
  required_courses: string[];
  total_credits: number;
  is_active: boolean;
}

export interface SessionInfo {
  id: number;
  course: Course;
  teacher: Teacher;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  attendance_count: number;
  total_enrolled: number;
  room: Room;
}

export interface TimetableConflict {
  type: 'teacher' | 'room' | 'student';
  message: string;
  conflicting_entries: TimetableEntry[];
}