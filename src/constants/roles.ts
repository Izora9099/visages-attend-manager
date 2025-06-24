// src/constants/roles.ts

// User roles for role-based access control (RBAC)
export const ROLES = {
  // System administrator with full access
  SUPER_ADMIN: 'Super Admin',
  
  // School administrator with management access
  ADMIN: 'Admin',
  
  // Teaching staff with teacher access
  TEACHER: 'Teacher',
  
  // Student access
  STUDENT: 'Student',
  
  // Parent/guardian access
  PARENT: 'Parent',
  
  // Staff with limited access
  STAFF: 'Staff',
} as const;

// Type for role values
export type Role = typeof ROLES[keyof typeof ROLES];

// Helper function to check if a string is a valid role
export const isValidRole = (role: string): role is Role => {
  return Object.values(ROLES).includes(role as Role);
};

// Map of roles to their display names
export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: 'Super Administrator',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.STUDENT]: 'Student',
  [ROLES.PARENT]: 'Parent',
  [ROLES.STAFF]: 'Staff',
};

// Map of roles to their permission levels (lower number = higher permissions)
export const ROLE_LEVELS: Record<Role, number> = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]: 90,
  [ROLES.TEACHER]: 70,
  [ROLES.STAFF]: 50,
  [ROLES.PARENT]: 30,
  [ROLES.STUDENT]: 10,
};

// Check if a user has at least the minimum required role level
export const hasMinRoleLevel = (userRole: Role | undefined, minRole: Role): boolean => {
  if (!userRole) return false;
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[minRole];
};

// Default routes for each role after login
export const DEFAULT_ROUTES: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: '/admin/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.TEACHER]: '/teacher/dashboard',
  [ROLES.STAFF]: '/staff/dashboard',
  [ROLES.PARENT]: '/parent/dashboard',
  [ROLES.STUDENT]: '/student/dashboard',
};

// Get the default route for a user based on their role
export const getDefaultRoute = (role?: Role): string => {
  if (!role || !isValidRole(role)) return '/login';
  return DEFAULT_ROUTES[role];
};
