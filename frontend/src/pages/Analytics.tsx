import { useState } from 'react';
import { Users, CheckCircle, Calendar, Clock, TrendingUp, TrendingDown } from 'lucide-react';

const PERIODS = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'];

const kpis = [
  {
    label: 'Total Leads',
    value: '1,847',
    change: '+12.4%',
    positive: true,
    icon: Users,
    color: 'text-brand-600',
    bg: 'bg-brand-50',
  },
  {
    label: 'Tours to Deals Ratio',
    value: '5.2%',
    change: '+5.8%',
    positive: true,
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    label: 'Tours Booked',
    value: '542',
    change: '+18.3%',
    positive: true,
    icon: Calendar,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    label: 'Avg Response Time',
    value: '4.2m',
    change: '-22.1%',
    positive: true,
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
];

const leadSources = [
  { label: 'WhatsApp', pct: 45, bar: 'bg-brand-600' },
  { label: 'Website', pct: 28, bar: 'bg-emerald-500' },
  { label: 'Instagram', pct: 18, bar: 'bg-purple-500' },
  { label: 'Referral', pct: 9, bar: 'bg-amber-500' },
];

const aiVsHuman = [
  { metric: 'Avg Response Time', ai: '0.8 min', human: '4.2 min' },
  { metric: 'First Contact Rate', ai: '98%', human: '67%' },
  { metric: 'Tours Booked / Lead', ai: '32%', human: '18%' },
  { metric: 'Satisfaction Score', ai: '4.6/5', human: '4.3/5' },
];

const monthlyTrends = [
  { month: 'Nov 2024', leads: 1204, tours: 312, deals: 14, rate: '4.5%' },
  { month: 'Dec 2024', leads: 1380, tours: 378, deals: 17, rate: '4.5%' },
  { month: 'Jan 2025', leads: 1510, tours: 401, deals: 19, rate: '4.7%' },
  { month: 'Feb 2025', leads: 1623, tours: 448, deals: 22, rate: '4.9%' },
  { month: 'Mar 2025', leads: 1741, tours: 498, deals: 26, rate: '5.2%' },
  { month: 'Apr 2025', leads: 1847, tours: 542, deals: 28, rate: '5.2%' },
];

export default function Analytics() {
  const [period, setPeriod] = useState('Last 30 Days');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500 mt-1">Business performance overview</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {PERIODS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {card.positive ? (
                      <TrendingUp size={13} className="text-emerald-600" />
                    ) : (
                      <TrendingDown size={13} className="text-red-500" />
                    )}
                    <span
                      className={`text-xs font-semibold ${card.positive ? 'text-emerald-600' : 'text-red-500'}`}
                    >
                      {card.change}
                    </span>
                    <span className="text-xs text-slate-400">vs last period</span>
                  </div>
                </div>
                <div className={`${card.bg} p-2 rounded-lg`}>
                  <Icon className={card.color} size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Source Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-5">Lead Source Breakdown</h2>
          <div className="space-y-4">
            {leadSources.map((src) => (
              <div key={src.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">{src.label}</span>
                  <span className="text-sm font-semibold text-slate-900">{src.pct}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${src.bar} rounded-full transition-all duration-300`}
                    style={{ width: `${src.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI vs Human Performance */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-5">AI vs Human Performance</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                <th className="pb-3 pr-4">Metric</th>
                <th className="pb-3 text-center">
                  <span className="bg-brand-100 text-brand-700 px-2.5 py-0.5 rounded-full font-semibold">
                    AI
                  </span>
                </th>
                <th className="pb-3 text-center">
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                    Human
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {aiVsHuman.map((row) => (
                <tr key={row.metric}>
                  <td className="py-3 pr-4 text-slate-600">{row.metric}</td>
                  <td className="py-3 text-center font-semibold text-brand-700">{row.ai}</td>
                  <td className="py-3 text-center font-medium text-slate-500">{row.human}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Monthly Trends</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide bg-slate-50">
                <th className="px-6 py-3">Month</th>
                <th className="px-6 py-3 text-right">Leads</th>
                <th className="px-6 py-3 text-right">Tours</th>
                <th className="px-6 py-3 text-right">Deals</th>
                <th className="px-6 py-3 text-right">Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTrends.map((row, i) => (
                <tr key={row.month} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="px-6 py-3 font-medium text-slate-700">{row.month}</td>
                  <td className="px-6 py-3 text-right tabular-nums text-slate-900">
                    {row.leads.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right tabular-nums text-slate-700">{row.tours}</td>
                  <td className="px-6 py-3 text-right tabular-nums text-slate-700">{row.deals}</td>
                  <td className="px-6 py-3 text-right">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {row.rate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
