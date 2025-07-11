// src/pages/Index.tsx - Fixed layout to prevent header overlap

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { RoleBasedDashboard } from "@/components/RoleBasedDashboard";
import { Students } from "@/components/Students";
import { AttendanceTable } from "@/components/AttendanceTable";
import { Reports } from "@/components/Reports";
import { AdminUsers } from "@/components/AdminUsers";
import { FacialRecognition } from "@/components/FacialRecognition";
import { SystemSettings } from "@/components/SystemSettings";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { TimetableManager } from "@/components/TimetableManager";
import { TeacherManagement } from "@/components/TeacherManagement";
import { CourseManagement } from "@/components/CourseManagement";
import { djangoApi } from "@/services/djangoApi";
import { UserPermissions } from "@/types/permissions";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const fetchUserPermissions = async () => {
    try {
      const userData = await djangoApi.getCurrentUser();
      setUserPermissions(userData);
    } catch (error) {
      console.error("Failed to fetch user permissions:", error);
      // Fallback to basic permissions
      setUserPermissions({
        id: 0,
        username: 'User',
        is_superuser: false,
        role: 'staff',
        permissions: [],
      });
    }
  };

  const renderContent = () => {
    if (!userPermissions) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <RoleBasedDashboard userPermissions={userPermissions} setActiveTab={setActiveTab} />;
      case "timetable":
        return <TimetableManager />;
      case "courses":
        return <CourseManagement />;
      case "students":
        return <Students />;
      case "teachers":
        return <TeacherManagement />;
      case "attendance":
        return <AttendanceTable />;
      case "reports":
        return <Reports />;
      case "facial-recognition":
        return <FacialRecognition />;
      case "admin-users":
        return <AdminUsers />;
      case "security":
        return <SecurityDashboard />;
      case "system-settings":
        return <SystemSettings />;
      default:
        return <RoleBasedDashboard userPermissions={userPermissions} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidebar - Fixed positioning */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      {/* Main content area - Positioned to the right of sidebar */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header - Should not be fixed/sticky when sidebar is fixed */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;