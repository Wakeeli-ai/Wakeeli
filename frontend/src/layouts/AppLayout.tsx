import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Building2,
  Calendar,
  Settings,
  BarChart3,
  Search,
  Bell,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';

type NavItem = {
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  adminOnly?: boolean;
  agentOnly?: boolean;
};

const adminNav: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/conversations', icon: MessageSquare, label: 'Conversations' },
  { to: '/listings', icon: Building2, label: 'Listings' },
  { to: '/tours', icon: Calendar, label: 'Tours' },
  { to: '/agents', icon: Users, label: 'Agents' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const agentNav: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'My Leads' },
  { to: '/conversations', icon: MessageSquare, label: 'Inbox' },
  { to: '/listings', icon: Building2, label: 'Listings' },
  { to: '/tours', icon: Calendar, label: 'Tours' },
  { to: '/agents', icon: Users, label: 'Agents' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role, user, logout } = useRole();
  const navItems = role === 'admin' ? adminNav : agentNav;

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/leads');
    }
  };

  const displayName = user?.name || user?.username || 'User';
  const displayLabel = user?.label || (role === 'admin' ? 'Admin' : 'Agent');
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: '#0f1729' }}>
        {/* Logo block */}
        <div className="flex flex-col items-center pt-8 pb-5 px-4">
          <img
            src="/logo-icon.png"
            alt="Wakeeli"
            className="w-14 h-14 object-contain"
          />
          <span className="mt-3 text-white text-base font-semibold tracking-[0.14em] uppercase">Wakeeli</span>
        </div>
        {/* Divider */}
        <div className="mx-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.10)' }} />
        {/* Nav */}
        <nav className="flex-1 py-3 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to + item.label}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-l-4 pl-2 ${
                  isActive
                    ? 'text-white border-white'
                    : 'text-white/50 hover:text-white hover:bg-white/10 border-transparent'
                }`}
                style={isActive ? { backgroundColor: 'rgba(255,255,255,0.10)' } : undefined}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-white/50'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {/* Logout */}
        <div className="p-2" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 text-sm text-left transition-all duration-200 border-l-4 border-transparent pl-2"
          >
            <LogOut size={20} className="text-white/50" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 flex-shrink-0 bg-white border-b border-slate-200 flex items-center px-6">
          <form onSubmit={handleSearch} className="w-80 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads by phone or message..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-0 rounded-lg text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:bg-white"
              />
            </div>
          </form>
          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/leads"
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
            >
              <UserPlus size={18} />
              New Lead
              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
            </Link>
            <button type="button" className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">{displayLabel}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-medium">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
