import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard, Users, Calendar, BarChart3, Settings, Shield,
  ScanFace, BookOpen, GraduationCap, FileText, UserCog,
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
      { id: "facial-recognition", label: "Recognition",    icon: ScanFace,      group: "Records" },
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
      { id: "facial-recognition", label: "Recognition", icon: ScanFace, group: "Teaching" },
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
  const isMobile = useIsMobile();
  const items = user ? getMenuItems(user.role, user.is_superuser) : [];

  useEffect(() => {
    if (!user) return;
    const currentItems = getMenuItems(user.role, user.is_superuser);
    if (currentItems.length > 0 && !currentItems.some(item => item.id === activeTab)) {
      setActiveTab(currentItems[0].id);
    }
  }, [user, activeTab, setActiveTab]);

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (isMobile) onToggle();
  };

  // Group items
  const groups = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const g = item.group ?? "Workspace";
    (acc[g] ||= []).push(item);
    return acc;
  }, {});

  // On mobile the rail is an overlay when open, hidden when closed
  const mobileVisible = isMobile && isOpen;
  const expanded = isMobile || isOpen;

  return (
    <>
      {mobileVisible && (
        <div
          className="fixed inset-0 z-30 bg-[var(--scrim)] md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

    <aside
      aria-label="Main navigation"
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-rail-hairline bg-rail font-sans text-rail-ink transition-[width,transform] duration-200 ease-out",
        isMobile
          ? isOpen ? "w-rail translate-x-0" : "w-rail -translate-x-full"
          : isOpen ? "w-rail" : "w-rail-collapsed"
      )}
    >
      {/* Brand */}
      <div className={cn("flex h-header items-center gap-2.5 border-b border-rail-hairline", expanded ? "px-5" : "justify-center")}>
        <img src="/Uploads/FaceIt logo no bg__cropped.png" alt={expanded ? "" : "FACE.IT"} className="h-8 w-8 shrink-0 object-contain" />
        {expanded && (
          <div>
            <p className="font-display text-base font-bold leading-[18px] tracking-[0.02em]">FACE.IT</p>
            <p className="text-[9px] font-medium uppercase leading-3 tracking-[0.2em] text-rail-muted">Attendance console</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
        {Object.entries(groups).map(([group, gItems]) => (
          <div key={group}>
            {expanded && (
              <p className="mb-1.5 px-3 text-[10px] font-medium uppercase leading-[14px] tracking-[0.18em] text-rail-muted">
                {group}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {gItems.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item.id)}
                      aria-current={active ? "page" : undefined}
                      aria-label={expanded ? undefined : item.label}
                      title={expanded ? undefined : item.label}
                      className={cn(
                        "relative flex items-center rounded-md text-sm font-medium transition-colors duration-120 hover:bg-rail-active hover:text-rail-ink",
                        expanded ? "h-9 w-full gap-3 px-3 text-left" : "mx-auto h-10 w-10 justify-center",
                        active ? "bg-rail-active text-rail-ink" : "text-rail-muted"
                      )}
                    >
                      {active && (
                        <span aria-hidden="true" className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-sm bg-scan" />
                      )}
                      <Icon aria-hidden="true" className={cn("h-[18px] w-[18px] shrink-0", active && "text-scan-pale")} />
                      {expanded && <span className="truncate">{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-rail-hairline p-3">
        {expanded && user && (
          <div className="mb-2 flex items-center gap-3 p-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rail-active text-xs font-semibold uppercase">
              {(user.first_name?.[0] || user.username[0])}{user.last_name?.[0] || ''}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium leading-[18px]">
                {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
              </p>
              <p className="text-[10px] font-medium uppercase leading-[14px] tracking-[0.12em] text-rail-muted">
                {displayRole(user.role, user.is_superuser)}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex h-9 w-full items-center justify-center rounded-md text-rail-muted transition-colors duration-120 hover:bg-rail-active hover:text-rail-ink"
          aria-label={isOpen ? "Collapse navigation" : "Expand navigation"}
          title={isOpen ? "Collapse" : "Expand"}
        >
          {isOpen ? <ChevronsLeft aria-hidden="true" className="h-4 w-4" /> : <ChevronsRight aria-hidden="true" className="h-4 w-4" />}
        </button>
      </div>
    </aside>
    </>
  );
};
