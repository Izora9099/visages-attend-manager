
// TypeScript interfaces for Django models used in FACE.IT application

export interface Student {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department: string;
  year_of_study: number;
  enrollment_date: string;
  is_active: boolean;
  face_encoding?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: number;
  student: Student;
  date: string;
  time_in?: string;
  time_out?: string;
  status: 'present' | 'absent' | 'late';
  marked_by: string;
  recognition_confidence?: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_superuser: boolean;
  last_login?: string;
  date_joined: string;
}

export interface FaceRecognitionResult {
  success: boolean;
  student?: Student;
  confidence?: number;
  message: string;
}

export interface AttendanceReport {
  id: number;
  report_type: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  filters: Record<string, any>;
  data: AttendanceRecord[];
  generated_by: AdminUser;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Form interfaces for creating/updating entities
export interface StudentFormData {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department: string;
  year_of_study: number;
}

export interface AttendanceFormData {
  student_id: number;
  date: string;
  time_in?: string;
  time_out?: string;
  status: 'present' | 'absent' | 'late';
}

export interface AdminUserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  is_active: boolean;
  is_superuser: boolean;
}
