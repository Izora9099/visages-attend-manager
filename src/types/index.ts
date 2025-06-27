// src/types/index.ts - Updated to match Django models exactly

export interface Department {
  id: number;
  department_name: string;
  department_code: string;
  description?: string;
  head_of_department?: string;
  contact_email?: string;
  contact_phone?: string;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Specialization {
  id: number;
  specialization_name: string;
  specialization_code: string;
  description?: string;
  department: number;
  department_name?: string; // From serializer
  duration_years: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Level {
  id: number;
  level_name: string;
  level_code: string;
  description?: string;
  level_order: number;
  departments: number[];
  specializations: number[];
  department_names?: string[]; // From serializer
  specialization_names?: string[]; // From serializer
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  course_code: string;
  course_name: string;
  description?: string;
  credits: number;
  semester: number;
  department: number;
  level: number;
  specializations: number[];
  teachers: number[];
  department_name?: string; // From serializer
  level_name?: string; // From serializer
  specialization_names?: string[]; // From serializer
  teacher_names?: string[]; // From serializer
  enrolled_students_count?: number; // From serializer
  status: 'active' | 'inactive' | 'archived';
  room?: string;
  schedule?: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string; // From serializer
  matric_number: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  emergency_contact?: string;
  emergency_phone?: string;
  department: number;
  specialization?: number;
  level: number;
  enrolled_courses: number[];
  department_name?: string; // From serializer
  specialization_name?: string; // From serializer
  level_name?: string; // From serializer
  enrolled_courses_count?: number; // From serializer
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  registration_date: string;
  graduation_date?: string;
  face_encoding?: string;
  face_encoding_model?: string;
  face_images_count: number;
  last_attendance?: string;
  attendance_rate: number;
  academic_year: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: number;
  student: number;
  course: number;
  student_name?: string; // From serializer
  student_matric?: string; // From serializer
  course_name?: string; // From serializer
  course_code?: string; // From serializer
  status: 'present' | 'late' | 'absent' | 'excused';
  check_in_time: string;
  check_out_time?: string;
  recognition_confidence?: number;
  recognition_model?: string;
  location?: string;
  device_info?: string;
  notes?: string;
  date?: string; // From serializer (computed field)
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string; // From serializer
  phone?: string;
  role: 'superadmin' | 'staff' | 'teacher';
  permissions: string[];
  taught_courses?: Course[]; // From serializer
  is_active: boolean;
  is_2fa_enabled: boolean;
  last_login?: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceSession {
  id: number;
  session_id: string;
  course: number;
  course_name?: string; // From serializer
  course_code?: string; // From serializer
  teacher: number;
  teacher_name?: string; // From serializer
  start_time: string;
  expected_end_time: string;
  actual_end_time?: string;
  session_duration_minutes: number;
  grace_period_minutes: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  room?: string;
  total_students_expected: number;
  present_count: number;
  late_count: number;
  absent_count: number;
  attendance_rate?: number; // From serializer
  notes?: string;
  auto_end_enabled: boolean;
  created_at: string;
}

export interface SessionCheckIn {
  id: number;
  attendance_session: number;
  student: number;
  student_name?: string; // From serializer
  student_matric?: string; // From serializer
  check_in_time: string;
  status: 'present' | 'late' | 'absent';
  recognition_confidence?: number;
  is_manual_override: boolean;
  notes?: string;
  created_at: string;
}

export interface SystemSettings {
  id: number;
  institution_name: string;
  institution_code: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  school_email?: string;
  academic_year: string;
  timezone: string;
  date_format: string;
  time_format: string;
  attendance_grace_period: number;
  late_threshold: number;
  auto_mark_absent_after: number;
  require_checkout: boolean;
  allow_manual_attendance: boolean;
  attendance_notifications: boolean;
  face_recognition_enabled: boolean;
  face_confidence_threshold: number;
  max_face_images_per_student: number;
  face_detection_timeout: number;
  auto_capture_enabled: boolean;
  face_image_quality_threshold: number;
  backup_enabled: boolean;
  backup_frequency: string;
  backup_retention_days: number;
  auto_backup_enabled: boolean;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  maintenance_mode: boolean;
  debug_mode: boolean;
  created_at: string;
  updated_at: string;
  updated_by?: number;
}

export interface SystemBackup {
  id: number;
  backup_type: 'full' | 'partial' | 'database' | 'files';
  file_path: string;
  file_size: number;
  file_size_mb?: number; // From serializer
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  created_by: number;
  created_by_name?: string; // From serializer
}

export interface UserActivity {
  id: number;
  user: number;
  action: string;
  resource: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  status: 'success' | 'failed' | 'warning';
  timestamp: string;
}

export interface LoginAttempt {
  id: number;
  username: string;
  ip_address?: string;
  user_agent?: string;
  location?: string;
  status: 'success' | 'failed' | 'blocked';
  failure_reason?: string;
  timestamp: string;
}

export interface ActiveSession {
  id: number;
  user: number;
  session_key: string;
  ip_address?: string;
  user_agent?: string;
  location?: string;
  last_activity: string;
  created_at: string;
}

export interface SecuritySettings {
  id: number;
  min_password_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  password_expiry_days: number;
  session_timeout_minutes: number;
  max_concurrent_sessions: number;
  max_failed_attempts: number;
  lockout_duration_minutes: number;
  enable_2fa: boolean;
  force_2fa_for_admins: boolean;
  enable_ip_whitelist: boolean;
  allowed_ip_ranges?: string;
  log_all_activities: boolean;
  log_retention_days: number;
  created_at: string;
  updated_at: string;
  updated_by?: number;
}

// Dashboard and Analytics Types
export interface DashboardStats {
  total_students: number;
  total_courses: number;
  total_departments: number;
  total_teachers: number;
  active_sessions: number;
  total_attendance_records: number;
  todays_attendance_count: number;
  todays_attendance_rate: number;
  weekly_attendance_trend: any[];
  recent_activities: any[];
}

export interface DepartmentStats {
  department_name: string;
  total_students: number;
  total_courses: number;
  total_specializations: number;
  average_attendance_rate: number;
}

export interface CourseStats {
  course_code: string;
  course_name: string;
  enrolled_students: number;
  total_attendance_records: number;
  average_attendance_rate: number;
}

export interface TeacherStats {
  teacher_name: string;
  total_courses: number;
  total_students: number;
  total_attendance_records: number;
}

// Enrollment Management Types
export interface StudentEnrollment {
  student_id: number;
  course_ids: number[];
}

export interface BulkEnrollment {
  department_id?: number;
  specialization_id?: number;
  level_id?: number;
  course_ids: number[];
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface ApiError {
  message: string;
  detail?: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Form Data Types
export interface StudentFormData {
  first_name: string;
  last_name: string;
  matric_number: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  emergency_contact?: string;
  emergency_phone?: string;
  department: number;
  specialization?: number;
  level: number;
  academic_year?: string;
}

export interface CourseFormData {
  course_code: string;
  course_name: string;
  description?: string;
  credits: number;
  semester: number;
  department: number;
  level: number;
  specializations: number[];
  teachers: number[];
  room?: string;
  schedule?: string;
}

export interface AttendanceFormData {
  student: number;
  course: number;
  status: 'present' | 'late' | 'absent' | 'excused';
  notes?: string;
}

// Filter Types
export interface StudentFilters {
  search?: string;
  department?: number;
  specialization?: number;
  level?: number;
  status?: string;
  page?: number;
  page_size?: number;
}

export interface CourseFilters {
  search?: string;
  department?: number;
  level?: number;
  status?: string;
  semester?: number;
  page?: number;
  page_size?: number;
}

export interface AttendanceFilters {
  student_id?: number;
  course_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

// User Permissions (enhanced to match your actual user data)
export interface UserPermissions {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string; // Alternative full name field
  phone?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superuser: boolean;
  role: 'superadmin' | 'staff' | 'teacher';
  permissions: string[];
  last_login?: string;
  date_joined?: string;
}