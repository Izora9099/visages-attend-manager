
import { useState } from "react";
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
import { useEffect } from "react";
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
        role: 'Staff',
        permissions: [],
      });
    }
  };

  const renderContent = () => {
    if (!userPermissions) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p>Loading...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <RoleBasedDashboard userPermissions={userPermissions} />;
      case "timetable":
        return <TimetableManager />;
      case "courses":
        return <TimetableManager />;
      case "sessions":
        return <TimetableManager />;
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
        return <RoleBasedDashboard userPermissions={userPermissions} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex w-full transition-colors">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
