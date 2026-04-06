import { useState } from 'react';
import {
  MessageCircle, Globe, Building2, User, Users, Bell, Shield, UserPlus, Key,
  X, Eye, EyeOff, Copy, CheckCircle, ChevronRight,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { toast } from '../utils/toast';

type Permission =
  | 'fullAccess'
  | 'billing'
  | 'userManagement'
  | 'leads'
  | 'listings'
  | 'tours'
  | 'conversations'
  | 'analytics'
  | 'settings';

interface UserPermissions {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  avatarColor: { bg: string; text: string };
  permissions: Record<Permission, boolean>;
}

const PERMISSIONS: { key: Permission; label: string }[] = [
  { key: 'fullAccess', label: 'Full Access' },
  { key: 'billing', label: 'Billing' },
  { key: 'userManagement', label: 'User Mgmt' },
  { key: 'leads', label: 'Leads' },
  { key: 'listings', label: 'Listings' },
  { key: 'tours', label: 'Tours' },
  { key: 'conversations', label: 'Convos' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'settings', label: 'Settings' },
];

const AVATAR_COLORS = [
  { bg: '#dbeafe', text: '#2563eb' },
  { bg: '#d1fae5', text: '#059669' },
  { bg: '#ede9fe', text: '#7c3aed' },
  { bg: '#fce7f3', text: '#db2777' },
];

const INITIAL_USERS: UserPermissions[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    email: 'sarah@wakeeli.com',
    role: 'Admin',
    initials: 'SM',
    avatarColor: AVATAR_COLORS[0],
    permissions: {
      fullAccess: true, billing: true, userManagement: true, leads: true,
      listings: true, tours: true, conversations: true, analytics: true, settings: true,
    },
  },
  {
    id: '2',
    name: 'James Rodriguez',
    email: 'james@wakeeli.com',
    role: 'Senior Agent',
    initials: 'JR',
    avatarColor: AVATAR_COLORS[1],
    permissions: {
      fullAccess: false, billing: false, userManagement: false, leads: true,
      listings: true, tours: true, conversations: true, analytics: true, settings: false,
    },
  },
  {
    id: '3',
    name: 'Lara Chen',
    email: 'lara@wakeeli.com',
    role: 'Agent',
    initials: 'LC',
    avatarColor: AVATAR_COLORS[2],
    permissions: {
      fullAccess: false, billing: false, userManagement: false, leads: true,
      listings: false, tours: true, conversations: true, analytics: false, settings: false,
    },
  },
  {
    id: '4',
    name: 'Mark Thompson',
    email: 'mark@wakeeli.com',
    role: 'Viewer',
    initials: 'MT',
    avatarColor: AVATAR_COLORS[3],
    permissions: {
      fullAccess: false, billing: false, userManagement: false, leads: false,
      listings: false, tours: false, conversations: false, analytics: true, settings: false,
    },
  },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  );
}

// Tabs for the settings sections
type SettingsTab = 'company' | 'integrations' | 'users' | 'notifications' | 'api';

const SETTINGS_TABS: { key: SettingsTab; label: string }[] = [
  { key: 'company', label: 'Company' },
  { key: 'integrations', label: 'Integrations' },
  { key: 'users', label: 'Users' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'api', label: 'API' },
];

