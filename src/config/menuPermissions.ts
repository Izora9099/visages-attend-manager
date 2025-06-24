// src/config/menuPermissions.ts
// Menu permissions configuration

import { MenuItemPermission } from "@/types/permissions";
import { ROLES } from "@/constants/roles";
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Shield, 
  Clock,
  BookOpen,
  Monitor,
  UserCheck,
  LayoutDashboard,
  FileText,
  Key,
  UserCog,
  CalendarDays,
  List,
  Bookmark,
  User,
  GraduationCap,
  ListChecks
} from "lucide-react";

// Menu permissions configuration
export const MENU_PERMISSIONS: MenuItemPermission[] = [
  // Dashboard - Accessible to all authenticated users
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard, 
    requiredRole: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.STAFF],
  },
  
  // Timetable - Teachers can view only
  {
    id: "timetable",
    label: "Timetable",
    icon: CalendarDays,
    requiredRole: [ROLES.SUPER_ADMIN, ROLES.TEACHER],
    viewOnly: true, // Teachers can only view, not modify
  },
  
  // Student Roster - Teachers can view students in their courses only
  {
    id: "student-roster",
    label: "Student Roster",
    icon: Users,
    requiredRole: [ROLES.SUPER_ADMIN, ROLES.TEACHER],
    requiresCourseFilter: true, // Will be filtered by teacher's assigned courses
    viewOnly: true, // Teachers can only view, not modify
  },
  
  // Attendance - Teachers can take attendance for their courses
  {
    id: "attendance",
    label: "Attendance",
    icon: ListChecks,
    requiredRole: [ROLES.SUPER_ADMIN, ROLES.TEACHER],
    requiresCourseFilter: true, // Filtered by teacher's assigned courses
  },
  
  // Admin-only sections (not visible to teachers)
  {
    id: "courses",
    label: "Course Management",
    icon: BookOpen,
    requiredRole: [ROLES.SUPER_ADMIN],
  },
  {
    id: "teachers",
    label: "Teacher Management",
    icon: UserCheck,
    requiredRole: [ROLES.SUPER_ADMIN],
  },
  {
    id: "students",
    label: "All Students",
    icon: User,
    requiredRole: [ROLES.SUPER_ADMIN, ROLES.STAFF],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3, 
    requiredRole: [ROLES.SUPER_ADMIN],
  },
  {
    id: "admin-users",
    label: "Admin Users",
    icon: UserCog, 
    requireSuperuser: true,
  },
  {
    id: "security",
    label: "Security",
    icon: Key, 
    requireSuperuser: true,
  },
  {
    id: "profile",
    label: "Profile",
    icon: Users,
    requiredRole: [ROLES.SUPER_ADMIN, ROLES.TEACHER, ROLES.STAFF],
  },
  {
    id: "system-settings",
    label: "System Settings",
    icon: Settings,
    requireSuperuser: true,
  },
];
