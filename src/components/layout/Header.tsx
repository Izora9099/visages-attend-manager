import { Search, User, Settings, LogOut, Moon, Sun, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationsPanel } from "@/components/shared/NotificationsPanel";

interface HeaderProps {
  onMenuClick: () => void;
  pageLabel?: string;
}

export const Header = ({ onMenuClick, pageLabel }: HeaderProps) => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const applyTheme = (dark: boolean) => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.dataset.theme = dark ? 'dark' : 'light';
  };

  useEffect(() => {
    let savedTheme: string | null = null;
    try { savedTheme = localStorage.getItem('theme'); } catch { /* storage unavailable */ }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setDarkMode(dark);
    applyTheme(dark);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    applyTheme(next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* storage unavailable */ }
  };

  const handleLogout = async () => {
    try { await logout(); }
    catch { navigate('/login', { replace: true }); }
  };

  const getInitials = () => {
    if (!user) return "U";
    if (user.first_name && user.last_name) return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    return (user.first_name || user.username)[0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 h-header border-b border-hairline bg-surface">
      <div className="flex h-full items-center gap-4 px-4 md:px-6">
        {/* Left — menu toggle + breadcrumb */}
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Toggle navigation"
            className="shrink-0"
          >
            <Menu aria-hidden="true" className="!h-[18px] !w-[18px]" />
          </Button>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm text-ink-muted">
            <span className="hidden whitespace-nowrap sm:inline">FACE.IT</span>
            <span aria-hidden="true" className="hidden text-line sm:inline">/</span>
            <span aria-current="page" className="truncate font-medium text-ink">{pageLabel || 'Workspace'}</span>
          </nav>
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden w-[280px] md:block">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input
              type="search"
              aria-label="Search"
              placeholder="Search students, courses, sessions"
              className="bg-paper pl-9"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            aria-label={darkMode ? "Switch to light theme" : "Switch to dark theme"}
          >
            {darkMode ? <Sun aria-hidden="true" className="!h-[18px] !w-[18px]" /> : <Moon aria-hidden="true" className="!h-[18px] !w-[18px]" />}
          </Button>
          <NotificationsPanel />

          <div aria-hidden="true" className="mx-1 h-6 w-px bg-hairline" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-md py-1 pl-1 pr-2 transition-colors duration-120 hover:bg-surface-sunken">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-surface-sunken text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_var(--hairline)]">
                  {getInitials()}
                </div>
                <div className="hidden flex-col items-start lg:flex">
                  <span className="text-[13px] font-medium leading-[18px]">{user?.first_name || user?.username || '—'}</span>
                  <span className="text-[10px] font-medium uppercase leading-[14px] tracking-[0.12em] text-ink-muted">
                    {user?.is_superuser ? 'Super admin' : (user?.role || 'User')}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user?.email && (
                <>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/system-settings')}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
