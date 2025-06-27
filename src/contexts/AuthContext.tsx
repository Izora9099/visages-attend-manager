// src/contexts/AuthContext.tsx - Backward compatible version

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { djangoApi } from '@/services/djangoApi';
import { UserPermissions } from '@/types/permissions';

interface AuthContextType {
  user: UserPermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  hasRole?: (role: string) => boolean; // Optional for backward compatibility
}

// Export AuthContext for components that import it directly
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!user && !!localStorage.getItem('access_token');

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Try to get current user info
      try {
        const userData = await djangoApi.getCurrentUser();
        setUser(userData);
      } catch (error: any) {
        console.warn('Failed to get user data:', error);
        
        // If we have a refresh token, try to refresh
        if (refreshToken && error.message?.includes('Authentication')) {
          try {
            await djangoApi.refreshToken();
            const userData = await djangoApi.getCurrentUser();
            setUser(userData);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            logout();
          }
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);

      // Authenticate with Django
      const response = await djangoApi.login(username, password);
      
      if (!response.access) {
        throw new Error('Invalid response from server');
      }

      console.log('Login response:', response);

      // Store tokens immediately
      localStorage.setItem('access_token', response.access);
      if (response.refresh) {
        localStorage.setItem('refresh_token', response.refresh);
      }

      // Get user data after successful login
      let userData: UserPermissions;
      try {
        userData = await djangoApi.getCurrentUser();
        console.log('User data from getCurrentUser:', userData);
      } catch (userError) {
        console.warn('Could not fetch user data after login, using login response:', userError);
        
        // Try to extract user info from login response
        if (response.user) {
          userData = {
            id: response.user.id || 1,
            username: response.user.username || username,
            email: response.user.email || '',
            first_name: response.user.first_name || '',
            last_name: response.user.last_name || '',
            name: response.user.name || '',
            phone: response.user.phone || '',
            is_active: response.user.is_active !== undefined ? response.user.is_active : true,
            is_staff: response.user.is_staff !== undefined ? response.user.is_staff : false,
            is_superuser: response.user.is_superuser || false,
            role: response.user.is_superuser ? 'superadmin' : (response.user.role || 'staff'),
            permissions: response.user.permissions || []
          };
        } else {
          // Decode token to get user info
          try {
            const payload = JSON.parse(atob(response.access.split('.')[1]));
            userData = {
              id: payload.user_id || 1,
              username: payload.username || username,
              email: payload.email || '',
              first_name: payload.first_name || '',
              last_name: payload.last_name || '',
              name: payload.name || '',
              phone: payload.phone || '',
              is_active: true,
              is_staff: payload.is_staff || false,
              is_superuser: payload.is_superuser || false,
              role: payload.is_superuser ? 'superadmin' : (payload.role || 'staff'),
              permissions: payload.permissions || []
            };
          } catch (decodeError) {
            console.error('Could not decode token:', decodeError);
            // Final fallback
            userData = {
              id: 1,
              username: username,
              email: '',
              first_name: '',
              last_name: '',
              name: '',
              phone: '',
              is_active: true,
              is_staff: true,
              is_superuser: true,
              role: 'superadmin',
              permissions: []
            };
          }
        }
      }

      // Store user data
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);

      // Navigate to dashboard
      navigate('/', { replace: true });
      
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Clear any stored tokens on login failure
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear tokens and user data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    
    // Navigate to login page
    navigate('/login', { replace: true });
  };

  const refreshAuth = async (): Promise<void> => {
    try {
      await djangoApi.refreshToken();
      const userData = await djangoApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Auth refresh failed:', error);
      logout();
    }
  };

  // Backward compatibility function
  const hasRole = (role: string): boolean => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.role === role;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
    hasRole, // Add this for backward compatibility
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export useAuth hook for components that import it from this file
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};