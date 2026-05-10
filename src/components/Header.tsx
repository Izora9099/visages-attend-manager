import { Bell, Search, User, Settings, LogOut, Moon, Sun, Command } from "lucide-react";
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

interface HeaderProps {
  onMenuClick: () => void;
  pageLabel?: string;
}

export const Header = ({ pageLabel }: HeaderProps) => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
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
    <header className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur-md border-b border-hairline">
      <div className="flex items-center justify-between h-full px-6 gap-6">
        {/* Left — breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <p className="eyebrow shrink-0">FACE.IT</p>
          <span className="text-muted-foreground/40">/</span>
          <p className="text-sm font-medium truncate">{pageLabel || 'Workspace'}</p>
        </div>

        {/* Center — search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 h-4 w-4 pointer-events-none" />
            <Input
              placeholder="Search students, courses, sessions…"
              className="pl-9 pr-16 h-9 bg-secondary/50 border-transparent hover:bg-secondary/80 focus-visible:bg-card"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded border border-hairline bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={toggleDarkMode} className="text-muted-foreground hover:text-foreground">
            {darkMode ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </Button>
          <Button variant="ghost" size="icon-sm" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
          </Button>

          <div className="h-6 w-px bg-hairline mx-2" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-md hover:bg-secondary/60 transition-colors focus-ring">
                <div className="h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold">
                  {getInitials()}
                </div>
                <div className="hidden lg:flex flex-col items-start leading-tight">
                  <span className="text-sm font-medium">{user?.first_name || user?.username || '—'}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
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
