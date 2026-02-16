import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, UserInfo } from '../api';

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

  // On mount, try to load user from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
        .then((res) => {
          const authUser = userInfoToAuthUser(res.data);
          setUserState(authUser);
          setRoleState(authUser.role);
        })
        .catch(() => {
          // Token invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('wakeeli_authenticated');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
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
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('wakeeli_authenticated');
    localStorage.removeItem('wakeeli_remember');
    setUserState(null);
    setRoleState('agent');
  };

  return (
    <RoleContext.Provider value={{ role, setRole, user, setUser, loading, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
