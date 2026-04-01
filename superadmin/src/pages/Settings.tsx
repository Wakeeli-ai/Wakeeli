import { useState } from 'react'
import { Key, Bell, CreditCard, Globe, Shield, ChevronRight, Copy } from 'lucide-react'

const PLANS = [
  {
    name: 'Starter',
    price: 149,
    color: '#64748b',
    features: ['2 WhatsApp agents', '100 leads/month', '500 AI conversations', 'Basic analytics', 'Email support'],
  },
  {
    name: 'Professional',
    price: 599,
    color: '#2563eb',
    features: ['5 WhatsApp agents', '500 leads/month', '2,000 AI conversations', 'Advanced analytics', 'Priority support', 'Custom AI training'],
  },
  {
    name: 'Enterprise',
    price: 1200,
    color: '#7c3aed',
    features: ['Unlimited agents', 'Unlimited leads', 'Unlimited conversations', 'Full analytics suite', 'Dedicated support', 'Custom integrations', 'White-label option'],
  },
]

const API_KEYS = [
  { name: 'Production API Key', key: 'wk_prod_xxxxxxxxxxxxxxxx3f9a', created: '2024-01-15', lastUsed: '2 minutes ago' },
  { name: 'Staging API Key', key: 'wk_stg_xxxxxxxxxxxxxxxx7b2c', created: '2024-03-08', lastUsed: '1 day ago' },
  { name: 'Webhook Secret', key: 'wh_xxxxxxxxxxxxxxxxxxxx2e4d', created: '2024-01-15', lastUsed: 'Never' },
]

export default function Settings() {
  const [activeSection, setActiveSection] = useState('plans')
  const [notifications, setNotifications] = useState({
    newCompany: true,
    paymentFailed: true,
    churn: true,
    weeklyReport: true,
    lowActivity: false,
  })

  const SECTIONS = [
    { id: 'plans', icon: <CreditCard size={16} />, label: 'Plan Management' },
    { id: 'api', icon: <Key size={16} />, label: 'API Keys' },
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
          {activeSection === 'plans' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h2 className="font-semibold text-slate-900 mb-1">Pricing Tiers</h2>
                <p className="text-sm text-slate-500 mb-5">Configure subscription plans for client companies.</p>
                <div className="grid grid-cols-3 gap-4">
                  {PLANS.map(plan => (
                    <div key={plan.name} className="rounded-2xl border-2 p-5" style={{ borderColor: plan.color + '40' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full" style={{ background: plan.color }} />
                        <span className="font-semibold text-slate-900">{plan.name}</span>
                      </div>
                      <p className="text-3xl font-bold mb-0.5" style={{ color: plan.color }}>${plan.price}</p>
                      <p className="text-xs text-slate-400 mb-4">per month</p>
                      <ul className="space-y-2">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: plan.color }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-semibold text-slate-900 mb-1">API Keys</h2>
                  <p className="text-sm text-slate-500">Manage platform API credentials.</p>
                </div>
                <button className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors">
                  Generate New Key
                </button>
              </div>
              <div className="space-y-3">
                {API_KEYS.map(k => (
                  <div key={k.name} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{k.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Created: {k.created}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                          <Copy size={14} />
                        </button>
                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                          Revoke
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <code className="flex-1 bg-slate-50 px-3 py-2 rounded-lg text-xs text-slate-700 font-mono">{k.key}</code>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Last used: {k.lastUsed}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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
