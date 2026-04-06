import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Companies from './pages/Companies'
import CompanyDetail from './pages/CompanyDetail'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import AppLayout from './layouts/AppLayout'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authed = localStorage.getItem('superadmin_authenticated') === 'true'
  if (!authed) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter basename="/superadmin">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/companies" replace />} />
          <Route path="companies" element={<Companies />} />
          <Route path="companies/:id" element={<CompanyDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/companies" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
