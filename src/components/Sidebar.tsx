
import { Users, ClipboardList, Camera, BarChart3, UserCog, Layout } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Layout },
  { id: "students", label: "Students", icon: Users },
  { id: "attendance", label: "Attendance", icon: ClipboardList },
  { id: "facial-recognition", label: "Face Recognition", icon: Camera },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "admin-users", label: "Admin Users", icon: UserCog },
];

export const Sidebar = ({ activeTab, setActiveTab, isOpen, onToggle }: SidebarProps) => {
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
        {menuItems.map((item) => {
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
      </nav>
    </div>
  );
};
