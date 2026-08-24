import { useState } from 'react';
import { Users, Calendar, Clock, TrendingUp, TrendingDown, Download, MapPin } from 'lucide-react';

// Mock Data

const FUNNEL_STAGES = [
  { label: 'Leads In',     count: 1847, pct: 100, color: '#2563eb', bg: '#dbeafe' },
  { label: 'Qualified',    count: 1340, pct:  73, color: '#7c3aed', bg: '#ede9fe' },
  { label: 'Tours Booked', count:  542, pct:  29, color: '#f59e0b', bg: '#fef3c7' },
  { label: 'Deals Closed', count:  201, pct:  11, color: '#16a34a', bg: '#dcfce7' },
];

const AGENT_DATA = [
  { name: 'Joelle Rizk',      initials: 'JR', color: '#2060e8', leads: 312, tours: 98, conversions: 34, revenue: 2_890_000 },
  { name: 'Elie Khoury',      initials: 'EK', color: '#7c3aed', leads: 278, tours: 84, conversions: 28, revenue: 2_240_000 },
  { name: 'Michel Boutros',   initials: 'MB', color: '#0891b2', leads: 241, tours: 72, conversions: 22, revenue: 1_760_000 },
  { name: 'Roula Bou Jawde',  initials: 'RB', color: '#c2410c', leads: 198, tours: 58, conversions: 17, revenue: 1_360_000 },
  { name: 'Karim Haddad',     initials: 'KH', color: '#be185d', leads: 165, tours: 47, conversions: 12, revenue:   960_000 },
];

const DISTRICT_DATA = [
  { name: 'Achrafieh',   nameAr: 'الأشرفية',  leads: 342, tours: 98, deals: 38, avgPrice: 420_000 },
  { name: 'Hamra',       nameAr: 'حمرا',       leads: 287, tours: 81, deals: 29, avgPrice: 310_000 },
  { name: 'Verdun',      nameAr: 'فردان',      leads: 241, tours: 68, deals: 24, avgPrice: 580_000 },
  { name: 'Mar Mikhael', nameAr: 'مار مخايل', leads: 198, tours: 54, deals: 19, avgPrice: 350_000 },
  { name: 'Gemmayzeh',   nameAr: 'الجميزة',   leads: 176, tours: 48, deals: 16, avgPrice: 390_000 },
  { name: 'Jdeideh',     nameAr: 'الجديدة',   leads: 154, tours: 42, deals: 14, avgPrice: 280_000 },
  { name: 'Dbayeh',      nameAr: 'ضبية',       leads: 132, tours: 36, deals: 11, avgPrice: 250_000 },
  { name: 'Kaslik',      nameAr: 'كسليك',     leads: 118, tours: 31, deals:  9, avgPrice: 480_000 },
];

const MAX_DISTRICT_LEADS = Math.max(...DISTRICT_DATA.map((d) => d.leads));
const TOTAL_DISTRICT_LEADS = DISTRICT_DATA.reduce((a, d) => a + d.leads, 0);

const MONTHLY_TRENDS = [
  { month: 'Nov', leads: 287, qualified: 209, tours:  84, deals: 31 },
  { month: 'Dec', leads: 312, qualified: 228, tours:  92, deals: 35 },
  { month: 'Jan', leads: 298, qualified: 217, tours:  88, deals: 32 },
  { month: 'Feb', leads: 334, qualified: 244, tours:  98, deals: 37 },
  { month: 'Mar', leads: 356, qualified: 260, tours: 104, deals: 39 },
  { month: 'Apr', leads: 260, qualified: 182, tours:  76, deals: 27 },
];

const MAX_MONTHLY_LEADS = Math.max(...MONTHLY_TRENDS.map((m) => m.leads));

const PERIOD_OPTIONS = [
  { key: '7D',  label: '7D'  },
  { key: '30D', label: '30D' },
  { key: '90D', label: '90D' },
  { key: 'all', label: 'All' },
];

const KPI_CARDS = [
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
    label: 'Conversion Rate',
    value: '10.9%',
    change: '+1.2%',
    positive: true,
    icon: TrendingUp,
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
    borderColor: '#16a34a',
  },
  {
    label: 'Avg Response',
    value: '4.2m',
    change: '-22.1%',
    positive: true,
    icon: Clock,
    iconBg: '#faf5ff',
    iconColor: '#7c3aed',
    borderColor: '#7c3aed',
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
];

// Helpers

function formatUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// Component

type MobileTab = 'funnel' | 'agents' | 'districts';

