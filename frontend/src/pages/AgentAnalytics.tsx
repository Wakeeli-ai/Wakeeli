import { useState } from 'react';
import { MessageSquare, Calendar, Users, TrendingUp, Clock } from 'lucide-react';

const PERIOD_OPTIONS = [
  { key: '7D', label: '7D' },
  { key: '30D', label: '30D' },
  { key: '90D', label: '90D' },
];

const agentKpis = [
  {
    label: 'Conversations',
    value: '97',
    change: '+14% vs last period',
    positive: true,
    icon: MessageSquare,
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    borderColor: '#2563eb',
  },
  {
    label: 'Tours Booked',
    value: '31',
    change: '+22% vs last period',
    positive: true,
    icon: Calendar,
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
    borderColor: '#16a34a',
  },
  {
    label: 'Active Leads',
    value: '12',
    change: '+3 this week',
    positive: true,
    icon: Users,
    iconBg: '#fffbeb',
    iconColor: '#b45309',
    borderColor: '#f59e0b',
  },
  {
    label: 'Conversion Rate',
    value: '55%',
    change: '+8% vs last month',
    positive: true,
    icon: TrendingUp,
    iconBg: '#faf5ff',
    iconColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  {
    label: 'Avg Response',
    value: '6m 40s',
    change: '-1m improvement',
    positive: true,
    icon: Clock,
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
    borderColor: '#16a34a',
  },
];

const weeklyBars = [
  { week: 'W1', conversations: 22, tours: 7, closed: 2 },
  { week: 'W2', conversations: 28, tours: 9, closed: 3 },
  { week: 'W3', conversations: 19, tours: 6, closed: 1 },
  { week: 'W4', conversations: 28, tours: 9, closed: 2 },
];

const leadStages = [
  { label: 'Qualified', pct: 35, color: '#7c3aed' },
  { label: 'New', pct: 28, color: '#2563eb' },
  { label: 'Tour Booked', pct: 22, color: '#0891b2' },
  { label: 'Closed', pct: 15, color: '#16a34a' },
];

const conversionFunnel = [
  { label: 'Leads Received', value: 97, pct: 100, color: '#7c3aed', bg: '#ede9fe' },
  { label: 'Qualified', value: 68, pct: 70, color: '#2563eb', bg: '#dbeafe' },
  { label: 'Tour Booked', value: 31, pct: 32, color: '#0891b2', bg: '#cffafe' },
  { label: 'Offer Made', value: 14, pct: 14, color: '#16a34a', bg: '#dcfce7' },
  { label: 'Closed', value: 8, pct: 8, color: '#15803d', bg: '#bbf7d0' },
];

const monthlyTrends = [
  { month: 'Nov 2024', convs: 68, tours: 22, deals: 5, rate: '49%' },
  { month: 'Dec 2024', convs: 74, tours: 24, deals: 6, rate: '51%' },
  { month: 'Jan 2025', convs: 80, tours: 26, deals: 6, rate: '52%' },
  { month: 'Feb 2025', convs: 88, tours: 28, deals: 7, rate: '53%' },
  { month: 'Mar 2025', convs: 91, tours: 29, deals: 7, rate: '54%' },
  { month: 'Apr 2025', convs: 97, tours: 31, deals: 8, rate: '55%' },
];

function DonutChart({
  segments,
  total,
}: {
  segments: { label: string; pct: number; color: string }[];
  total: string;
}) {
  const r = 15.91;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg width="110" height="110" viewBox="0 0 42 42">
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
        <text
          x="21"
          y="21"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="6"
          fontWeight="bold"
          fill="#0f172a"
        >
          {total}
        </text>
      </svg>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: seg.color }}
            />
            <span className="text-xs text-slate-500">{seg.label}</span>
            <span className="text-xs font-semibold text-slate-700">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AgentAnalytics() {
  const [period, setPeriod] = useState('30D');
  const maxConvs = Math.max(...weeklyBars.map((b) => b.conversations));

  return (
    <div className="space-y-5 pb-24 md:pb-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Analytics</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Your personal performance overview</p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPeriod(opt.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                period === opt.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {agentKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 shadow-sm border-l-4"
              style={{ borderLeftColor: kpi.borderColor }}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{kpi.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{kpi.change}</p>
                </div>
                <div
                  className="rounded-lg p-1.5 md:p-2 flex-shrink-0 ml-2"
                  style={{ background: kpi.iconBg }}
                >
                  <Icon size={16} style={{ color: kpi.iconColor }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Activity Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Weekly Activity</h2>

          {/* Desktop */}
          <div className="hidden md:block">
            <div className="flex items-end gap-4" style={{ height: 130 }}>
              {weeklyBars.map((bar) => (
                <div key={bar.week} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full flex flex-col justify-end gap-0.5"
                    style={{ height: 110 }}
                  >
                    <div
                      className="w-full rounded-t-sm"
                      style={{
                        height: `${(bar.conversations / maxConvs) * 70}%`,
                        background: '#7c3aed',
                        minHeight: 4,
                      }}
                    />
                    <div
                      className="w-full"
                      style={{
                        height: `${(bar.tours / maxConvs) * 50}%`,
                        background: '#0891b2',
                        minHeight: 3,
                      }}
                    />
                    <div
                      className="w-full"
                      style={{
                        height: `${(bar.closed / maxConvs) * 25}%`,
                        background: '#16a34a',
                        minHeight: 2,
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{bar.week}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3">
              {[
                { label: 'Conversations', color: '#7c3aed' },
                { label: 'Tours', color: '#0891b2' },
                { label: 'Deals', color: '#16a34a' },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ background: l.color }}
                  />
                  <span className="text-xs text-slate-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile fallback */}
          <div className="md:hidden space-y-2">
            {weeklyBars.map((bar) => (
              <div key={bar.week} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-8 font-medium">{bar.week}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(bar.conversations / maxConvs) * 100}%`,
                      background: '#7c3aed',
                    }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700 w-6 text-right">
                  {bar.conversations}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Stages Donut */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Lead Stages</h2>

          {/* Desktop */}
          <div className="hidden md:flex items-center justify-center py-2">
            <DonutChart segments={leadStages} total="97" />
          </div>

          {/* Mobile fallback */}
          <div className="md:hidden space-y-2.5">
            {leadStages.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-24 font-medium">{s.label}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s.pct}%`, background: s.color }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 w-8 text-right">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">My Conversion Funnel</h2>
        <div className="space-y-2">
          {conversionFunnel.map((step) => (
            <div key={step.label} className="flex items-center gap-3">
              <span className="text-xs text-slate-600 w-28 font-medium flex-shrink-0">
                {step.label}
              </span>
              <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg flex items-center px-2.5"
                  style={{ width: `${step.pct}%`, background: step.bg, minWidth: 36 }}
                >
                  <span className="text-xs font-bold" style={{ color: step.color }}>
                    {step.value}
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500 w-8 text-right flex-shrink-0">
                {step.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Monthly Trends</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-200">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                  Month
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">
                  Conversations
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">
                  Tours
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">
                  Deals
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">
                  Conv. Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlyTrends.map((row, i) => (
                <tr
                  key={row.month}
                  className={i % 2 === 1 ? 'bg-[#f8fafc]/60' : 'bg-white'}
                >
                  <td className="px-5 py-3 font-semibold text-slate-700">{row.month}</td>
                  <td className="px-5 py-3 text-center text-slate-600">{row.convs}</td>
                  <td className="px-5 py-3 text-center text-slate-600">{row.tours}</td>
                  <td className="px-5 py-3 text-center text-slate-600">{row.deals}</td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className="font-bold"
                      style={{
                        color:
                          parseInt(row.rate) >= 50
                            ? '#16a34a'
                            : parseInt(row.rate) >= 45
                            ? '#2563eb'
                            : '#b45309',
                      }}
                    >
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
