import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Header, Sidebar } from "@/components/layout";
import { RoleBasedDashboard } from "@/features/dashboard";
import { Students } from "@/features/students";
import { TeacherManagement } from "@/features/teachers";
import { CourseManagement } from "@/features/courses";
import { TimetableManager } from "@/features/timetable";
import { AttendanceTable } from "@/features/attendance";
import { Reports } from "@/features/reports";
import {
  AdminUsers,
  FacialRecognition,
  SecurityDashboard,
  SystemSettings,
} from "@/features/admin";

const TAB_LABELS: Record<string, string> = {
  dashboard: "Overview",
  timetable: "Timetable",
  courses: "Courses",
  students: "Students",
  teachers: "Teachers",
  attendance: "Attendance",
  reports: "Reports",
  "facial-recognition": "Facial Recognition",
  "admin-users": "Admin Users",
  security: "Security",
  "system-settings": "Settings",
};

const VALID_TABS = new Set(Object.keys(TAB_LABELS));

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { user } = useAuth();

  const rawTab = searchParams.get("tab") ?? "dashboard";
  const activeTab = VALID_TABS.has(rawTab) ? rawTab : "dashboard";

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab }, { replace: true });
  };

  // Scroll to top whenever the active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeTab]);

  const userPermissions = useMemo(
    () =>
      user
        ? {
            id: user.id,
            username: user.username,
            is_superuser: user.is_superuser,
            role: user.role as "staff" | "superadmin" | "teacher",
            permissions: user.permissions,
          }
        : { id: 0, username: "User", is_superuser: false, role: "staff" as const, permissions: [] },
    [user]
  );

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
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className={`transition-all duration-300 ${isMobile ? "ml-0" : sidebarOpen ? "ml-64" : "ml-[68px]"}`}>
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          pageLabel={TAB_LABELS[activeTab]}
        />
        <main key={activeTab} className="px-8 py-10 max-w-[1400px] mx-auto animate-fade-in">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
