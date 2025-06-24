import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '@/constants/roles';
import { djangoApi } from '@/services/djangoApi';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_superuser: boolean;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
          // Set the token in the API client
          djangoApi.setAuthToken(accessToken);
          
          // Fetch current user
          const userData = await djangoApi.getCurrentUser();
          
          // Ensure superuser has the correct role
          const userRole = userData.is_superuser ? ROLES.SUPER_ADMIN : userData.role;
          
          setUser({
            id: userData.id,
            username: userData.username,
            email: userData.email,
            role: userRole,
            is_superuser: userData.is_superuser,
            first_name: userData.first_name,
            last_name: userData.last_name,
          });
        } else {
          // If no token, ensure user is null and redirect to login
          setUser(null);
          if (window.location.pathname !== '/login') {
            navigate('/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear all auth tokens on failure
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        delete djangoApi.defaults.headers.common['Authorization'];
        setUser(null);
        if (window.location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const login = async (username: string, password: string) => {
    try {
      const response = await djangoApi.login(username, password);
      const { access, refresh, user: userData } = response.data;
      
      // Ensure superuser has the correct role
      const userRole = userData.is_superuser ? ROLES.SUPER_ADMIN : userData.role;
      
      // Store tokens
      localStorage.setItem('access_token', access);
      if (refresh) {
        localStorage.setItem('refresh_token', refresh);
      }
      djangoApi.setAuthToken(access);
      
      const user = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userRole,
        is_superuser: userData.is_superuser,
        first_name: userData.first_name,
        last_name: userData.last_name,
      };
      
      setUser(user);
      
      // Store user data in localStorage for quick access
      localStorage.setItem('user_data', JSON.stringify(user));
      
      // Redirect to home
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout API if needed
      await djangoApi.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with client-side cleanup even if API call fails
    } finally {
      // Clear all auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      delete djangoApi.defaults.headers.common['Authorization'];
      
      // Clear user state
      setUser(null);
      
      // Navigate to login with replace to prevent going back
      navigate('/login', { replace: true });
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.role === role;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
