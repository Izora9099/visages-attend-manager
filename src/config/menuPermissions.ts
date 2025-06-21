// src/config/menuPermissions.ts
// Menu configuration and permission definitions

import { Users, ClipboardList, Camera, BarChart3, UserCog, Layout, Settings, Shield } from "lucide-react";
import { MenuItemPermission } from '@/types/permissions';

export const MENU_PERMISSIONS: MenuItemPermission[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Layout,
    // No restrictions - everyone can access dashboard
  },
  {
    id: "students",
    label: "Students",
    icon: Users,
    requiredPermission: ["Manage Students", "View Students"],
    // Users with student management permissions
  },
  {
    id: "attendance",
    label: "Attendance", 
    icon: ClipboardList,
    requiredPermission: ["Edit Attendance", "View Attendance"],
    // Users with attendance permissions
  },
  {
    id: "facial-recognition",
    label: "Face Recognition",
    icon: Camera,
    requiredRole: ["Super Admin", "Manager", "Teacher"],
    // Specific roles only
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    requiredPermission: ["View Reports"],
    requiredRole: ["Super Admin", "Manager"],
    // Must have both permission AND role
  },
  {
    id: "admin-users",
    label: "Admin Users",
    icon: UserCog,
    requireSuperuser: true,
    // Only superusers
  },
  {
    id: "system-settings",
    label: "System Settings",
    icon: Settings,
    requireSuperuser: true,
    // Only superusers
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    requiredRole: ["Super Admin"],
    requireSuperuser: true,
    // Extra secure - only superusers with specific role
  }
];

// Common permission sets for easy assignment
export const PERMISSION_SETS = {
  TEACHER: [
    "View Students",
    "Edit Attendance", 
    "View Attendance"
  ],
  MANAGER: [
    "Manage Students",
    "Edit Attendance",
    "View Attendance", 
    "View Reports"
  ],
  ADMIN: [
    "Manage Students",
    "Edit Attendance",
    "View Attendance",
    "View Reports",
    "Manage Admin Users"
  ],
  SUPER_ADMIN: [
    // Superusers get all permissions automatically
  ]
};

// Role hierarchy for easy role checking
export const ROLE_HIERARCHY = {
  "Staff": 0,
  "Teacher": 1, 
  "Manager": 2,
  "Admin": 3,
  "Super Admin": 4
};

export const hasHigherRole = (userRole: string, requiredRole: string): boolean => {
  const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY] || 0;
  return userLevel >= requiredLevel;
};