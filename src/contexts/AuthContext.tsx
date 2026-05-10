import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUsers } from '@/data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  role: string;
  is_superuser: boolean;
  is_staff?: boolean;
  permissions: string[];
}

interface StoredSession {
  sessionId: string;
  userId: number;
  role: string;
  /** Unix timestamp (ms) */
  expiresAt: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = 'faceit_session';
// 8-hour session. sessionStorage already clears on tab close; this caps long-lived tabs.
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readSession(): StoredSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as StoredSession;
    if (Date.now() > session.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function writeSession(userId: number, role: string): StoredSession {
  const session: StoredSession = {
    sessionId: crypto.randomUUID(),
    userId,
    role,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function buildAuthUser(raw: (typeof adminUsers)[number]): AuthUser {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    first_name: raw.first_name,
    last_name: raw.last_name,
    full_name: raw.full_name,
    role: raw.role,
    is_superuser: raw.role === 'superadmin',
    is_staff: raw.role !== 'teacher',
    permissions: raw.permissions,
  };
}

// ─── Context ─────────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session on mount
  useEffect(() => {
    const session = readSession();
    if (session) {
      const match = adminUsers.find(u => u.id === session.userId);
      if (match) setUser(buildAuthUser(match));
      else clearSession();
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    if (!username || !password) throw new Error('Username and password are required.');

    const match = adminUsers.find(u => u.username === username);
    if (!match) throw new Error('Invalid username or password.');

    // In mock mode passwords are not hashed — we just check they're non-empty.
    // Replace this block with a real API call when the backend is ready.
    void password;

    writeSession(match.id, match.role);
    setUser(buildAuthUser(match));
    navigate('/', { replace: true });
  }, [navigate]);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const hasRole = useCallback((role: string) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.role === role;
  }, [user]);

  const hasPermission = useCallback((permission: string) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.permissions.includes(permission);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      hasRole,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
