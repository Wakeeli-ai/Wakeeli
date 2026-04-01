import { TrendingUp, MessageSquare, Users, DollarSign, Zap, Activity, Clock } from 'lucide-react'
import { COMPANIES, MONTHLY_REVENUE, CONVERSATIONS_TREND } from '../data/mockData'

export default function Analytics() {
  const totalRevenue = COMPANIES.reduce((s, c) => s + c.monthlyRevenue, 0)
  const totalLeads = COMPANIES.reduce((s, c) => s + c.activeLeads, 0)
  const totalConversations = COMPANIES.reduce((s, c) => s + c.monthlyConversations, 0)
  const activeCompanies = COMPANIES.filter(c => c.status === 'active')
  const avgConversion = (activeCompanies.reduce((s, c) => s + c.conversionRate, 0) / activeCompanies.length).toFixed(1)

  const maxRevenue = Math.max(...MONTHLY_REVENUE.map(m => m.revenue))
  const maxConversations = Math.max(...CONVERSATIONS_TREND.map(m => m.total))

  const sortedByRevenue = [...COMPANIES].sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
  const topCompanies = sortedByRevenue.slice(0, 5)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Platform Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Overview of all activity across the Wakeeli platform</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: <DollarSign size={20} className="text-green-600" />, label: 'Monthly Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+12.4%', bg: 'bg-green-50' },
          { icon: <Users size={20} className="text-blue-600" />, label: 'Active Leads', value: totalLeads.toLocaleString(), change: '+8.1%', bg: 'bg-blue-50' },
          { icon: <MessageSquare size={20} className="text-purple-600" />, label: 'Conversations', value: totalConversations.toLocaleString(), change: '+18.7%', bg: 'bg-purple-50' },
          { icon: <TrendingUp size={20} className="text-amber-600" />, label: 'Avg Conversion', value: `${avgConversion}%`, change: '+2.3%', bg: 'bg-amber-50' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.bg}`}>
              {kpi.icon}
            </div>
            <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
            <p className="text-xs font-medium text-slate-700 mt-0.5">{kpi.label}</p>
            <p className="text-xs text-green-600 font-medium mt-1">{kpi.change} vs last month</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Revenue chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900 text-sm">Monthly Revenue</h3>
            <span className="text-xs text-slate-400">Last 7 months</span>
          </div>
          <div className="flex items-end gap-2 h-36">
            {MONTHLY_REVENUE.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500 font-medium">${(m.revenue / 1000).toFixed(1)}k</span>
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: `${(m.revenue / maxRevenue) * 100}px`,
                    background: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
                    minHeight: '8px',
                  }}
                />
                <span className="text-xs text-slate-400">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversations chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900 text-sm">Monthly Conversations</h3>
            <span className="text-xs text-slate-400">Last 7 months</span>
          </div>
          <div className="flex items-end gap-2 h-36">
            {CONVERSATIONS_TREND.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500 font-medium">{(m.total / 1000).toFixed(1)}k</span>
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: `${(m.total / maxConversations) * 100}px`,
                    background: 'linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%)',
                    minHeight: '8px',
                  }}
                />
                <span className="text-xs text-slate-400">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Top companies by revenue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Revenue by Company</h3>
          <div className="space-y-3">
            {topCompanies.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: c.plan === 'enterprise' ? '#7c3aed' : '#2563eb' }}>
                  {c.initials.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs font-semibold text-green-600">${c.monthlyRevenue > 0 ? c.monthlyRevenue : 0}</p>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${topCompanies[0].monthlyRevenue > 0 ? (c.monthlyRevenue / topCompanies[0].monthlyRevenue) * 100 : 0}%`,
                        background: c.plan === 'enterprise' ? '#7c3aed' : '#2563eb',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Performance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">AI Performance Metrics</h3>
          <div className="space-y-4">
            {[
              { label: 'Avg AI Response Time', value: '1m 38s', icon: <Clock size={16} className="text-blue-500" />, sub: 'Across all companies' },
              { label: 'Bot Handoff Rate', value: '24.3%', icon: <Activity size={16} className="text-amber-500" />, sub: 'Conversations escalated to agent' },
              { label: 'AI Resolution Rate', value: '75.7%', icon: <Zap size={16} className="text-green-500" />, sub: 'Resolved without agent' },
              { label: 'Avg Satisfaction Score', value: '4.7 / 5', icon: <TrendingUp size={16} className="text-purple-500" />, sub: 'Based on 1,240 ratings' },
            ].map(metric => (
              <div key={metric.label} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  {metric.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-500">{metric.label}</p>
                  <p className="text-xs text-slate-400">{metric.sub}</p>
                </div>
                <p className="text-sm font-bold text-slate-900">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
