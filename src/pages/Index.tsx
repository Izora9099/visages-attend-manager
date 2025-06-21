
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Dashboard } from "@/components/Dashboard";
import { Students } from "@/components/Students";
import { AttendanceTable } from "@/components/AttendanceTable";
import { Reports } from "@/components/Reports";
import { AdminUsers } from "@/components/AdminUsers";
import { FacialRecognition } from "@/components/FacialRecognition";
import { SystemSettings } from "@/components/SystemSettings";
import { SecurityDashboard } from "@/components/SecurityDashboard";
const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "students":
        return <Students />;
      case "attendance":
        return <AttendanceTable />;
      case "facial-recognition":
        return <FacialRecognition />;
      case "reports":
        return <Reports />;
      case "admin-users":
        return <AdminUsers />;
      case "security":
        return <SecurityDashboard />;
      case "system-settings":
        return <SystemSettings />;
      default:
        return <Dashboard />;
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
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
