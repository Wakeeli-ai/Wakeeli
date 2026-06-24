import { useState } from 'react'
import { Bell, Globe, Shield, ChevronRight } from 'lucide-react'

export default function Settings() {
  const [activeSection, setActiveSection] = useState('notifications')
  const [notifications, setNotifications] = useState({
    newCompany: true,
    paymentFailed: true,
    churn: true,
    weeklyReport: true,
    lowActivity: false,
  })

  const SECTIONS = [
    { id: 'notifications', icon: <Bell size={16} />, label: 'Notifications' },
    { id: 'platform', icon: <Globe size={16} />, label: 'Platform Settings' },
    { id: 'security', icon: <Shield size={16} />, label: 'Security' },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform configuration and management</p>
      </div>

      <div className="flex gap-5">
        {/* Sidebar nav */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 space-y-1">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeSection === s.id
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {s.icon}
                  {s.label}
                </div>
                {activeSection !== s.id && <ChevronRight size={14} className="text-slate-300" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-1">Notification Preferences</h2>
              <p className="text-sm text-slate-500 mb-5">Choose what platform events trigger alerts.</p>
              <div className="space-y-4">
                {[
                  { key: 'newCompany', label: 'New company signup', desc: 'Alert when a new company joins the platform' },
                  { key: 'paymentFailed', label: 'Payment failed', desc: 'Alert when a subscription payment fails' },
                  { key: 'churn', label: 'Company churn', desc: 'Alert when a company cancels their subscription' },
                  { key: 'weeklyReport', label: 'Weekly report', desc: 'Receive a weekly platform summary every Monday' },
                  { key: 'lowActivity', label: 'Low activity warning', desc: 'Alert when a company has no activity for 7 days' },
                ].map(item => (
                  <div key={item.key} className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                        notifications[item.key as keyof typeof notifications] ? 'bg-brand-600' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'platform' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h2 className="font-semibold text-slate-900 mb-5">Platform Configuration</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Platform Name', value: 'Wakeeli' },
                    { label: 'Support Email', value: 'support@wakeeli.com' },
                    { label: 'Default Timezone', value: 'Asia/Beirut' },
                    { label: 'Default Language', value: 'English (EN)' },
                    { label: 'Trial Period (days)', value: '14' },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">{field.label}</label>
                      <input
                        type="text"
                        defaultValue={field.value}
                        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  ))}
                  <div className="pt-2">
                    <button className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h2 className="font-semibold text-slate-900 mb-1">Security Settings</h2>
                <p className="text-sm text-slate-500 mb-5">Manage platform-level security configuration.</p>
                <div className="space-y-4">
                  {[
                    { label: 'Two-factor authentication', desc: 'Required for all admin access', enabled: true },
                    { label: 'IP allowlist', desc: 'Restrict access to specific IP ranges', enabled: false },
                    { label: 'Audit log', desc: 'Log all admin actions for compliance', enabled: true },
                    { label: 'Session timeout', desc: 'Auto-logout after 8 hours of inactivity', enabled: true },
                  ].map(item => (
                    <div key={item.label} className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${item.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {item.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900 text-sm mb-4">Change Admin Password</h3>
                <div className="space-y-3 max-w-sm">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Current Password</label>
                    <input type="password" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">New Password</label>
                    <input type="password" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                    <input type="password" className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500" />
                  </div>
                  <button className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