export default function KpiTracker() {
  const [period, setPeriod] = useState('30D');
  const [activeTab, setActiveTab] = useState<MobileTab>('funnel');

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">KPI Tracker</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Conversion performance and agent metrics</p>
        </div>

        {/* Desktop controls */}
        <div className="hidden md:flex items-center gap-2">
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
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Download size={14} />
            Export PDF
          </button>
        </div>

        {/* Mobile period pills */}
        <div className="flex md:hidden overflow-x-auto gap-1.5 -mx-4 px-4 pb-1 w-full">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setPeriod(opt.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border min-h-[36px] ${
                period === opt.key
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 shadow-sm border-l-4"
              style={{ borderLeftColor: card.borderColor }}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] md:text-xs font-semibold text-slate-500 truncate">{card.label}</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{card.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {card.positive
                      ? <TrendingUp size={10} className="text-emerald-600 flex-shrink-0" />
                      : <TrendingDown size={10} className="text-red-500 flex-shrink-0" />}
                    <span className={`text-xs font-bold ${card.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {card.change}
                    </span>
                  </div>
                </div>
                <div
                  className="rounded-lg p-1.5 flex-shrink-0 hidden sm:flex items-center justify-center"
                  style={{ background: card.iconBg }}
                >
                  <Icon size={14} style={{ color: card.iconColor }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden flex border-b border-slate-200 bg-white rounded-t-xl overflow-hidden -mb-4">
        {(['funnel', 'agents', 'districts'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Mobile: Funnel tab */}
      {activeTab === 'funnel' && (
        <div className="md:hidden pt-4 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h2 className="font-bold text-slate-900 text-sm mb-4">Conversion Funnel</h2>
            <div className="space-y-3.5">
              {FUNNEL_STAGES.map((stage, i) => (
                <div key={stage.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                        style={{ background: stage.color }}
                      >
                        {i + 1}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{stage.label}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold text-slate-900">{stage.count.toLocaleString()}</span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: stage.bg, color: stage.color }}
                      >
                        {stage.pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${stage.pct}%`, background: stage.color }}
                    />
                  </div>
                  {i < FUNNEL_STAGES.length - 1 && (
                    <p className="text-[10px] text-slate-400 mt-1 text-right">
                      {Math.round((FUNNEL_STAGES[i + 1].count / stage.count) * 100)}% proceed to next stage
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm">Monthly Trends</h2>
            </div>
            {MONTHLY_TRENDS.map((row, i) => (
              <div
                key={row.month}
                className={`flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0 ${i % 2 === 1 ? 'bg-[#f8fafc]/50' : 'bg-white'}`}
              >
                <span className="text-sm font-semibold text-slate-700 w-10">{row.month}</span>
                <span className="text-xs text-slate-400">{row.leads} leads</span>
                <span className="text-xs text-slate-400">{row.tours} tours</span>
                <span
                  className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: '#f0fdf4', color: '#16a34a' }}
                >
                  {row.deals} deals
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile: Agents tab */}
      {activeTab === 'agents' && (
        <div className="md:hidden pt-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm">Agent Performance</h2>
              <p className="text-xs text-slate-400 mt-0.5">Ranked by deals closed</p>
            </div>
            {AGENT_DATA.map((agent, i) => (
              <div
                key={agent.name}
                className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 ${i % 2 === 1 ? 'bg-[#f8fafc]/50' : 'bg-white'}`}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 truncate">{agent.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{agent.leads} leads · {agent.tours} tours</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-emerald-600">{agent.conversions} deals</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatUSD(agent.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile: Districts tab */}
      {activeTab === 'districts' && (
        <div className="md:hidden pt-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm">District Breakdown</h2>
            </div>
            {DISTRICT_DATA.map((d, i) => (
              <div
                key={d.name}
                className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 ${i % 2 === 1 ? 'bg-[#f8fafc]/50' : 'bg-white'}`}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm text-slate-900">{d.name}</p>
                    <span className="text-[10px] text-slate-400">{d.nameAr}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{d.leads} leads · {d.tours} tours</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-slate-900">{d.deals} deals</p>
                  <p className="text-xs text-slate-400 mt-0.5">avg {formatUSD(d.avgPrice)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="hidden md:block space-y-5">

        {/* Funnel + Monthly trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Conversion funnel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-sm">Conversion Funnel</h2>
              <p className="text-xs text-slate-400 mt-0.5">Full pipeline from lead in to closed deal</p>
            </div>
            <div className="p-5 space-y-4">
              {FUNNEL_STAGES.map((stage, i) => (
                <div key={stage.label}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ background: stage.color }}
                      >
                        {i + 1}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{stage.label}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-extrabold text-slate-900">{stage.count.toLocaleString()}</span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: stage.bg, color: stage.color }}
                      >
                        {stage.pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${stage.pct}%`, background: stage.color }}
                    />
                  </div>
                  {i < FUNNEL_STAGES.length - 1 && (
                    <p className="text-[11px] text-slate-400 mt-1 text-right">
                      {Math.round((FUNNEL_STAGES[i + 1].count / stage.count) * 100)}% pass to next stage
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Monthly bar chart + table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Monthly Volume</h2>
                <p className="text-xs text-slate-400 mt-0.5">Leads, tours, and closed deals by month</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#60a5fa' }} />
                  Leads
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#fbbf24' }} />
                  Tours
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#34d399' }} />
                  Deals
                </span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-end gap-4 h-36">
                {MONTHLY_TRENDS.map((m) => {
                  const hLeads = (m.leads / MAX_MONTHLY_LEADS) * 100;
                  const hTours = (m.tours / MAX_MONTHLY_LEADS) * 100;
                  const hDeals = (m.deals / MAX_MONTHLY_LEADS) * 100;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end gap-0.5 h-28">
                        <div
                          className="flex-1 rounded-t-sm transition-all"
                          style={{ height: `${hLeads}%`, background: '#60a5fa', minHeight: 3 }}
                        />
                        <div
                          className="flex-1 rounded-t-sm transition-all"
                          style={{ height: `${hTours}%`, background: '#fbbf24', minHeight: 3 }}
                        />
                        <div
                          className="flex-1 rounded-t-sm transition-all"
                          style={{ height: `${hDeals}%`, background: '#34d399', minHeight: 3 }}
                        />
                      </div>
                      <p className="text-xs font-semibold text-slate-600">{m.month}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-slate-400">
                      <th className="pb-2 font-semibold uppercase tracking-wide">Month</th>
                      <th className="pb-2 font-semibold uppercase tracking-wide text-right">Leads</th>
                      <th className="pb-2 font-semibold uppercase tracking-wide text-right">Qualified</th>
                      <th className="pb-2 font-semibold uppercase tracking-wide text-right">Tours</th>
                      <th className="pb-2 font-semibold uppercase tracking-wide text-right">Deals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MONTHLY_TRENDS.map((row, i) => (
                      <tr
                        key={row.month}
                        className={`border-t border-slate-50 ${i % 2 === 1 ? 'bg-[#f8fafc]/60' : ''}`}
                      >
                        <td className="py-1.5 font-semibold text-slate-700">{row.month}</td>
                        <td className="py-1.5 text-right tabular-nums font-medium text-slate-900">{row.leads}</td>
                        <td className="py-1.5 text-right tabular-nums text-slate-600">{row.qualified}</td>
                        <td className="py-1.5 text-right tabular-nums text-slate-600">{row.tours}</td>
                        <td className="py-1.5 text-right">
                          <span
                            className="px-2 py-0.5 rounded-full font-bold"
                            style={{ background: '#f0fdf4', color: '#16a34a' }}
                          >
                            {row.deals}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Performance table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm">Agent Performance</h2>
            <p className="text-xs text-slate-400 mt-0.5">Ranked by deals closed</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Agent</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Leads</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Tours</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Conversions</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-36">Conv. Rate</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {AGENT_DATA.map((agent, i) => {
                  const convRate = Math.round((agent.conversions / agent.leads) * 100);
                  const convColor = convRate >= 12 ? '#16a34a' : convRate >= 9 ? '#2563eb' : '#f59e0b';
                  return (
                    <tr
                      key={agent.name}
                      className={`${i % 2 === 1 ? 'bg-[#f8fafc]/60' : 'bg-white'} border-b border-slate-100 last:border-0`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ backgroundColor: agent.color }}
                          >
                            {agent.initials}
                          </div>
                          <span className="font-semibold text-slate-900">{agent.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-slate-700">{agent.leads}</td>
                      <td className="px-5 py-3.5 text-right text-slate-600">{agent.tours}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">{agent.conversions}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.min(convRate * 5, 100)}%`, background: convColor }}
                            />
                          </div>
                          <span className="text-xs font-bold w-8 text-right" style={{ color: convColor }}>
                            {convRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                        {formatUSD(agent.revenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* District breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm">District Breakdown</h2>
            <p className="text-xs text-slate-400 mt-0.5">Lead and deal distribution across Beirut neighborhoods</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">District</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Leads</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Tours</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Deals</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg Price</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-36">Lead Share</th>
                </tr>
              </thead>
              <tbody>
                {DISTRICT_DATA.map((d, i) => {
                  const sharePct = Math.round((d.leads / TOTAL_DISTRICT_LEADS) * 100);
                  return (
                    <tr
                      key={d.name}
                      className={`${i % 2 === 1 ? 'bg-[#f8fafc]/60' : 'bg-white'} border-b border-slate-100 last:border-0`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                          <span className="font-semibold text-slate-900">{d.name}</span>
                          <span className="text-xs text-slate-400">{d.nameAr}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-slate-700">{d.leads}</td>
                      <td className="px-5 py-3.5 text-right text-slate-600">{d.tours}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900">{d.deals}</td>
                      <td className="px-5 py-3.5 text-right font-semibold text-slate-700">{formatUSD(d.avgPrice)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(d.leads / MAX_DISTRICT_LEADS) * 100}%`, background: '#2060e8' }}
                            />
                          </div>
                          <span className="text-xs font-bold text-brand-600 w-7 text-right">{sharePct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
