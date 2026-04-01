import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Building2, Users, MessageSquare, DollarSign, ChevronRight, Filter } from 'lucide-react'
import { COMPANIES } from '../data/mockData'

const PLAN_COLORS: Record<string, string> = {
  enterprise: 'bg-purple-100 text-purple-700',
  professional: 'bg-blue-100 text-blue-700',
  starter: 'bg-slate-100 text-slate-600',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  trial: 'bg-amber-100 text-amber-700',
  churned: 'bg-red-100 text-red-600',
}

const PLAN_DOT: Record<string, string> = {
  enterprise: '#7c3aed',
  professional: '#2563eb',
  starter: '#64748b',
}

export default function Companies() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'churned'>('all')
  const navigate = useNavigate()

  const filtered = COMPANIES.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalCompanies = COMPANIES.length
  const activeCompanies = COMPANIES.filter(c => c.status === 'active').length
  const totalLeads = COMPANIES.reduce((s, c) => s + c.activeLeads, 0)
  const totalRevenue = COMPANIES.reduce((s, c) => s + c.monthlyRevenue, 0)
  const totalConversations = COMPANIES.reduce((s, c) => s + c.monthlyConversations, 0)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Companies</h1>
        <p className="text-sm text-slate-500 mt-0.5">All client companies on the Wakeeli platform</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={<Building2 size={20} className="text-blue-600" />}
          label="Total Companies"
          value={totalCompanies.toString()}
          sub={`${activeCompanies} active`}
          bg="bg-blue-50"
        />
        <KpiCard
          icon={<Users size={20} className="text-green-600" />}
          label="Active Leads"
          value={totalLeads.toLocaleString()}
          sub="across all companies"
          bg="bg-green-50"
        />
        <KpiCard
          icon={<DollarSign size={20} className="text-purple-600" />}
          label="Monthly Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          sub="MRR"
          bg="bg-purple-50"
        />
        <KpiCard
          icon={<MessageSquare size={20} className="text-amber-600" />}
          label="Conversations"
          value={totalConversations.toLocaleString()}
          sub="this month"
          bg="bg-amber-50"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          {(['all', 'active', 'trial', 'churned'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map(company => (
          <button
            key={company.id}
            onClick={() => navigate(`/companies/${company.id}`)}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-brand-400 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: PLAN_DOT[company.plan] }}
                >
                  {company.initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm leading-tight">{company.name}</p>
                  <p className="text-xs text-slate-500">{company.city}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-500 transition-colors mt-1 flex-shrink-0" />
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${PLAN_COLORS[company.plan]}`}>
                {company.plan}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[company.status]}`}>
                {company.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Stat label="Leads" value={company.activeLeads.toString()} />
              <Stat label="Convos" value={company.monthlyConversations.toLocaleString()} />
              <Stat label="Conversion" value={`${company.conversionRate}%`} />
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Active {company.lastActivity}</span>
              {company.monthlyRevenue > 0 && (
                <span className="text-xs font-semibold text-green-600">${company.monthlyRevenue}/mo</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm">No companies match your filters.</p>
        </div>
      )}
    </div>
  )
}

function KpiCard({ icon, label, value, sub, bg }: { icon: React.ReactNode; label: string; value: string; sub: string; bg: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs font-medium text-slate-700 mt-0.5">{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}
