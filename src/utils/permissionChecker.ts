// src/utils/permissionChecker.ts
import { UserPermissions, MenuItemPermission } from '@/types/permissions';
import { ROLES, type Role, isValidRole } from '@/constants/roles';

export class PermissionChecker {
  private user: UserPermissions;

  constructor(user: UserPermissions) {
    if (!user) {
      throw new Error('User permissions object is required');
    }
    this.user = user;
  }

  // Check if user has specific permission
  hasPermission(permission: string): boolean {
    if (!permission || typeof permission !== 'string') {
      console.warn('Invalid permission string provided');
      return false;
    }
    if (this.user.is_superuser) return true;
    return this.user.permissions?.includes(permission) || false;
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(permissions: string[]): boolean {
    if (!Array.isArray(permissions)) {
      console.warn('Expected permissions to be an array');
      return false;
    }
    if (this.user.is_superuser) return true;
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Check if user has specific role (case-insensitive)
  hasRole(role: string): boolean {
    if (this.user.is_superuser) return true;  // Superuser has all roles
    if (!this.user.role) return false;
    return isValidRole(this.user.role) && this.user.role.toUpperCase() === role.toUpperCase();
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    if (!Array.isArray(roles)) {
      console.warn('Expected roles to be an array');
      return false;
    }
    if (this.user.is_superuser && roles.includes(ROLES.SUPER_ADMIN)) return true;
    return roles.some(role => this.hasRole(role));
  }

  // Check if user meets all requirements for a menu item
  canAccessMenuItem(item: MenuItemPermission): boolean {
    if (!item) {
      console.warn('No menu item provided');
      return false;
    }

    // Superusers have access to everything
    if (this.user.is_superuser) {
      return true;
    }

    // Check superuser requirement
    if (item.requireSuperuser) {
      return false;
    }

    // Check staff requirement
    if (item.requireStaff && !this.user.is_staff) {
      return false;
    }

    // Check role requirement
    if (item.requiredRole?.length && !this.hasAnyRole(item.requiredRole)) {
      return false;
    }

    // Check specific permission requirement
    if (item.requiredPermission) {
      if (Array.isArray(item.requiredPermission)) {
        if (!this.hasAnyPermission(item.requiredPermission)) {
          return false;
        }
      } else if (!this.hasPermission(item.requiredPermission)) {
        return false;
      }
    }

    return true;
  }

  // Check if a menu item is view-only for the current user
  isViewOnly(item: MenuItemPermission): boolean {
    // Super admins can edit everything unless explicitly marked as view-only
    if (this.user.is_superuser) {
      return item.viewOnly === true;
    }
    
    // For other users, respect the viewOnly flag
    return item.viewOnly === true;
  }

  // Check if a menu item requires course filtering for the current user
  requiresCourseFilter(item: MenuItemPermission): boolean {
    // Only apply course filtering to teachers and non-superusers
    if (this.user.is_superuser) {
      return false;
    }
    
    return item.requiresCourseFilter === true;
  }

  // Get user's display role
  getDisplayRole(): string {
    if (this.user.is_superuser) return ROLES.SUPER_ADMIN;
    if (this.user.role && isValidRole(this.user.role)) {
      return this.user.role;
    }
    return 'User';
  }

  // Check if user is admin level (superuser or manager)
  isAdmin(): boolean {
    return this.user.is_superuser || this.user.role === 'Manager';
  }
}