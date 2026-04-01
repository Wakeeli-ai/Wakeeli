import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider, useRole } from './context/RoleContext';
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
        <AppRoutes />
      </RoleProvider>
    </Router>
  );
}
