import { Menu, Bell, Search, User, Settings, LogOut, Moon, Sun } from "lucide-react";
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
import { djangoApi } from "@/services/djangoApi";

interface HeaderProps {
  onMenuClick: () => void;
}

interface UserInfo {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Fetch current user information
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Try to get user info from API
        const userData = await djangoApi.getCurrentUser();
        setCurrentUser(userData);
      } catch (error) {
        console.warn('Could not fetch user info from API, using fallback');
        
        // Fallback: Try to decode JWT token to get user info
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUser({
            username: payload.username || 'User',
            email: payload.email || '',
            first_name: payload.first_name || '',
            last_name: payload.last_name || '',
          });
        } catch (decodeError) {
          console.error('Could not decode token:', decodeError);
          // Ultimate fallback
          setCurrentUser({
            username: 'Admin User',
            email: '',
            first_name: 'Admin',
            last_name: 'User',
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    try {
      // Call Django logout API (will handle gracefully if endpoint doesn't exist)
      await djangoApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Navigate to login and prevent going back
      navigate('/login', { replace: true });
      
      // Clear navigation history to prevent back button access
      window.history.replaceState(null, '', '/login');
    }
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleSettings = () => {
    console.log('Settings clicked - navigate to Django settings');
  };

  // Get display name for user
  const getDisplayName = () => {
    if (!currentUser) return "Loading...";
    
    if (currentUser.first_name) {
      return currentUser.first_name;
    }
    
    if (currentUser.name) {
      return currentUser.name.split(' ')[0]; // Get first part of name
    }
    
    return currentUser.username;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser) return "U";
    
    if (currentUser.first_name && currentUser.last_name) {
      return `${currentUser.first_name[0]}${currentUser.last_name[0]}`.toUpperCase();
    }
    
    if (currentUser.first_name) {
      return currentUser.first_name[0].toUpperCase();
    }
    
    if (currentUser.name) {
      const nameParts = currentUser.name.split(' ');
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    }
    
    return currentUser.username[0].toUpperCase();
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu size={20} />
          </Button>
        
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold text-blue-900 dark:text-blue-400">FACE.IT</span>
          </div>
        
          <div className="relative ml-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <Input
              placeholder="Search students, attendance..."
              className="pl-10 w-96 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="relative hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          
          <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 dark:hover:bg-gray-700">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {getUserInitials()}
                  </span>
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {loading ? "Loading..." : getDisplayName()}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {currentUser?.email && (
                <>
                  <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                    {currentUser.email}
                  </div>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                </>
              )}
              <DropdownMenuItem 
                onClick={handleProfile}
                className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleSettings}
                className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};