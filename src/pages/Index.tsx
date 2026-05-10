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
import { CourseManagement } from "@/components/CourseManagement";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const userPermissions = user
    ? { id: user.id, username: user.username, is_superuser: user.is_superuser, role: user.role, permissions: user.permissions }
    : { id: 0, username: 'User', is_superuser: false, role: 'staff', permissions: [] };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":        return <RoleBasedDashboard userPermissions={userPermissions} setActiveTab={setActiveTab} />;
      case "timetable":        return <TimetableManager />;
      case "courses":          return <CourseManagement />;
      case "students":         return <Students />;
      case "teachers":         return <TeacherManagement />;
      case "attendance":       return <AttendanceTable />;
      case "reports":          return <Reports />;
      case "facial-recognition": return <FacialRecognition />;
      case "admin-users":      return <AdminUsers />;
      case "security":         return <SecurityDashboard />;
      case "system-settings":  return <SystemSettings />;
      default:                 return <RoleBasedDashboard userPermissions={userPermissions} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Index;
