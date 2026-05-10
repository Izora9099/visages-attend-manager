import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, Calendar, BarChart3, Settings, Shield,
  Camera, BookOpen, GraduationCap, FileText, UserCog, ScanFace,
  ChevronsLeft, ChevronsRight,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface MenuItem { id: string; label: string; icon: React.ElementType; group?: string }

function getMenuItems(role: string, isSuperuser: boolean): MenuItem[] {
  const base: MenuItem[] = [{ id: "dashboard", label: "Overview", icon: LayoutDashboard, group: "Workspace" }];

  if (isSuperuser || role === "superadmin") {
    return [
      ...base,
      { id: "students",           label: "Students",       icon: Users,         group: "People" },
      { id: "teachers",           label: "Teachers",       icon: GraduationCap, group: "People" },
      { id: "admin-users",        label: "Admin users",    icon: UserCog,       group: "People" },
      { id: "courses",            label: "Courses",        icon: BookOpen,      group: "Academics" },
      { id: "timetable",          label: "Timetable",      icon: Calendar,      group: "Academics" },
      { id: "attendance",         label: "Attendance",     icon: FileText,      group: "Records" },
      { id: "facial-recognition", label: "Recognition",    icon: Camera,        group: "Records" },
      { id: "reports",            label: "Reports",        icon: BarChart3,     group: "Records" },
      { id: "security",           label: "Security",       icon: Shield,        group: "System" },
      { id: "system-settings",    label: "Settings",       icon: Settings,      group: "System" },
    ];
  }

  if (role === "staff") {
    return [
      ...base,
      { id: "students",   label: "Students",   icon: Users,    group: "People" },
      { id: "courses",    label: "Courses",    icon: BookOpen, group: "Academics" },
      { id: "attendance", label: "Attendance", icon: FileText, group: "Records" },
      { id: "reports",    label: "Reports",    icon: BarChart3, group: "Records" },
    ];
  }

  if (role === "teacher") {
    return [
      ...base,
      { id: "students",           label: "My students", icon: Users,    group: "Teaching" },
      { id: "courses",            label: "My courses",  icon: BookOpen, group: "Teaching" },
      { id: "attendance",         label: "Attendance",  icon: FileText, group: "Teaching" },
      { id: "facial-recognition", label: "Recognition", icon: Camera,   group: "Teaching" },
    ];
  }

  return base;
}

function displayRole(role: string, isSuperuser: boolean): string {
  if (isSuperuser || role === "superadmin") return "Super admin";
  if (role === "staff") return "Staff";
  if (role === "teacher") return "Teacher";
  return role || "User";
}

export const Sidebar = ({ activeTab, setActiveTab, isOpen, onToggle }: SidebarProps) => {
  const { user } = useAuth();
  const items = user ? getMenuItems(user.role, user.is_superuser) : [];

  if (user && items.length > 0 && !items.some(item => item.id === activeTab)) {
    setActiveTab(items[0].id);
  }

  // Group items
  const groups = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const g = item.group ?? "Workspace";
    (acc[g] ||= []).push(item);
    return acc;
  }, {});

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-40 transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-[68px]"
      )}
    >
      {/* Brand */}
      <div className={cn("h-16 flex items-center border-b border-sidebar-border", isOpen ? "px-5" : "px-3 justify-center")}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-sidebar-primary flex items-center justify-center shadow-sm shrink-0">
            <ScanFace className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {isOpen && (
            <div className="leading-tight">
              <p className="font-display text-base tracking-tight">FACE.IT</p>
              <p className="text-[9px] uppercase tracking-[0.22em] text-sidebar-foreground/50">Admin Console</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        {Object.entries(groups).map(([group, gItems]) => (
          <div key={group} className="mb-4">
            {isOpen && (
              <p className="px-5 mb-1.5 text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/40 font-medium">
                {group}
              </p>
            )}
            <ul className={cn("space-y-0.5", isOpen ? "px-3" : "px-2")}>
              {gItems.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      title={!isOpen ? item.label : undefined}
                      className={cn(
                        "group relative w-full flex items-center rounded-md text-sm font-medium transition-all duration-200",
                        isOpen ? "px-3 py-2 gap-3" : "h-10 w-10 mx-auto justify-center",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-accent" />
                      )}
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {isOpen && <span className="truncate">{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        {isOpen && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-medium uppercase">
              {(user.first_name?.[0] || user.username[0])}{user.last_name?.[0] || ''}
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-sm font-medium truncate">
                {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
                {displayRole(user.role, user.is_superuser)}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center justify-center rounded-md h-9 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors",
          )}
          title={isOpen ? "Collapse" : "Expand"}
        >
          {isOpen ? <ChevronsLeft className="h-4 w-4" /> : <ChevronsRight className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};
