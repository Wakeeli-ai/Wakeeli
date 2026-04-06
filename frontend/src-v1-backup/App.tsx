import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { RoleProvider, useRole } from './context/RoleContext';
import { toast } from './utils/toast';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Listings from './pages/Listings';
import Agents from './pages/Agents';
import Conversations from './pages/Conversations';
import Leads from './pages/Leads';
import Tours from './pages/Tours';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRole();
  const isAuth = typeof window !== 'undefined' && localStorage.getItem('wakeeli_authenticated') === '1';

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuth && !user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { role, loading } = useRole();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** Fires a sonner toast when a session expires mid-use (timer or 401 detected in-app). */
function SessionExpiredHandler() {
  const { sessionExpired, clearSessionExpired } = useRole();

  useEffect(() => {
    if (sessionExpired) {
      toast.info('Session expired. Please log in again.');
      clearSessionExpired();
    }
  }, [sessionExpired, clearSessionExpired]);

  return null;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/conversations" element={<Conversations />} />
                <Route path="/listings" element={<Listings />} />
                <Route path="/tours" element={<Tours />} />
                <Route path="/agents" element={<AdminRoute><Agents /></AdminRoute>} />
                <Route path="/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
                <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <RoleProvider>
        <SessionExpiredHandler />
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a2744',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              fontSize: '14px',
            },
            classNames: {
              error: 'toast-error',
              success: 'toast-success',
              info: 'toast-info',
            },
          }}
        />
      </RoleProvider>
    </Router>
  );
}
