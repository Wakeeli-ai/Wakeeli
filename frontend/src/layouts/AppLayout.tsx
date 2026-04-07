import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Building2,
  Calendar,
  Settings,
  BarChart3,
  Bell,
  LogOut,
  UserPlus,
  X,
  User,
  CheckCheck,
  UserCog,
  MoreHorizontal,
  Search,
  Menu,
  Edit2,
  Save,
  Camera,
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
  count?: number;
};

const adminNav: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/conversations', icon: MessageSquare, label: 'Conversations' },
  { to: '/listings', icon: Building2, label: 'Listings' },
  { to: '/tours', icon: Calendar, label: 'Tours' },
  { to: '/agents', icon: UserCog, label: 'Agents' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const agentNav: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'My Leads', count: 6 },
  { to: '/conversations', icon: MessageSquare, label: 'Inbox', count: 3 },
  { to: '/listings', icon: Building2, label: 'Listings' },
  { to: '/tours', icon: Calendar, label: 'My Tours' },
  { to: '/agent-analytics', icon: BarChart3, label: 'My Analytics' },
  { to: '/agent-settings', icon: Settings, label: 'Settings' },
];

// Bottom 4 tab items (mobile)
const bottomTabItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/conversations', icon: MessageSquare, label: 'Inbox' },
  { to: '/listings', icon: Building2, label: 'Listings' },
  { to: '/leads', icon: Users, label: 'Leads' },
];

