
// src/config/menuPermissions.ts
// Menu permissions configuration

import { MenuItemPermission } from "@/types/permissions";
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Shield, 
  Clock,
  BookOpen,
  Monitor,
  UserCheck
} from "lucide-react";

// Menu permissions configuration
export const MENU_PERMISSIONS: MenuItemPermission[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    requiredRole: ["Superadmin", "Teacher", "Staff"],
  },
  {
    id: "timetable",
    label: "Timetable Management",
    icon: Calendar,
    requiredRole: ["Superadmin"],
  },
  {
    id: "courses",
    label: "Course Management",
    icon: BookOpen,
    requiredRole: ["Superadmin"],
  },
  {
    id: "teachers",
    label: "Teacher Management",
    icon: UserCheck,
    requiredRole: ["Superadmin"],
  },
  {
    id: "students",
    label: "Student Management",
    icon: Users,
    requiredRole: ["Superadmin", "Staff"],
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: Clock,
    requiredRole: ["Superadmin", "Teacher", "Staff"],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    requiredRole: ["Superadmin", "Teacher"],
  },
  {
    id: "admin-users",
    label: "Admin Users",
    icon: Shield,
    requireSuperuser: true,
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    requireSuperuser: true,
  },
  {
    id: "profile",
    label: "Profile",
    icon: Users,
    requiredRole: ["Superadmin", "Teacher", "Staff"],
  },
  {
    id: "system-settings",
    label: "System Settings",
    icon: Settings,
    requireSuperuser: true,
  },
];
