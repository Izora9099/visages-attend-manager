
import { Menu, Bell, Search, User, Settings, LogOut, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

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

  // Function to handle logout - ready for Django integration
  const handleLogout = () => {
    // TODO: Implement Django logout API call
    console.log('Logout clicked - integrate with Django auth');
  };

  // Function to handle profile - ready for Django integration
  const handleProfile = () => {
    // TODO: Navigate to Django profile page
    console.log('Profile clicked - navigate to Django profile');
  };

  // Function to handle settings - ready for Django integration
  const handleSettings = () => {
    // TODO: Navigate to Django settings page
    console.log('Settings clicked - navigate to Django settings');
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
           { /*  <img 
              src="/lovable-uploads/7eeb388c-1566-4e45-a879-929c5bc7b9bb.png" 
              alt="FACE.IT Logo" 
              className="w-8 h-8"
            />  */
       }
            <span className="text-xl font-bold text-blue-900 dark:text-blue-400">FACE.IT</span>
          </div>
        
          <div className="relative ml-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <Input
              placeholder="Search students, attendance..."
              className="pl-10 w-96 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              // TODO: Implement search functionality with Django backend
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
                  <User size={16} className="text-white" />
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Admin User</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
