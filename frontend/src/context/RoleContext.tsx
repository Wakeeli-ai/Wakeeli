import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getCurrentUser, isTokenExpired, UserInfo } from '../api';
import { setupAutoLogout, clearAutoLogout } from '../utils/auth';

export type Role = 'admin' | 'agent';

export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  role: Role;
  name: string;  // Display name (derived from username)
  label: string; // Role label for display
}

type RoleContextType = {
  role: Role;
  setRole: (role: Role) => void;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  loading: boolean;
  logout: () => void;
  /** True when the session was terminated due to token expiry (not manual logout). */
  sessionExpired: boolean;
  clearSessionExpired: () => void;
};

const RoleContext = createContext<RoleContextType | null>(null);

function userInfoToAuthUser(info: UserInfo): AuthUser {
  return {
    id: info.id,
    username: info.username,
    email: info.email,
    role: info.role,
    name: info.username, // Use username as display name
    label: info.role === 'admin' ? 'Admin' : 'Agent'
  };
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('agent');
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  /**
   * Core logout: clears storage and React state.
   * Pass expired=true when triggered by token expiry so the UI can show a toast.
   */
  const doLogout = useCallback((expired: boolean) => {
    clearAutoLogout();
    localStorage.removeItem('token');
    localStorage.removeItem('wakeeli_authenticated');
    localStorage.removeItem('wakeeli_remember');
    setUserState(null);
    setRoleState('agent');
    if (expired) {
      setSessionExpired(true);
    }
  }, []);

  const logout = useCallback(() => doLogout(false), [doLogout]);

  /** Schedule the auto-logout timer based on the currently stored token. */
  const scheduleAutoLogout = useCallback(() => {
    setupAutoLogout(() => {
      doLogout(true);
      // Also redirect to login if not already there
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login?expired=1';
      }
    });
  }, [doLogout]);

  // On mount, try to load user from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Check expiry client-side before hitting the network
      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('wakeeli_authenticated');
        localStorage.removeItem('wakeeli_remember');
        setSessionExpired(true);
        setLoading(false);
        return;
      }
      getCurrentUser()
        .then((res) => {
          const authUser = userInfoToAuthUser(res.data);
          setUserState(authUser);
          setRoleState(authUser.role);
          scheduleAutoLogout();
        })
        .catch(() => {
          // Token invalid or expired, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('wakeeli_authenticated');
          localStorage.removeItem('wakeeli_remember');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    if (user) {
      setUserState({ ...user, role: r, label: r === 'admin' ? 'Admin' : 'Agent' });
    }
  };

  const setUser = (u: AuthUser | null) => {
    setUserState(u);
    if (u) {
      setRoleState(u.role);
      // Schedule auto-logout whenever a new token is set (i.e. after login)
      scheduleAutoLogout();
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole, user, setUser, loading, logout, sessionExpired, clearSessionExpired }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
