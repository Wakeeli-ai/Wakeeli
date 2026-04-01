import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Building2, BarChart3, Settings, LogOut, Shield } from 'lucide-react'

const NAV = [
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function AppLayout() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('superadmin_authenticated')
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar */}
      <aside
        className="flex flex-col w-60 flex-shrink-0"
        style={{ background: '#0f1729' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <img src="/logo-icon.png" alt="Wakeeli" className="w-9 h-9" />
          <div>
            <p className="text-white font-bold text-sm tracking-widest uppercase leading-tight">Wakeeli</p>
            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>Super Admin</p>
          </div>
        </div>

        {/* Fox badge */}
        <div className="mx-4 mt-4 mb-2 rounded-lg px-3 py-2 flex items-center gap-2" style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.35)' }}>
          <Shield size={14} style={{ color: '#60a5fa' }} />
          <span className="text-xs font-semibold" style={{ color: '#60a5fa' }}>Platform Owner</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white'
                    : 'hover:text-white'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
                borderLeft: isActive ? '3px solid #ffffff' : '3px solid transparent',
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ color: 'rgba(255,255,255,0.55)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