export default function Settings() {
  const { role, setRole } = useRole();
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [users, setUsers] = useState<UserPermissions[]>(INITIAL_USERS);
  const [notifications, setNotifications] = useState({
    newLeadAlerts: true,
    tourReminders: true,
    weeklyReports: false,
    agentHandoffs: true,
  });
  const [companyForm, setCompanyForm] = useState({
    companyName: 'Wakeeli Demo Agency',
    email: 'contact@wakeeli.app',
    phone: '+961 1 234 567',
    address: 'Achrafieh, Beirut, Lebanon',
    website: 'wakeeli.app',
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ name: '', email: '', role: 'Agent' });
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const MOCK_API_KEY = 'wk_live_4xK9mR2nBpQ7vLsJ3wY8cF6hX1dE5gA';

  function togglePermission(userId: string, perm: Permission) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, permissions: { ...u.permissions, [perm]: !u.permissions[perm] } }
          : u,
      ),
    );
  }

  function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault();
    toast.success('Company profile saved.');
  }

  function handleAddIntegration() {
    toast.success('Integration settings opened. (Coming soon)');
  }

  function handleCopyApiKey() {
    navigator.clipboard.writeText(MOCK_API_KEY).catch(() => {});
    setApiKeyCopied(true);
    toast.success('API key copied to clipboard.');
    setTimeout(() => setApiKeyCopied(false), 2000);
  }

  function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!addUserForm.name || !addUserForm.email) {
      toast.error('Name and email are required.');
      return;
    }
    const initials = addUserForm.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
    setUsers((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: addUserForm.name,
        email: addUserForm.email,
        role: addUserForm.role,
        initials,
        avatarColor: AVATAR_COLORS[prev.length % AVATAR_COLORS.length],
        permissions: {
          fullAccess: false, billing: false, userManagement: false, leads: true,
          listings: false, tours: true, conversations: true, analytics: false, settings: false,
        },
      },
    ]);
    toast.success(`${addUserForm.name} added.`);
    setAddUserForm({ name: '', email: '', role: 'Agent' });
    setShowAddUserModal(false);
  }

  const integrations = [
    {
      icon: 'W',
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
      name: 'WhatsApp Business',
      sub: 'Connected 3 days ago',
      value: '2,847',
      status: 'Connected',
      statusColor: '#16a34a',
    },
    {
      icon: 'f',
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      name: 'Meta (Facebook)',
      sub: 'Connected 1 week ago',
      value: '1,452',
      status: 'Connected',
      statusColor: '#16a34a',
    },
    {
      icon: 'W',
      iconBg: '#f8fafc',
      iconColor: '#475569',
      name: 'Website Widget',
      sub: 'Connected 2 weeks ago',
      value: '3,921',
      status: 'Connected',
      statusColor: '#16a34a',
    },
  ];

  const notificationItems = [
    { key: 'newLeadAlerts', label: 'New Lead Alerts', sub: 'Get notified when a new lead comes in' },
    { key: 'tourReminders', label: 'Tour Reminders', sub: 'Morning reminders for scheduled tours' },
    { key: 'agentHandoffs', label: 'Agent Handoff Alerts', sub: 'Notify when AI hands a lead to an agent' },
    { key: 'weeklyReports', label: 'Weekly Reports', sub: 'Receive a weekly performance summary every Monday' },
  ] as const;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-0.5 text-sm">
          Manage your company profile, integrations, user permissions, and preferences
        </p>
      </div>

      {/* View switch (demo) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-900 text-sm">Preview Mode</p>
          <p className="text-xs text-slate-500 mt-0.5">Switch between Admin and Agent view</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${role === 'admin' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'}`}
          >
            <Users size={15} />
            Admin
          </button>
          <button
            type="button"
            onClick={() => setRole('agent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${role === 'agent' ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'}`}
          >
            <User size={15} />
            Agent
          </button>
        </div>
      </div>

      {/* Tab bar - horizontal scroll on mobile, normal on desktop */}
      <div className="flex overflow-x-auto gap-1 border-b border-slate-200 -mx-4 px-4 md:mx-0 md:px-0">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`py-2.5 px-3 text-sm font-semibold whitespace-nowrap border-b-2 flex-shrink-0 transition-colors ${
              activeTab === tab.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}

      {/* COMPANY TAB */}
      {activeTab === 'company' && (
        <div>
          {/* Mobile: iOS-style grouped list */}
          <div className="md:hidden space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center">
                    <Building2 size={13} className="text-brand-600" />
                  </div>
                  <h2 className="font-bold text-slate-900 text-sm">Company Profile</h2>
                </div>
              </div>

              <form onSubmit={handleSaveCompany}>
                <div className="divide-y divide-slate-100">
                  {(
                    [
                      { key: 'companyName', label: 'Company Name' },
                      { key: 'email', label: 'Email' },
                      { key: 'phone', label: 'Phone' },
                      { key: 'address', label: 'Address' },
                      { key: 'website', label: 'Website' },
                    ] as { key: keyof typeof companyForm; label: string }[]
                  ).map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-3 px-4 py-3 min-h-[52px]">
                      <span className="text-sm font-medium text-slate-900 w-24 flex-shrink-0">{label}</span>
                      <input
                        type="text"
                        value={companyForm[key]}
                        onChange={(e) => setCompanyForm({ ...companyForm, [key]: e.target.value })}
                        className="flex-1 text-sm text-slate-600 text-right bg-transparent focus:outline-none focus:text-slate-900 h-11 min-w-0"
                      />
                      <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                    </div>
                  ))}
                </div>

                <div className="px-4 py-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="w-full h-11 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Desktop: standard form card */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <form onSubmit={handleSaveCompany}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                    <Building2 size={15} className="text-brand-600" />
                  </div>
                  <h2 className="font-bold text-slate-900 text-sm">Company Profile</h2>
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
              <div className="space-y-3.5">
                {(
                  [
                    { key: 'companyName', label: 'Company Name' },
                    { key: 'email', label: 'Email Address' },
                    { key: 'phone', label: 'Phone Number' },
                    { key: 'address', label: 'Address' },
                    { key: 'website', label: 'Website' },
                  ] as { key: keyof typeof companyForm; label: string }[]
                ).map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
                    <input
                      type="text"
                      value={companyForm[key]}
                      onChange={(e) => setCompanyForm({ ...companyForm, [key]: e.target.value })}
                      className="w-full px-3 h-11 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                    />
                  </div>
                ))}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INTEGRATIONS TAB */}
      {activeTab === 'integrations' && (
        <div>
          {/* Mobile: grouped list */}
          <div className="md:hidden bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <MessageCircle size={13} className="text-emerald-600" />
                </div>
                <h2 className="font-bold text-slate-900 text-sm">Integrations</h2>
              </div>
              <button
                type="button"
                onClick={handleAddIntegration}
                className="px-3 py-1.5 border border-brand-200 text-brand-600 rounded-lg text-xs font-semibold hover:bg-brand-50 transition-colors min-h-[36px]"
              >
                Add
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {integrations.map((int) => (
                <div
                  key={int.name}
                  className="flex items-center gap-3 px-4 py-3 min-h-[64px]"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: int.iconBg, color: int.iconColor }}
                  >
                    {int.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900">{int.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{int.sub}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-bold text-sm text-slate-900">{int.value}</p>
                    <p className="text-[10px] font-semibold" style={{ color: int.statusColor }}>{int.status}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 flex-shrink-0 ml-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <MessageCircle size={15} className="text-emerald-600" />
                </div>
                <h2 className="font-bold text-slate-900 text-sm">Integrations</h2>
              </div>
              <button
                type="button"
                onClick={handleAddIntegration}
                className="px-3 py-1.5 border border-brand-200 text-brand-600 rounded-lg text-xs font-semibold hover:bg-brand-50 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="space-y-2.5">
              {integrations.map((int) => (
                <div
                  key={int.name}
                  className="flex items-center justify-between p-3.5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: int.iconBg, color: int.iconColor }}
                    >
                      {int.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{int.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{int.sub}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-sm">{int.value}</p>
                    <p className="text-[10px] font-semibold mt-0.5" style={{ color: int.statusColor }}>{int.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div>
          {/* Mobile: user list with permission summary */}
          <div className="md:hidden">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Shield size={13} className="text-purple-600" />
                  </div>
                  <h2 className="font-bold text-slate-900 text-sm">Users & Permissions</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 transition-colors min-h-[36px]"
                >
                  <UserPlus size={12} />
                  Add
                </button>
              </div>

              {/* Mobile user rows - tappable with permission count */}
              <div className="divide-y divide-slate-100">
                {users.map((user) => {
                  const enabledCount = Object.values(user.permissions).filter(Boolean).length;
                  return (
                    <div key={user.id} className="flex items-center gap-3 px-4 py-3 min-h-[64px]">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: user.avatarColor.bg, color: user.avatarColor.text }}
                      >
                        {user.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{user.email}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">
                          {user.role}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{enabledCount} permissions</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 flex-shrink-0 ml-1" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Permission toggles section per user on mobile - collapsible feel */}
            <div className="mt-4 space-y-3">
              {users.map((user) => (
                <div key={user.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: user.avatarColor.bg, color: user.avatarColor.text }}
                    >
                      {user.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{user.name}</p>
                      <span className="text-xs text-slate-400">{user.role}</span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {PERMISSIONS.map((p) => (
                      <div key={p.key} className="flex items-center justify-between px-4 py-3 min-h-[52px]">
                        <span className="text-sm font-medium text-slate-700">{p.label}</span>
                        <Toggle
                          checked={user.permissions[p.key]}
                          onChange={() => togglePermission(user.id, p.key)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: permissions table */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Shield size={15} className="text-purple-600" />
                </div>
                <h2 className="font-bold text-slate-900 text-sm">User Roles and Permissions</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 transition-colors"
              >
                <UserPlus size={13} />
                Add User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide bg-[#f8fafc] border-b border-slate-200">
                    <th className="px-5 py-3 whitespace-nowrap">User</th>
                    <th className="px-5 py-3 whitespace-nowrap">Role</th>
                    {PERMISSIONS.map((p) => (
                      <th key={p.key} className="px-3 py-3 text-center whitespace-nowrap">{p.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user, i) => (
                    <tr key={user.id} className={`${i % 2 === 1 ? 'bg-[#f8fafc]/60' : 'bg-white'} hover:bg-slate-50/50 transition-colors`}>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: user.avatarColor.bg, color: user.avatarColor.text }}
                          >
                            {user.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.name}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                          {user.role}
                        </span>
                      </td>
                      {PERMISSIONS.map((p) => (
                        <td key={p.key} className="px-3 py-3.5 text-center">
                          <div className="flex justify-center">
                            <Toggle
                              checked={user.permissions[p.key]}
                              onChange={() => togglePermission(user.id, p.key)}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div>
          {/* Mobile: iOS-style list */}
          <div className="md:hidden bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center">
                <Bell size={13} className="text-brand-600" />
              </div>
              <h2 className="font-bold text-slate-900 text-sm">Notifications</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {notificationItems.map(({ key, label, sub }) => (
                <div key={key} className="flex items-center gap-3 px-4 py-3 min-h-[64px]">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                  </div>
                  <Toggle
                    checked={notifications[key]}
                    onChange={() =>
                      setNotifications((n) => ({ ...n, [key]: !n[key] }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                <Bell size={15} className="text-brand-600" />
              </div>
              <h2 className="font-bold text-slate-900 text-sm">Notifications</h2>
            </div>
            <div className="space-y-0">
              {notificationItems.map(({ key, label, sub }, i, arr) => (
                <div
                  key={key}
                  className={`flex items-center justify-between py-4 ${i < arr.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                  </div>
                  <Toggle
                    checked={notifications[key]}
                    onChange={() =>
                      setNotifications((n) => ({ ...n, [key]: !n[key] }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* API TAB */}
      {activeTab === 'api' && (
        <div>
          {/* Mobile: iOS-style list */}
          <div className="md:hidden space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Key size={13} className="text-amber-600" />
                </div>
                <h2 className="font-bold text-slate-900 text-sm">API Keys</h2>
              </div>

              <div className="px-4 py-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Live API Key</p>
                  <div className="flex items-center gap-2 p-3 bg-[#f8fafc] border border-slate-200 rounded-xl">
                    <code className="text-xs font-mono text-slate-700 truncate flex-1">
                      {showApiKey ? MOCK_API_KEY : 'wk_live_' + '*'.repeat(20)}
                    </code>
                    <button
                      type="button"
                      onClick={() => setShowApiKey((v) => !v)}
                      className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyApiKey}
                  className={`w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold border transition-colors ${
                    apiKeyCopied
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {apiKeyCopied ? <CheckCircle size={15} /> : <Copy size={15} />}
                  {apiKeyCopied ? 'Copied!' : 'Copy API Key'}
                </button>
                <p className="text-xs text-slate-400">
                  Keep your API key secret. Never expose it in client-side code or public repositories.
                </p>
              </div>
            </div>

            {/* Quick nav cards on mobile - show as list items with chevron */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <p className="px-4 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Access</p>
              {[
                { icon: Building2, label: 'Company Profile', sub: 'Name, contact, address', tab: 'company' as SettingsTab, color: '#2563eb', bg: '#eff6ff' },
                { icon: MessageCircle, label: 'Integrations', sub: '3 active connections', tab: 'integrations' as SettingsTab, color: '#16a34a', bg: '#f0fdf4' },
                { icon: Globe, label: 'User Settings', sub: 'Roles and permissions', tab: 'users' as SettingsTab, color: '#b45309', bg: '#fffbeb' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setActiveTab(item.tab)}
                    className="w-full flex items-center gap-3 px-4 py-3 border-t border-slate-100 min-h-[64px] hover:bg-slate-50 transition-colors text-left"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: item.bg }}
                    >
                      <Icon size={16} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Key size={15} className="text-amber-600" />
              </div>
              <h2 className="font-bold text-slate-900 text-sm">API Keys</h2>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#f8fafc] border border-slate-200 rounded-xl">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-xs font-semibold text-slate-500 mb-1.5">Live API Key</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-slate-700 truncate">
                    {showApiKey ? MOCK_API_KEY : 'wk_live_' + '*'.repeat(28)}
                  </code>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors border border-slate-200"
                  title={showApiKey ? 'Hide key' : 'Show key'}
                >
                  {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  type="button"
                  onClick={handleCopyApiKey}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    apiKeyCopied
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {apiKeyCopied ? <CheckCircle size={13} /> : <Copy size={13} />}
                  {apiKeyCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Keep your API key secret. Never expose it in client-side code or public repositories.
            </p>
          </div>
        </div>
      )}

      {/* Desktop: Quick nav cards (shown outside tabs on desktop) */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: Building2, label: 'Company Profile', sub: 'Name, contact, address', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
          { icon: MessageCircle, label: 'Integrations', sub: '3 active connections', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
          { icon: Globe, label: 'User Settings', sub: 'Roles and permissions', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm"
              style={{ background: card.bg, borderColor: card.border }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${card.color}20` }}
              >
                <Icon size={18} style={{ color: card.color }} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{card.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowAddUserModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                    <UserPlus size={14} className="text-brand-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Add User</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleAddUser} className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
                  <input
                    required
                    value={addUserForm.name}
                    onChange={(e) => setAddUserForm({ ...addUserForm, name: e.target.value })}
                    className="w-full px-3 h-11 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="e.g. Sarah Mitchell"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
                  <input
                    required
                    type="email"
                    value={addUserForm.email}
                    onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                    className="w-full px-3 h-11 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="user@wakeeli.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
                  <select
                    value={addUserForm.role}
                    onChange={(e) => setAddUserForm({ ...addUserForm, role: e.target.value })}
                    className="w-full px-3 h-11 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option>Agent</option>
                    <option>Senior Agent</option>
                    <option>Admin</option>
                    <option>Viewer</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
