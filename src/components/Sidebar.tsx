// src/components/Sidebar.tsx - Updated to use auth context while maintaining blue design

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Shield, 
  Camera,
  BookOpen,
  GraduationCap,
  FileText,
  UserCog
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// Menu items configuration based on roles
const getMenuItems = (user: any) => {
  const baseItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard }
  ];

  if (user?.is_superuser || user?.role === 'superadmin') {
    return [
      ...baseItems,
      { id: "students", label: "Students", icon: Users },
      { id: "teachers", label: "Teachers", icon: GraduationCap },
      { id: "courses", label: "Courses", icon: BookOpen },
      { id: "timetable", label: "Timetable", icon: Calendar },
      { id: "attendance", label: "Attendance", icon: FileText },
      { id: "facial-recognition", label: "Face Recognition", icon: Camera },
      { id: "reports", label: "Reports", icon: BarChart3 },
      { id: "admin-users", label: "Admin Users", icon: UserCog },
      { id: "security", label: "Security", icon: Shield },
      { id: "system-settings", label: "Settings", icon: Settings }
    ];
  }

  if (user?.role === 'staff') {
    return [
      ...baseItems,
      { id: "students", label: "Students", icon: Users },
      { id: "courses", label: "Courses", icon: BookOpen },
      { id: "attendance", label: "Attendance", icon: FileText },
      { id: "reports", label: "Reports", icon: BarChart3 }
    ];
  }

  if (user?.role === 'teacher') {
    return [
      ...baseItems,
      { id: "students", label: "My Students", icon: Users },
      { id: "courses", label: "My Courses", icon: BookOpen },
      { id: "attendance", label: "Attendance", icon: FileText },
      { id: "facial-recognition", label: "Face Recognition", icon: Camera }
    ];
  }

  return baseItems;
};

// Permission checker class for role display
class PermissionChecker {
  constructor(private user: any) {}
  
  getDisplayRole(): string {
    if (!this.user) return "User";
    
    if (this.user.is_superuser) {
      return "Super Admin";
    }
    
    switch (this.user.role) {
      case 'superadmin':
        return "Super Admin";
      case 'staff':
        return "Staff";
      case 'teacher':
        return "Teacher";
      default:
        return this.user.role || "User";
    }
  }
}

export const Sidebar = ({ activeTab, setActiveTab, isOpen, onToggle }: SidebarProps) => {
  const { user } = useAuth();
  const [visibleMenuItems, setVisibleMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log('Filtering menu items...');
      console.log('Current User:', user);
      
      const menuItems = getMenuItems(user);
      setVisibleMenuItems(menuItems);
      
      if (user.is_superuser) {
        console.log('User is superuser, returning all menu items');
      } else {
        console.log(`User role: ${user.role}, filtered menu items:`, menuItems);
      }
      
      // If current tab is not in visible items, switch to first available tab
      if (menuItems.length > 0 && !menuItems.some(item => item.id === activeTab)) {
        setActiveTab(menuItems[0].id);
      }
    }
    setLoading(false);
  }, [user, activeTab, setActiveTab]);

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
      "fixed left-0 top-0 h-full bg-blue-900 dark:bg-gray-900 text-white transition-all duration-300 z-40",
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

      <nav className="mt-4 flex flex-col h-[calc(100%-80px)]">
        <div className="flex-1 overflow-y-auto">
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
        </div>

        {/* User info at bottom */}
        {isOpen && user && (
          <div className="mt-auto border-t border-blue-800 dark:border-gray-700">
            <div className="px-4 py-3">
              <div className="font-medium text-sm mb-1">
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user.username}
              </div>
              <div className="text-xs text-blue-300 dark:text-blue-400 flex items-center gap-1">
                {user.is_superuser && <span>⭐</span>}
                <span>{new PermissionChecker(user).getDisplayRole().toLowerCase()}</span>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};