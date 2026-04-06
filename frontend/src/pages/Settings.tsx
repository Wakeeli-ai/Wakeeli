import { useState } from 'react';
import { MessageCircle, Globe, Building2, ArrowRight, User, Users, Bell, Shield, UserPlus } from 'lucide-react';
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
  avatarColor: string;
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

const INITIAL_USERS: UserPermissions[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    email: 'sarah@wakeeli.com',
    role: 'Admin',
    initials: 'SM',
    avatarColor: 'bg-brand-100 text-brand-700',
    permissions: {
      fullAccess: true,
      billing: true,
      userManagement: true,
      leads: true,
      listings: true,
      tours: true,
      conversations: true,
      analytics: true,
      settings: true,
    },
  },
  {
    id: '2',
    name: 'James Rodriguez',
    email: 'james@wakeeli.com',
    role: 'Senior Agent',
    initials: 'JR',
    avatarColor: 'bg-emerald-100 text-emerald-700',
    permissions: {
      fullAccess: false,
      billing: false,
      userManagement: false,
      leads: true,
      listings: true,
      tours: true,
      conversations: true,
      analytics: true,
      settings: false,
    },
  },
  {
    id: '3',
    name: 'Lara Chen',
    email: 'lara@wakeeli.com',
    role: 'Agent',
    initials: 'LC',
    avatarColor: 'bg-purple-100 text-purple-700',
    permissions: {
      fullAccess: false,
      billing: false,
      userManagement: false,
      leads: true,
      listings: false,
      tours: true,
      conversations: true,
      analytics: false,
      settings: false,
    },
  },
  {
    id: '4',
    name: 'Mark Thompson',
    email: 'mark@wakeeli.com',
    role: 'Viewer',
    initials: 'MT',
    avatarColor: 'bg-amber-100 text-amber-700',
    permissions: {
      fullAccess: false,
      billing: false,
      userManagement: false,
      leads: false,
      listings: false,
      tours: false,
      conversations: false,
      analytics: true,
      settings: false,
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

export default function Settings() {
  const { role, setRole } = useRole();
  const [users, setUsers] = useState<UserPermissions[]>(INITIAL_USERS);
  const [notifications, setNotifications] = useState({
    newLeadAlerts: true,
    tourReminders: true,
    weeklyReports: false,
  });

  function togglePermission(userId: string, perm: Permission) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, permissions: { ...u.permissions, [perm]: !u.permissions[perm] } }
          : u,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">
          Manage your company profile, integrations, user permissions, and billing preferences
        </p>
      </div>

      <div className="bg-slate-100 rounded-xl border border-slate-200 p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-slate-900">Switch view (demo)</p>
          <p className="text-sm text-slate-500">Preview the app as Admin or Agent</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${role === 'admin' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}
          >
            <Users size={18} />
            Admin
          </button>
          <button
            type="button"
            onClick={() => setRole('agent')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${role === 'agent' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'}`}
          >
            <User size={18} />
            Agent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          className="flex items-center justify-between p-5 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-100 text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center">
              <Building2 className="text-brand-600" size={20} />
            </div>
            <div>
              <p className="font-medium text-slate-900">Company Profile</p>
              <p className="text-sm text-slate-500">Basic information</p>
            </div>
          </div>
          <ArrowRight className="text-slate-400" size={20} />
        </button>
        <button
          type="button"
          className="flex items-center justify-between p-5 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-100 text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <MessageCircle className="text-emerald-600" size={20} />
            </div>
            <div>
              <p className="font-medium text-slate-900">Integrations</p>
              <p className="text-sm text-slate-500">3 active connections</p>
            </div>
          </div>
          <ArrowRight className="text-slate-400" size={20} />
        </button>
        <button
          type="button"
          className="flex items-center justify-between p-5 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-100 text-left transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Globe className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="font-medium text-slate-900">User Settings</p>
              <p className="text-sm text-slate-500">Roles &amp; Permissions</p>
            </div>
          </div>
          <ArrowRight className="text-slate-400" size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Company Profile</h2>
            <button
              type="button"
              onClick={() => toast.success('Settings saved.')}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
            >
              Save Changes
            </button>
          </div>
          <div className="space-y-4">
            {['Company Name', 'Email Address', 'Phone Number', 'Address', 'Website'].map(
              (label) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder={label}
                  />
                </div>
              ),
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Integrations</h2>
            <button
              type="button"
              className="px-4 py-2 border border-brand-600 text-brand-600 rounded-lg text-sm font-medium hover:bg-brand-50"
            >
              Add Integration
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                  W
                </div>
                <div>
                  <p className="font-medium text-slate-900">WhatsApp Business</p>
                  <p className="text-xs text-slate-500">Connected 3 days ago &middot; Messages handled</p>
                </div>
              </div>
              <span className="text-brand-600 font-medium">2,847</span>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  f
                </div>
                <div>
                  <p className="font-medium text-slate-900">Meta (Facebook)</p>
                  <p className="text-xs text-slate-500">Connected 1 week ago &middot; Lead imports</p>
                </div>
              </div>
              <span className="text-brand-600 font-medium">1,452</span>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Website Widget</p>
                  <p className="text-xs text-slate-500">Connected 2 weeks ago &middot; Chat sessions</p>
                </div>
              </div>
              <span className="text-brand-600 font-medium">3,921</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Roles & Permissions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-brand-600" />
            <h2 className="font-semibold text-slate-900">User Roles &amp; Permissions</h2>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
          >
            <UserPlus size={15} />
            Add User
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">
                <th className="px-6 py-3 whitespace-nowrap">User</th>
                <th className="px-6 py-3 whitespace-nowrap">Role</th>
                {PERMISSIONS.map((p) => (
                  <th key={p.key} className="px-3 py-3 text-center whitespace-nowrap">
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.avatarColor}`}
                      >
                        {user.initials}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {user.role}
                    </span>
                  </td>
                  {PERMISSIONS.map((p) => (
                    <td key={p.key} className="px-3 py-4 text-center">
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

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell size={18} className="text-brand-600" />
          <h2 className="font-semibold text-slate-900">Notification Settings</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="font-medium text-slate-900">New Lead Alerts</p>
              <p className="text-sm text-slate-500 mt-0.5">Get notified when a new lead comes in</p>
            </div>
            <Toggle
              checked={notifications.newLeadAlerts}
              onChange={() =>
                setNotifications((n) => ({ ...n, newLeadAlerts: !n.newLeadAlerts }))
              }
            />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="font-medium text-slate-900">Tour Reminders</p>
              <p className="text-sm text-slate-500 mt-0.5">Morning reminders for scheduled tours</p>
            </div>
            <Toggle
              checked={notifications.tourReminders}
              onChange={() =>
                setNotifications((n) => ({ ...n, tourReminders: !n.tourReminders }))
              }
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-slate-900">Weekly Reports</p>
              <p className="text-sm text-slate-500 mt-0.5">Receive weekly performance summary</p>
            </div>
            <Toggle
              checked={notifications.weeklyReports}
              onChange={() =>
                setNotifications((n) => ({ ...n, weeklyReports: !n.weeklyReports }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
