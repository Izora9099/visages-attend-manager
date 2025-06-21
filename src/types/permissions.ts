// types/permissions.ts - Create this file for type safety

export interface UserPermissions {
    id: number;
    username: string;
    is_superuser: boolean;
    is_staff?: boolean;
    role?: string;
    permissions?: string[];
  }
  
  export interface MenuItemPermission {
    id: string;
    label: string;
    icon: any;
    requiredRole?: string[];
    requiredPermission?: string[];
    requireSuperuser?: boolean;
    requireStaff?: boolean;
  }