// types/permissions.ts

export interface UserPermissions {
    id: number;
    username: string;
    is_superuser: boolean;
    is_staff?: boolean;
    role?: string;
    permissions?: string[];
    assigned_courses?: number[]; // IDs of courses assigned to the teacher
}

export interface MenuItemPermission {
    id: string;
    label: string;
    icon: any;
    requiredRole?: string[];
    requiredPermission?: string[];
    requireSuperuser?: boolean;
    requireStaff?: boolean;
    viewOnly?: boolean; // If true, the menu item is read-only
    requiresCourseFilter?: boolean; // If true, requires course filtering
}