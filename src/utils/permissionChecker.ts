// src/utils/permissionChecker.ts
// Permission checking logic and utilities

import { UserPermissions, MenuItemPermission } from '@/types/permissions';

export class PermissionChecker {
  private user: UserPermissions;

  constructor(user: UserPermissions) {
    this.user = user;
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    if (this.user.is_superuser) return true; // Superusers have all permissions
    return this.user.permissions?.includes(permission) || false;
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(permissions: string[]): boolean {
    if (this.user.is_superuser) return true;
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    if (this.user.is_superuser && role === 'Super Admin') return true;
    return this.user.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  // Check if user meets all requirements for a menu item
  canAccessMenuItem(item: MenuItemPermission): boolean {
    // Always allow access if no restrictions
    if (!item.requiredRole && !item.requiredPermission && !item.requireSuperuser && !item.requireStaff) {
      return true;
    }

    // Check superuser requirement
    if (item.requireSuperuser && !this.user.is_superuser) {
      return false;
    }

    // Check staff requirement
    if (item.requireStaff && !this.user.is_staff && !this.user.is_superuser) {
      return false;
    }

    // Check role requirement
    if (item.requiredRole && item.requiredRole.length > 0) {
      if (!this.hasAnyRole(item.requiredRole)) {
        return false;
      }
    }

    // Check permission requirement
    if (item.requiredPermission && item.requiredPermission.length > 0) {
      if (!this.hasAnyPermission(item.requiredPermission)) {
        return false;
      }
    }

    return true;
  }

  // Get user's display role
  getDisplayRole(): string {
    if (this.user.is_superuser) return 'Super Admin';
    return this.user.role || 'Staff';
  }

  // Check if user is admin level (superuser or manager)
  isAdmin(): boolean {
    return this.user.is_superuser || this.hasRole('Manager') || this.hasRole('Admin');
  }
}