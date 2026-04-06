import { useState } from 'react';
import { Users, CheckCircle, Calendar, Clock, TrendingUp, TrendingDown, Download } from 'lucide-react';

const PERIOD_OPTIONS = [
  { key: '7D', label: '7D' },
  { key: '30D', label: '30D' },
  { key: '90D', label: '90D' },
  { key: 'all', label: 'All' },
];

const kpis = [
  {
    label: 'Total Leads',
    value: '1,847',
    change: '+12.4%',
    positive: true,
    icon: Users,
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    borderColor: '#2563eb',
  },
  {
    label: 'Deals Closed',
    value: '28',
    change: '+7.7%',
    positive: true,
    icon: CheckCircle,
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
    borderColor: '#16a34a',
  },
  {
    label: 'Tours Booked',
    value: '542',
    change: '+18.3%',
    positive: true,
    icon: Calendar,
    iconBg: '#fffbeb',
    iconColor: '#b45309',
    borderColor: '#f59e0b',
  },
  {
    label: 'Avg Response',
    value: '4.2m',
    change: '-22.1%',
    positive: true,
    icon: Clock,
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
    borderColor: '#16a34a',
  },
  {
    label: 'Conversion Rate',
    value: '5.2%',
    change: '+0.6%',
    positive: true,
    icon: TrendingUp,
    iconBg: '#faf5ff',
    iconColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
];

const leadSources = [
  { label: 'WhatsApp', pct: 45, color: '#16a34a' },
  { label: 'Website', pct: 28, color: '#2563eb' },
  { label: 'Instagram', pct: 18, color: '#7c3aed' },
  { label: 'Referral', pct: 9, color: '#f59e0b' },
];

const conversionFunnel = [
  { label: 'AI Engaged', value: 201, pct: 94, color: '#7c3aed', bg: '#ede9fe' },
  { label: 'Qualified', value: 148, pct: 69, color: '#2563eb', bg: '#dbeafe' },
  { label: 'Tour Booked', value: 84, pct: 39, color: '#0891b2', bg: '#cffafe' },
  { label: 'Offer Made', value: 42, pct: 20, color: '#16a34a', bg: '#dcfce7' },
  { label: 'Closed', value: 28, pct: 13, color: '#15803d', bg: '#bbf7d0' },
];

const responseTimeDist = [
  { label: 'Under 15 min', pct: 42, color: '#16a34a' },
  { label: '15 min to 1 hour', pct: 31, color: '#2563eb' },
  { label: '1 to 3 hours', pct: 18, color: '#f59e0b' },
  { label: 'Over 3 hours', pct: 9, color: '#ef4444' },
];

const dealsByType = [
  { label: 'Rent', pct: 58, color: '#2563eb' },
  { label: 'Sale', pct: 29, color: '#16a34a' },
  { label: 'Commercial', pct: 13, color: '#f59e0b' },
];

const aiVsHuman = [
  { metric: 'Avg Response Time', ai: '0.8 min', human: '4.2 min', better: 'ai' },
  { metric: 'First Contact Rate', ai: '98%', human: '67%', better: 'ai' },
  { metric: 'Tours Booked / Lead', ai: '32%', human: '18%', better: 'ai' },
  { metric: 'Satisfaction Score', ai: '4.6/5', human: '4.3/5', better: 'ai' },
];

const monthlyTrends = [
  { month: 'Nov 2024', leads: 1204, tours: 312, deals: 14, rate: '4.5%' },
  { month: 'Dec 2024', leads: 1380, tours: 378, deals: 17, rate: '4.5%' },
  { month: 'Jan 2025', leads: 1510, tours: 401, deals: 19, rate: '4.7%' },
  { month: 'Feb 2025', leads: 1623, tours: 448, deals: 22, rate: '4.9%' },
  { month: 'Mar 2025', leads: 1741, tours: 498, deals: 26, rate: '5.2%' },
  { month: 'Apr 2025', leads: 1847, tours: 542, deals: 28, rate: '5.2%' },
];

const weeklyBars = [
  { week: 'W1', whatsapp: 42, website: 28, instagram: 18 },
  { week: 'W2', whatsapp: 55, website: 35, instagram: 22 },
  { week: 'W3', whatsapp: 38, website: 24, instagram: 15 },
  { week: 'W4', whatsapp: 67, website: 44, instagram: 27 },
];

const agentPerf = [
  { name: 'Michel Boutros', leads: 97, tours: 31, deals: 8, conv: 55, response: '6m 40s' },
  { name: 'Joelle Rizk', leads: 74, tours: 24, deals: 6, conv: 48, response: '7m 20s' },
  { name: 'Elie Khoury', leads: 55, tours: 18, deals: 4, conv: 43, response: '9m 10s' },
  { name: 'Roula Bou Jawde', leads: 42, tours: 14, deals: 3, conv: 36, response: '8m 50s' },
  { name: 'Karim Haddad', leads: 38, tours: 12, deals: 2, conv: 32, response: '10m 30s' },
];

function DonutChart({ segments, total }: { segments: { label: string; pct: number; color: string }[]; total: string }) {
  const r = 15.91;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg width="100" height="100" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
        {segments.map((seg, i) => {
          const dashArray = `${(seg.pct / 100) * circumference} ${circumference}`;
          const offset = -((cumulative / 100) * circumference) + circumference * 0.25;
          cumulative += seg.pct;
          return (
            <circle
              key={i}
              cx="21"
              cy="21"
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="5"
              strokeDasharray={dashArray}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          );
        })}
        <text x="21" y="23" textAnchor="middle" fontSize="6" fontWeight="800" fill="#0f172a">
          {total}
        </text>
      </svg>
      <div className="space-y-1.5 w-full">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: seg.color }} />
              <span className="text-xs text-slate-600">{seg.label}</span>
            </div>
            <span className="text-xs font-bold" style={{ color: seg.color }}>{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [period, setPeriod] = useState('30D');
  const [agentFilter, setAgentFilter] = useState('All Agents');
  const [sourceFilter, setSourceFilter] = useState('All Sources');

  const maxBar = Math.max(...weeklyBars.map((w) => w.whatsapp + w.website + w.instagram));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Performance metrics and conversion insights</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm gap-0.5">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setPeriod(opt.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  period === opt.key
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 shadow-sm"
          >
            <option>All Agents</option>
            <option>AI Only</option>
            <option>Human Only</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 shadow-sm"
          >
            <option>All Sources</option>
            <option>WhatsApp</option>
            <option>Website</option>
            <option>Instagram</option>
          </select>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={14} />
            Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm border-l-4"
              style={{ borderLeftColor: card.borderColor }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500 truncate">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {card.positive ? (
                      <TrendingUp size={11} className="text-emerald-600 flex-shrink-0" />
                    ) : (
                      <TrendingDown size={11} className="text-red-500 flex-shrink-0" />
                    )}
                    <span className={`text-xs font-bold ${card.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {card.change}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg p-2 flex-shrink-0" style={{ background: card.iconBg }}>
                  <Icon size={16} style={{ color: card.iconColor }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lead Volume + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly bar chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Lead Volume</h2>
              <p className="text-xs text-slate-400 mt-0.5">Weekly breakdown by source</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#c7d2fe' }} /> WhatsApp</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#a7f3d0' }} /> Website</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#ddd6fe' }} /> Instagram</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-36">
            {weeklyBars.map((w) => {
              const total = w.whatsapp + w.website + w.instagram;
              const h1 = (w.whatsapp / maxBar) * 100;
              const h2 = (w.website / maxBar) * 100;
              const h3 = (w.instagram / maxBar) * 100;
              return (
                <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5 h-28">
                    <div
                      className="flex-1 rounded-t-md transition-all"
                      style={{ height: `${h1}%`, background: '#818cf8', minHeight: 3 }}
                    />
                    <div
                      className="flex-1 rounded-t-md transition-all"
                      style={{ height: `${h2}%`, background: '#34d399', minHeight: 3 }}
                    />
                    <div
                      className="flex-1 rounded-t-md transition-all"
                      style={{ height: `${h3}%`, background: '#a78bfa', minHeight: 3 }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-600">{w.week}</p>
                    <p className="text-[10px] text-slate-400">{total}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead sources grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 text-sm mb-4">Lead Sources</h2>
          <div className="grid grid-cols-2 gap-3">
            {leadSources.map((src) => (
              <div
                key={src.label}
                className="rounded-xl p-3 border text-center"
                style={{ background: `${src.color}10`, borderColor: `${src.color}30` }}
              >
                <p className="text-xl font-bold" style={{ color: src.color }}>{src.pct}%</p>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">{src.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {leadSources.map((src) => (
              <div key={src.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">{src.label}</span>
                  <span className="text-xs font-bold" style={{ color: src.color }}>{src.pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${src.pct}%`, background: src.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funnel + Response + Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Conversion funnel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 text-sm mb-4">Conversion Funnel</h2>
          <div className="space-y-2.5">
            {conversionFunnel.map((step) => (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-600">{step.label}</span>
                  <span className="text-xs font-bold text-slate-400">{step.pct}%</span>
                </div>
                <div className="h-7 rounded-lg overflow-hidden" style={{ background: step.bg }}>
                  <div
                    className="h-full rounded-lg flex items-center px-2.5 transition-all duration-500"
                    style={{ width: `${step.pct}%`, background: step.color, minWidth: 40 }}
                  >
                    <span className="text-xs font-bold text-white">{step.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response time */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 text-sm mb-4">Response Time</h2>
          <div className="space-y-3">
            {responseTimeDist.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600">{item.label}</span>
                  <span className="text-xs font-bold" style={{ color: item.color }}>{item.pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-[#f0fdf4] rounded-lg">
              <span className="text-xs font-semibold text-slate-700">AI Response</span>
              <span className="text-sm font-bold text-emerald-600">0.8 min</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-[#f8fafc] rounded-lg">
              <span className="text-xs font-semibold text-slate-700">Human Response</span>
              <span className="text-sm font-bold text-slate-700">4.2 min</span>
            </div>
          </div>
        </div>

        {/* Deals by type (donut) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 text-sm mb-4">Deals by Type</h2>
          <DonutChart segments={dealsByType} total="28" />
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
            {dealsByType.map((d) => (
              <div key={d.label}>
                <p className="text-sm font-bold" style={{ color: d.color }}>{d.pct}%</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{d.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI vs Human + Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI vs Human */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 text-sm mb-4">AI vs Human Performance</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="pb-3">Metric</th>
                <th className="pb-3 text-center">
                  <span className="inline-flex px-2.5 py-1 rounded-full" style={{ background: '#dbeafe', color: '#2563eb' }}>AI</span>
                </th>
                <th className="pb-3 text-center">
                  <span className="inline-flex px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">Human</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {aiVsHuman.map((row) => (
                <tr key={row.metric}>
                  <td className="py-2.5 text-slate-600 text-xs">{row.metric}</td>
                  <td className="py-2.5 text-center font-bold text-brand-700 text-sm">{row.ai}</td>
                  <td className="py-2.5 text-center font-medium text-slate-500 text-sm">{row.human}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI Volume */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 text-sm mb-4">AI Volume</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
              <div>
                <p className="text-sm font-semibold text-slate-700">AI Handled Conversations</p>
                <p className="text-xs text-slate-500 mt-0.5">69.5% of total</p>
              </div>
              <p className="text-2xl font-bold text-brand-700">1,284</p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
              <div>
                <p className="text-sm font-semibold text-slate-700">AI to Agent Handoffs</p>
                <p className="text-xs text-slate-500 mt-0.5">11.4% of AI conversations</p>
              </div>
              <p className="text-2xl font-bold text-amber-700">147</p>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border bg-[#f8fafc] border-slate-200">
              <div>
                <p className="text-sm font-semibold text-slate-700">AI Qualification Rate</p>
                <p className="text-xs text-slate-500 mt-0.5">vs human agent: +6.2%</p>
              </div>
              <p className="text-2xl font-bold text-slate-800">72.4%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Performance */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Agent Performance</h2>
            <p className="text-xs text-slate-400 mt-0.5">Ranked by conversion rate</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Agent</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Leads</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Tours</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Deals</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-40">Conversion</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg Response</th>
              </tr>
            </thead>
            <tbody>
              {agentPerf.map((agent, i) => {
                const convColor = agent.conv >= 50 ? '#16a34a' : agent.conv >= 40 ? '#2563eb' : '#f59e0b';
                const rowBg = i % 2 === 1 ? 'bg-[#f8fafc]/60' : 'bg-white';
                return (
                  <tr key={agent.name} className={`${rowBg} border-b border-slate-100 last:border-0`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                          style={{ background: '#ede9fe', color: '#7c3aed' }}
                        >
                          {agent.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-700">{agent.leads}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{agent.tours}</td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{agent.deals}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${agent.conv}%`, background: convColor }}
                          />
                        </div>
                        <span className="text-xs font-bold w-8 text-right" style={{ color: convColor }}>{agent.conv}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-500 text-xs">{agent.response}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-sm">Monthly Trends</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Month</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Leads</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Tours</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Deals</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Rate</th>
              </tr>
            </thead>
            <tbody>
              {monthlyTrends.map((row, i) => (
                <tr key={row.month} className={`${i % 2 === 1 ? 'bg-[#f8fafc]/60' : 'bg-white'} border-b border-slate-100 last:border-0`}>
                  <td className="px-5 py-3 font-semibold text-slate-700">{row.month}</td>
                  <td className="px-5 py-3 text-right tabular-nums font-medium text-slate-900">{row.leads.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-600">{row.tours}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-slate-600">{row.deals}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: '#f0fdf4', color: '#16a34a' }}>
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
