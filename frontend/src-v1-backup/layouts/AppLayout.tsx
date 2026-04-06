import { useState, useRef, useEffect } from 'react';
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
  Menu,
  X,
  User,
  CheckCheck,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';

type Notification = {
  id: number;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'lead' | 'tour' | 'agent' | 'system';
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'New lead from WhatsApp',
    body: 'Charbel Khoury is asking about a 2BR in Achrafieh',
    time: '2 min ago',
    read: false,
    type: 'lead',
  },
  {
    id: 2,
    title: 'Tour booked',
    body: 'Nadia Haddad scheduled a visit for the Beit Mery villa on Saturday 11 AM',
    time: '18 min ago',
    read: false,
    type: 'tour',
  },
  {
    id: 3,
    title: 'Agent handoff requested',
    body: 'Omar Fakih qualified and is ready for an agent in Dbayeh',
    time: '45 min ago',
    read: false,
    type: 'agent',
  },
  {
    id: 4,
    title: 'New lead from Instagram',
    body: 'Karim Mouawad is interested in a villa in Broummana, budget $600k',
    time: '1h ago',
    read: true,
    type: 'lead',
  },
  {
    id: 5,
    title: 'Tour completed',
    body: 'Tony Frem completed the tour for the Mar Mikhael studio. Feedback: positive',
    time: '2h ago',
    read: true,
    type: 'tour',
  },
  {
    id: 6,
    title: 'AI routing update',
    body: '3 conversations waiting for agent review',
    time: '3h ago',
    read: true,
    type: 'system',
  },
];

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
];

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role, user, logout } = useRole();
  const navItems = role === 'admin' ? adminNav : agentNav;

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const NOTIF_TYPE_COLORS: Record<string, string> = {
    lead: 'bg-brand-100 text-brand-600',
    tour: 'bg-emerald-100 text-emerald-600',
    agent: 'bg-amber-100 text-amber-600',
    system: 'bg-slate-100 text-slate-600',
  };

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

  const closeSidebar = () => setSidebarOpen(false);

  const displayName = user?.name || user?.username || 'User';
  const displayLabel = user?.label || (role === 'admin' ? 'Admin' : 'Agent');
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 w-64 flex flex-col
          transition-transform duration-300
          md:relative md:top-auto md:left-auto md:h-auto md:z-auto md:w-60 md:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ backgroundColor: '#1a2744' }}
      >
        {/* Mobile close button */}
        <button
          type="button"
          onClick={closeSidebar}
          className="absolute top-4 right-4 text-white/50 hover:text-white md:hidden p-1"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        {/* Logo block */}
        <div className="flex flex-col items-center pt-8 pb-5 px-4">
          <div
            className="flex flex-col items-center rounded-2xl px-6 py-4 w-full"
            style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <img
              src="/logo-icon.png"
              alt="Wakeeli"
              className="w-12 h-12 object-contain"
            />
            <span className="mt-2 text-white text-sm font-semibold tracking-[0.16em] uppercase">Wakeeli</span>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.10)' }} />

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to + item.label}
                to={item.to}
                onClick={closeSidebar}
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
            onClick={() => { closeSidebar(); handleLogout(); }}
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
        <header className="h-14 flex-shrink-0 bg-white border-b border-slate-200 flex items-center px-3 md:px-6 gap-2 md:gap-3">

          {/* Hamburger - mobile only */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Logo in header - mobile only */}
          <div className="md:hidden flex items-center gap-2 flex-shrink-0">
            <img src="/logo-icon.png" alt="Wakeeli" className="w-7 h-7 object-contain" />
            <span className="text-sm font-semibold text-slate-900 tracking-wide">Wakeeli</span>
          </div>

          {/* Search - desktop only */}
          <form onSubmit={handleSearch} className="hidden md:block w-80 flex-shrink-0">
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

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <Link
              to="/leads"
              className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 min-h-[44px]"
            >
              <UserPlus size={18} />
              <span className="hidden sm:inline">New Lead</span>
              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>
            </Link>
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => { setNotifOpen((v) => !v); setUserMenuOpen(false); }}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={15} className="text-slate-600" />
                      <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-100 text-red-600 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                      >
                        <CheckCheck size={13} />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-50">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => markRead(n.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex gap-3 items-start ${!n.read ? 'bg-brand-50/40' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${NOTIF_TYPE_COLORS[n.type]}`}>
                          {n.type === 'lead' ? 'L' : n.type === 'tour' ? 'T' : n.type === 'agent' ? 'A' : 'S'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                          <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                    <button
                      type="button"
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => { setUserMenuOpen((v) => !v); setNotifOpen(false); }}
                className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 border-l border-slate-200 hover:opacity-80 transition-opacity"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500">{displayLabel}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {initials}
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                    <p className="text-xs text-slate-500">{displayLabel}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User size={15} className="text-slate-400" />
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings size={15} className="text-slate-400" />
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 py-1">
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut size={15} className="text-red-400" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