// "More" sheet items (admin only)
const adminMoreItems = [
  { to: '/tours', icon: Calendar, label: 'Tours' },
  { to: '/agents', icon: UserCog, label: 'Agents' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

// "More" sheet items (agent)
const agentMoreItems = [
  { to: '/tours', icon: Calendar, label: 'My Tours' },
  { to: '/agent-analytics', icon: BarChart3, label: 'My Analytics' },
  { to: '/agent-settings', icon: Settings, label: 'Settings' },
];

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role, user, logout } = useRole();
  const navItems = role === 'admin' ? adminNav : agentNav;
  const moreItems = role === 'admin' ? adminMoreItems : agentMoreItems;

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileName, setProfileName] = useState<string>(
    () => localStorage.getItem('wakeeli_profile_name') || ''
  );
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '+961 3 123 456' });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    () => localStorage.getItem('wakeeli_profile_photo') || null
  );
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Sync profile state when user data loads
  useEffect(() => {
    const savedName = localStorage.getItem('wakeeli_profile_name') || user?.name || user?.username || '';
    setProfileName(savedName);
    setProfileForm({
      name: savedName,
      email: user?.email || '',
      phone: '+961 3 123 456',
    });
  }, [user]);

  const getNotifRoute = (type: Notification['type']): string => {
    switch (type) {
      case 'lead': return '/conversations';
      case 'tour': return '/tours';
      case 'agent': return '/agents';
      case 'system': return '/settings';
      default: return '/';
    }
  };

  const handleNotifClick = (n: Notification) => {
    markRead(n.id);
    setNotifOpen(false);
    navigate(getNotifRoute(n.type));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      const insideDesktop = userMenuRef.current && userMenuRef.current.contains(e.target as Node);
      const insideMobile = mobileUserMenuRef.current && mobileUserMenuRef.current.contains(e.target as Node);
      if (!insideDesktop && !insideMobile) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close More sheet when route changes
  useEffect(() => {
    setMoreOpen(false);
    setSidebarOpen(false);
  }, [location.pathname]);

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 200;
        let { width, height } = img;
        if (width > height) {
          if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
        } else {
          if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setProfilePhoto(dataUrl);
          try { localStorage.setItem('wakeeli_profile_photo', dataUrl); } catch (_) {}
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const closeSidebar = () => setSidebarOpen(false);

  const displayName = profileName || user?.name || user?.username || 'User';
  const displayLabel = user?.label || (role === 'admin' ? 'Admin' : 'Agent');
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const currentNavItem = navItems.find((item) => item.to === location.pathname);
  const pageTitle = currentNavItem?.label || 'Dashboard';

  // Check if current route is in "More" items (for active state highlighting)
  const isMoreActive = moreItems.some((item) => item.to === location.pathname);

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden">

      {/* Desktop sidebar backdrop (mobile legacy, unused now) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ===== SIDEBAR - desktop only ===== */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0"
        style={{ backgroundColor: '#0f1729', width: '232px' }}
      >
        {/* Logo pill */}
        <div className="px-4 pt-6 pb-5">
          <div
            className="flex flex-col items-center gap-[5px] rounded-[14px] py-3 px-5 w-full"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ width: 34, height: 34, background: '#2060e8', borderRadius: 8 }}
            >
              <img
                src="/logo-icon.png"
                alt="Wakeeli"
                className="object-contain"
                style={{ width: 18, height: 18 }}
              />
            </div>
            <span
              className="text-white font-bold uppercase"
              style={{ fontSize: 11, letterSpacing: '0.18em' }}
            >
              Wakeeli
            </span>
          </div>
        </div>

        <div className="mx-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: '10px 8px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to + item.label}
                to={item.to}
                className="flex items-center gap-[10px] rounded-lg font-medium transition-all duration-150 mb-[1px]"
                style={{
                  padding: '9px 12px',
                  fontSize: 13,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.10)' : 'transparent',
                  borderLeft: isActive ? '3px solid #2060e8' : '3px solid transparent',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = 'rgba(255,255,255,0.07)';
                    el.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.backgroundColor = 'transparent';
                    el.style.color = 'rgba(255,255,255,0.5)';
                  }
                }}
              >
                <Icon
                  size={16}
                  style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.5)', flexShrink: 0 }}
                />
                <span className="flex-1">{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className="flex items-center justify-center font-bold text-white"
                    style={{
                      background: '#ef4444',
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      fontSize: 10,
                      padding: '0 4px',
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User card footer */}
        <div className="px-2 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div
            className="flex items-center gap-[10px] rounded-lg"
            style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="flex items-center justify-center font-bold text-white flex-shrink-0 rounded-full overflow-hidden"
              style={{ width: 30, height: 30, background: profilePhoto ? 'transparent' : '#2060e8', fontSize: 11 }}
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold truncate" style={{ fontSize: 12 }}>
                {displayName}
              </div>
              <div className="truncate" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                {displayLabel}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="transition-colors flex-shrink-0 p-1 rounded"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              title="Logout"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ===== MOBILE HEADER ===== */}
        <header className="md:hidden h-14 flex-shrink-0 bg-white border-b border-slate-200 flex items-center px-4 gap-3 z-30">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-1">
            <div
              className="flex items-center justify-center rounded-lg flex-shrink-0"
              style={{ width: 28, height: 28, background: '#2060e8', borderRadius: 6 }}
            >
              <img src="/logo-icon.png" alt="Wakeeli" className="object-contain" style={{ width: 14, height: 14 }} />
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-wide">Wakeeli</span>
          </div>

          {/* New Lead shortcut */}
          <Link
            to="/leads"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold"
          >
            <UserPlus size={14} />
            <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">3</span>
          </Link>

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => { setNotifOpen((v) => !v); setUserMenuOpen(false); }}
              className="relative p-2 text-slate-600 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-slate-600" />
                    <span className="font-semibold text-slate-900 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs text-brand-600 font-medium"
                    >
                      <CheckCheck size={12} />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotifClick(n)}
                      className={`w-full text-left px-4 py-3 flex gap-3 items-start ${!n.read ? 'bg-brand-50/40' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${NOTIF_TYPE_COLORS[n.type]}`}>
                        {n.type === 'lead' ? 'L' : n.type === 'tour' ? 'T' : n.type === 'agent' ? 'A' : 'S'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>
                            {n.title}
                          </p>
                          {!n.read && <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0 mt-1" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => { setNotifOpen(false); navigate('/notifications'); }}
                    className="text-xs text-brand-600 font-medium w-full text-center"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="relative" ref={mobileUserMenuRef}>
            <button
              type="button"
              onClick={() => { setUserMenuOpen((v) => !v); setNotifOpen(false); }}
              className="flex items-center"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden"
                style={{ background: profilePhoto ? 'transparent' : '#ede9fe', color: '#7c3aed' }}
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : initials}
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500">{displayLabel}</p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); setProfileEditMode(false); setProfileOpen(true); }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 w-full text-left"
                  >
                    <User size={14} className="text-slate-400" />
                    My Profile
                  </button>
                  <Link
                    to={role === 'admin' ? '/settings' : '/agent-settings'}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700"
                  >
                    <Settings size={14} className="text-slate-400" />
                    Settings
                  </Link>
                </div>
                <div className="border-t border-slate-100 py-1">
                  <button
                    type="button"
                    onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 w-full text-left"
                  >
                    <LogOut size={14} className="text-red-400" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* ===== DESKTOP HEADER ===== */}
        <header className="hidden md:flex h-14 flex-shrink-0 bg-white border-b border-slate-200 items-center px-6 gap-3">
          <div className="flex-shrink-0">
            <span className="text-[15px] font-bold text-slate-900">{pageTitle}</span>
          </div>

          <form onSubmit={handleSearch} className="ml-4 w-72 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads by phone or name..."
                className="w-full pl-9 pr-4 py-[7px] bg-slate-100 border-0 rounded-lg text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:bg-white transition-colors"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/leads"
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              <UserPlus size={16} />
              New Lead
              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">3</span>
            </Link>

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => { setNotifOpen((v) => !v); setUserMenuOpen(false); }}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
              >
                <Bell size={18} />
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
                        onClick={() => handleNotifClick(n)}
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
                      onClick={() => { setNotifOpen(false); navigate('/notifications'); }}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors w-full text-center"
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
                className="flex items-center gap-3 pl-3 border-l border-slate-200 hover:opacity-80 transition-opacity"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500">{displayLabel}</p>
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 overflow-hidden"
                  style={{ background: profilePhoto ? 'transparent' : '#ede9fe', color: '#7c3aed' }}
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : initials}
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                    <p className="text-xs text-slate-500">{displayLabel}</p>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); setProfileEditMode(false); setProfileOpen(true); }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
                    >
                      <User size={15} className="text-slate-400" />
                      My Profile
                    </button>
                    <Link
                      to={role === 'admin' ? '/settings' : '/agent-settings'}
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

        {/* ===== PAGE CONTENT ===== */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* ===== BOTTOM TAB BAR - mobile only ===== */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200"
        style={{ height: 60 }}
      >
        <div className="flex h-full">
          {bottomTabItems.map((tab) => {
            const isActive = location.pathname === tab.to;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors"
              >
                <Icon
                  size={22}
                  className={isActive ? 'text-brand-600' : 'text-slate-400'}
                />
                <span
                  className={`text-[10px] font-semibold ${isActive ? 'text-brand-600' : 'text-slate-400'}`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px]"
          >
            <MoreHorizontal
              size={22}
              className={isMoreActive ? 'text-brand-600' : 'text-slate-400'}
            />
            <span
              className={`text-[10px] font-semibold ${isMoreActive ? 'text-brand-600' : 'text-slate-400'}`}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ===== PROFILE MODAL ===== */}
      {profileOpen && createPortal(
        <div
          className="fixed inset-0 bg-black/50 z-[200] flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => { setProfileOpen(false); setProfileEditMode(false); }}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">My Profile</h2>
              <button
                type="button"
                onClick={() => { setProfileOpen(false); setProfileEditMode(false); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Avatar + name */}
            <div className="px-6 py-5 flex items-center gap-4 bg-slate-50 border-b border-slate-100">
              <div className="relative flex-shrink-0">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white overflow-hidden"
                  style={{ background: profilePhoto ? 'transparent' : '#2060e8' }}
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : initials}
                </div>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className={`absolute bottom-0 right-0 flex items-center justify-center rounded-full border-2 border-white shadow transition-colors ${
                    profileEditMode
                      ? 'w-8 h-8 bg-brand-600 hover:bg-brand-700 text-white'
                      : 'w-6 h-6 bg-slate-500 hover:bg-slate-600 text-white'
                  }`}
                  title="Upload photo"
                >
                  <Camera size={profileEditMode ? 14 : 10} />
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base">{displayName}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 mt-1 capitalize">
                  {displayLabel}
                </span>
              </div>
            </div>

            {/* Fields */}
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
                {profileEditMode ? (
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-sm text-slate-900 font-medium">{displayName}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email</label>
                {profileEditMode ? (
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-sm text-slate-900 font-medium">{profileForm.email || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Phone</label>
                {profileEditMode ? (
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <p className="text-sm text-slate-900 font-medium">{profileForm.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Role</label>
                <p className="text-sm text-slate-900 font-medium capitalize">{role}</p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-6 pb-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              {profileEditMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileForm((f) => ({ ...f, name: profileName }));
                      setProfileEditMode(false);
                    }}
                    className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileName(profileForm.name);
                      localStorage.setItem('wakeeli_profile_name', profileForm.name);
                      setProfileEditMode(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    <Save size={14} />
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setProfileForm((f) => ({ ...f, name: profileName }));
                    setProfileEditMode(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
                >
                  <Edit2 size={14} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ===== MORE SHEET - mobile only ===== */}
      {moreOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-50"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            <div className="flex items-center justify-between px-5 py-3">
              <span className="font-bold text-slate-900 text-base">More</span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* More nav items grid */}
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                      isActive
                        ? 'bg-brand-50 border-brand-200 text-brand-700'
                        : 'border-slate-100 text-slate-700 bg-slate-50'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-brand-600' : 'text-slate-500'} />
                    <span className="font-semibold text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User section */}
            <div className="mx-4 mb-4 bg-slate-50 rounded-xl border border-slate-100 p-3 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 overflow-hidden"
                style={{ background: profilePhoto ? 'transparent' : '#2060e8', fontSize: 13 }}
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 text-sm truncate">{displayName}</div>
                <div className="text-xs text-slate-500 truncate">{displayLabel}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  setProfileEditMode(false);
                  setProfileOpen(true);
                }}
                className="p-2 text-brand-600 rounded-lg"
                title="My Profile"
              >
                <User size={18} />
              </button>
              <button
                type="button"
                onClick={() => { setMoreOpen(false); handleLogout(); }}
                className="p-2 text-red-500 rounded-lg"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Suppress unused import warnings
void Menu;
void Search;

export default AppLayout;
