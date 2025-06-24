// src/components/Sidebar.tsx
// Sidebar component using the advanced permission system

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { djangoApi } from "@/services/djangoApi";
import { PermissionChecker } from "@/utils/permissionChecker";
import { MENU_PERMISSIONS } from "@/config/menuPermissions";
import { UserPermissions, MenuItemPermission } from "@/types/permissions";
import { ROLES } from "@/constants/roles";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ activeTab, setActiveTab, isOpen, onToggle }: SidebarProps) => {
  const [currentUser, setCurrentUser] = useState<UserPermissions | null>(null);
  const [visibleMenuItems, setVisibleMenuItems] = useState<MenuItemPermission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const filteredItems = filterMenuItems();
      setVisibleMenuItems(filteredItems);
      
      // If current tab is not in visible items, switch to first available tab
      if (filteredItems.length > 0 && !filteredItems.some(item => item.id === activeTab)) {
        setActiveTab(filteredItems[0].id);
      }
    }
    setLoading(false);
  }, [currentUser, activeTab, setActiveTab]);

  const fetchCurrentUser = async () => {
    try {
      const userData = await djangoApi.getCurrentUser();
      setCurrentUser(userData);
    } catch (error) {
      console.error("Failed to fetch current user for sidebar:", error);
      
      // Fallback: try to get basic info from localStorage or token
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        try {
          const parsedUser = JSON.parse(storedUserData);
          setCurrentUser(parsedUser);
        } catch (e) {
          // If localStorage fails, try token
          const token = localStorage.getItem('access_token');
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              setCurrentUser({
                id: payload.user_id || 0,
                username: payload.username || 'User',
                is_superuser: payload.is_superuser || false,
                is_staff: payload.is_staff || false,
                role: payload.role || 'Staff',
                permissions: payload.permissions || [],
              });
            } catch (decodeError) {
              // Ultimate fallback
              setCurrentUser({
                id: 0,
                username: 'User',
                is_superuser: false,
                role: 'Staff',
                permissions: [],
              });
            }
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const filterMenuItems = () => {
    console.log('Filtering menu items...');
    console.log('Current User:', currentUser);
    
    if (!currentUser) {
      console.log('No current user, returning empty menu');
      return [];
    }
    
    // If user is superuser, return all menu items
    if (currentUser.is_superuser) {
      console.log('User is superuser, returning all menu items');
      return MENU_PERMISSIONS;
    }
    
    console.log('Checking permissions for user with role:', currentUser.role);
    const permissionChecker = new PermissionChecker(currentUser);
    
    const filteredItems = MENU_PERMISSIONS.filter(item => {
      // If no required role, show to all authenticated users
      if (!item.requiredRole || item.requiredRole.length === 0) {
        console.log(`Item ${item.id}: No role required, showing`);
        return true;
      }
      
      // Check if user has any of the required roles
      const hasRole = item.requiredRole.some(role => {
        const has = permissionChecker.hasRole(role);
        console.log(`Item ${item.id}: Checking role ${role}: ${has}`);
        return has;
      });
      
      console.log(`Item ${item.id}: Final access: ${hasRole}`);
      return hasRole;
    });
    
    console.log('Final filtered items:', filteredItems.map(i => i.id));
    return filteredItems;
  };

  if (loading) {
    return (
      <div className={cn(
        "fixed left-0 top-0 h-full bg-blue-900 dark:bg-gray-900 text-white transition-all duration-300 z-30",
        isOpen ? "w-64" : "w-16"
      )}>
        <div className="p-4 border-b border-blue-800 dark:border-gray-700">
          <div className="flex items-center justify-center">
            <img
              src="/Uploads/FaceIt logo no bg__cropped.png"
              alt="FACE.IT Logo"
              className="w-8 h-8"
            />
            {isOpen && (
              <h1 className="text-xl font-bold ml-3">FACE.IT</h1>
            )}
          </div>
        </div>
        <nav className="mt-4">
          <div className="px-4 py-3 text-center text-gray-400">
            {isOpen ? "Loading menu..." : "..."}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-blue-900 dark:bg-gray-900 text-white transition-all duration-300 z-30",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="p-4 border-b border-blue-800 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <img
            src="/Uploads/FaceIt logo no bg__cropped.png"
            alt="FACE.IT Logo"
            className="w-8 h-8"
          />
          {isOpen && (
            <h1 className="text-xl font-bold ml-3">FACE.IT</h1>
          )}
        </div>
      </div>

      <nav className="mt-4">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center px-4 py-3 text-left hover:bg-blue-800 dark:hover:bg-gray-800 transition-colors",
                activeTab === item.id && "bg-blue-800 dark:bg-gray-800 border-r-4 border-blue-400 dark:border-blue-500"
              )}
              title={!isOpen ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {isOpen && <span className="ml-3">{item.label}</span>}
            </button>
          );
        })}

        {/* User info at bottom when sidebar is open */}
        {isOpen && currentUser && (
          <div className="absolute bottom-4 left-4 right-4 text-xs text-gray-300 border-t border-blue-800 pt-3">
            <div className="truncate">
              <span className="text-gray-400">User:</span> {currentUser.username}
            </div>
            <div className="truncate">
              <span className="text-gray-400">Role:</span> {new PermissionChecker(currentUser).getDisplayRole()}
            </div>
            {currentUser.is_superuser && (
              <div className="text-yellow-400 font-medium">⭐ Super Admin</div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};