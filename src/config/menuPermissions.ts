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
  Monitor
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
    label: "Timetable",
    icon: Calendar,
    requiredRole: ["Superadmin", "Teacher"],
  },
  {
    id: "courses",
    label: "Courses",
    icon: BookOpen,
    requiredRole: ["Superadmin"],
  },
  {
    id: "sessions",
    label: "Live Sessions",
    icon: Monitor,
    requiredRole: ["Superadmin", "Teacher"],
  },
  {
    id: "students",
    label: "Students",
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
