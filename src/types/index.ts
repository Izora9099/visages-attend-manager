// src/types/index.ts
// Common type definitions for the FACE.IT application

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    name: string;
    phone?: string;
    is_active: boolean;
    is_staff?: boolean;
    is_superuser: boolean;
    last_login?: string;
    date_joined?: string;
    role?: string;
    permissions?: string[];
  }
  
  export interface AdminUser extends User {
    role: string;
    permissions: string[];
    created_at: string;
    updated_at: string;
  }
  
  export interface Student {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    student_id: string;
    phone?: string;
    address?: string;
    date_of_birth?: string;
    enrollment_date: string;
    is_active: boolean;
    class_name?: string;
    grade?: string;
    face_image_url?: string;
  }
  
  export interface AttendanceRecord {
    id: number;
    student: Student;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    check_in_time?: string;
    check_out_time?: string;
    marked_by: User;
    notes?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface UserActivity {
    id: number;
    user: {
      username: string;
      full_name: string;
      role: string;
    };
    action: string;
    resource: string;
    resource_id?: number;
    details: string;
    ip_address: string;
    timestamp: string;
    status: 'success' | 'failed' | 'warning';
    session_id: string;
  }
  
  export interface LoginAttempt {
    id: number;
    username: string;
    ip_address: string;
    location: string;
    timestamp: string;
    success: boolean;
    user_agent: string;
    reason?: string;
  }
  
  export interface ActiveSession {
    id: string;
    user: string;
    role: string;
    ip_address: string;
    location: string;
    device: string;
    last_activity: string;
    created_at: string;
    activity_count: number;
  }
  
  export interface SecuritySettings {
    max_login_attempts: number;
    lockout_duration: number;
    session_timeout: number;
    require_2fa: boolean;
    password_expiry_days: number;
    min_password_length: number;
    allow_multiple_sessions: boolean;
    ip_whitelist_enabled: boolean;
    audit_log_retention_days: number;
    track_user_activities: boolean;
    alert_on_suspicious_activity: boolean;
  }
  
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
  }
  
  export interface PaginatedResponse<T> {
    count: number;
    next?: string;
    previous?: string;
    results: T[];
  }
  
  // Form data types
  export interface LoginForm {
    username: string;
    password: string;
  }
  
  export interface StudentForm {
    first_name: string;
    last_name: string;
    email: string;
    student_id: string;
    phone?: string;
    address?: string;
    date_of_birth?: string;
    class_name?: string;
    grade?: string;
  }
  
  export interface AdminUserForm {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password?: string;
    phone?: string;
    role: string;
    permissions: string[];
    is_active: boolean;
  }
  
  // Filter types
  export interface AttendanceFilter {
    date_from?: string;
    date_to?: string;
    student_id?: number;
    status?: string;
    class_name?: string;
  }
  
  export interface ActivityFilter {
    user?: string;
    action?: string;
    date_range?: string;
    status?: string;
    days?: number;
  }
  
  // Dashboard types
  export interface DashboardStats {
    total_students: number;
    present_today: number;
    absent_today: number;
    late_today: number;
    attendance_rate: number;
    recent_activities: UserActivity[];
  }
  
  export interface ReportData {
    type: string;
    title: string;
    data: any[];
    generated_at: string;
    generated_by: User;
    filters: Record<string, any>;
  }