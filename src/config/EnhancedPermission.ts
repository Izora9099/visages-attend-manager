// src/config/enhancedPermissions.ts
// Enhanced RBAC system for the new requirements

import { Calendar, Users, Clock, BookOpen, Settings, BarChart3, UserCog, Shield, PlayCircle } from "lucide-react";

export interface EnhancedPermission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface EnhancedRole {
  id: string;
  name: string;
  level: number;
  permissions: string[];
  restrictions?: {
    courseScope?: boolean; // Can only access assigned courses
    studentScope?: boolean; // Can only access students in their courses
    sessionScope?: boolean; // Can only manage their own sessions
  };
}

export const ENHANCED_PERMISSIONS: EnhancedPermission[] = [
  // Student Management
  { id: "view_students", name: "View Students", description: "View student profiles and information", category: "students" },
  { id: "manage_students", name: "Manage Students", description: "Create, edit, and delete student records", category: "students" },
  { id: "enroll_students", name: "Enroll Students", description: "Enroll/unenroll students in courses", category: "students" },
  { id: "view_student_roster", name: "View Student Roster", description: "View students assigned to courses", category: "students" },
  
  // Course Management
  { id: "view_courses", name: "View Courses", description: "View course information", category: "courses" },
  { id: "manage_courses", name: "Manage Courses", description: "Create, edit, and delete courses", category: "courses" },
  { id: "assign_teachers", name: "Assign Teachers", description: "Assign teachers to courses", category: "courses" },
  
  // Timetable Management
  { id: "view_timetable", name: "View Timetable", description: "View timetable schedules", category: "timetable" },
  { id: "manage_timetable", name: "Manage Timetable", description: "Create and edit timetables", category: "timetable" },
  { id: "import_timetable", name: "Import Timetable", description: "Import timetables from CSV/Excel", category: "timetable" },
  
  // Attendance Management
  { id: "view_attendance", name: "View Attendance", description: "View attendance records", category: "attendance" },
  { id: "edit_attendance", name: "Edit Attendance", description: "Manually edit attendance records", category: "attendance" },
  { id: "start_sessions", name: "Start Sessions", description: "Initiate attendance sessions", category: "attendance" },
  { id: "manage_sessions", name: "Manage Sessions", description: "Full session management", category: "attendance" },
  
  // Reporting
  { id: "view_reports", name: "View Reports", description: "Access basic reports", category: "reports" },
  { id: "generate_reports", name: "Generate Reports", description: "Generate and export reports", category: "reports" },
  { id: "system_reports", name: "System Reports", description: "Access system-wide reports", category: "reports" },
  
  // User Management
  { id: "view_users", name: "View Users", description: "View user accounts", category: "users" },
  { id: "manage_users", name: "Manage Users", description: "Create and manage user accounts", category: "users" },
  { id: "manage_permissions", name: "Manage Permissions", description: "Assign roles and permissions", category: "users" },
  
  // System Administration
  { id: "system_settings", name: "System Settings", description: "Configure system settings", category: "system" },
  { id: "view_audit_logs", name: "View Audit Logs", description: "Access system audit logs", category: "system" },
  { id: "system_backup", name: "System Backup", description: "Manage system backups", category: "system" },
];

export const ENHANCED_ROLES: EnhancedRole[] = [
  {
    id: "superadmin",
    name: "Superadmin",
    level: 4,
    permissions: ENHANCED_PERMISSIONS.map(p => p.id), // All permissions
  },
  {
    id: "teacher",
    name: "Teacher",
    level: 1,
    permissions: [
      "view_student_roster",
      "view_attendance",
      "edit_attendance",
      "start_sessions",
      "view_reports",
      "generate_reports",
      "view_timetable",
    ],
    restrictions: {
      courseScope: true,
      studentScope: true,
      sessionScope: true,
    }
  },
  {
    id: "staff",
    name: "Staff (Administrative)",
    level: 2,
    permissions: [
      "view_students",
      "manage_students",
      "enroll_students",
      "view_courses",
      "view_timetable",
    ]
  }
];

export const ENHANCED_MENU_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    path: "/dashboard",
    requiredPermissions: [],
  },
  {
    id: "students",
    label: "Students",
    icon: Users,
    path: "/students",
    requiredPermissions: ["view_students", "view_student_roster"],
  },
  {
    id: "courses",
    label: "Courses",
    icon: BookOpen,
    path: "/courses",
    requiredPermissions: ["view_courses"],
  },
  {
    id: "timetable",
    label: "Timetable",
    icon: Calendar,
    path: "/timetable",
    requiredPermissions: ["view_timetable"],
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: Clock,
    path: "/attendance",
    requiredPermissions: ["view_attendance"],
  },
  {
    id: "sessions",
    label: "Sessions",
    icon: PlayCircle,
    path: "/sessions",
    requiredPermissions: ["start_sessions", "manage_sessions"],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    path: "/reports",
    requiredPermissions: ["view_reports"],
  },
  {
    id: "users",
    label: "Users",
    icon: UserCog,
    path: "/users",
    requiredPermissions: ["view_users"],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/settings",
    requiredPermissions: ["system_settings"],
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    path: "/security",
    requiredPermissions: ["view_audit_logs"],
  }
];

// Permission checking utilities
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};

export const hasRole = (userRole: string, requiredRole: string): boolean => {
  const userRoleObj = ENHANCED_ROLES.find(r => r.id === userRole);
  const requiredRoleObj = ENHANCED_ROLES.find(r => r.id === requiredRole);
  
  if (!userRoleObj || !requiredRoleObj) return false;
  
  return userRoleObj.level >= requiredRoleObj.level;
};

export const getRolePermissions = (roleId: string): string[] => {
  const role = ENHANCED_ROLES.find(r => r.id === roleId);
  return role ? role.permissions : [];
};

export const getRoleRestrictions = (roleId: string) => {
  const role = ENHANCED_ROLES.find(r => r.id === roleId);
  return role?.restrictions || {};
};