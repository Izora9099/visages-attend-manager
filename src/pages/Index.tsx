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

const TAB_LABELS: Record<string, string> = {
  dashboard: "Overview",
  timetable: "Timetable",
  courses: "Courses",
  students: "Students",
  teachers: "Teachers",
  attendance: "Attendance",
  reports: "Reports",
  "facial-recognition": "Facial recognition",
  "admin-users": "Admin users",
  security: "Security",
  "system-settings": "Settings",
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const userPermissions = user
    ? { id: user.id, username: user.username, is_superuser: user.is_superuser, role: user.role, permissions: user.permissions }
    : { id: 0, username: 'User', is_superuser: false, role: 'staff', permissions: [] };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":          return <RoleBasedDashboard userPermissions={userPermissions} setActiveTab={setActiveTab} />;
      case "timetable":          return <TimetableManager />;
      case "courses":            return <CourseManagement />;
      case "students":           return <Students />;
      case "teachers":           return <TeacherManagement />;
      case "attendance":         return <AttendanceTable />;
      case "reports":            return <Reports />;
      case "facial-recognition": return <FacialRecognition />;
      case "admin-users":        return <AdminUsers />;
      case "security":           return <SecurityDashboard />;
      case "system-settings":    return <SystemSettings />;
      default:                   return <RoleBasedDashboard userPermissions={userPermissions} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-[68px]'}`}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} pageLabel={TAB_LABELS[activeTab]} />
        <main key={activeTab} className="px-8 py-10 max-w-[1400px] mx-auto animate-fade-in">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
