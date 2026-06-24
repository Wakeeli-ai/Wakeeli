import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Building2, Users, MessageSquare, DollarSign, ChevronRight, Filter, Plus, X, Copy, Check } from 'lucide-react'
import type { Company } from '../data/mockData'

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

const PLAN_REVENUE: Record<string, number> = {
  starter: 149,
  professional: 599,
  enterprise: 1200,
}

interface ApiCompany {
  id: string
  name: string
  agency_name: string
  whatsapp_number: string
  contact_email: string
  plan_tier: string
  agent_count: number
  slug: string
  status: string
  created_at: string
}

function apiToCompany(c: ApiCompany): Company {
  const initials = c.name
    .split(/\s+/)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return {
    id: c.id,
    name: c.name,
    initials,
    plan: (c.plan_tier as Company['plan']) || 'starter',
    status: (c.status as Company['status']) || 'active',
    activeLeads: 0,
    monthlyConversations: 0,
    monthlyRevenue: PLAN_REVENUE[c.plan_tier] ?? 149,
    agentCount: c.agent_count,
    joinedDate: c.created_at ? c.created_at.slice(0, 10) : 'N/A',
    lastActivity: 'just now',
    responseTime: 'N/A',
    conversionRate: 0,
    totalListings: 0,
    city: 'Beirut',
    contactName: '',
    contactEmail: c.contact_email,
    contactPhone: c.whatsapp_number,
    whatsappNumber: c.whatsapp_number,
  }
}

interface FormState {
  companyName: string
  agencyName: string
  whatsapp: string
  email: string
  planTier: 'starter' | 'professional' | 'enterprise'
  agentCount: string
}

interface Credentials {
  company_id: number
  username: string
  password: string
}

interface CopyState {
  username: boolean
  password: boolean
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'churned'>('all')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [copied, setCopied] = useState<CopyState>({ username: false, password: false })
  const [form, setForm] = useState<FormState>({
    companyName: '',
    agencyName: '',
    whatsapp: '',
    email: '',
    planTier: 'starter',
    agentCount: '1',
  })
  const navigate = useNavigate()

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/companies')
      if (res.ok) {
        const data: ApiCompany[] = await res.json()
        setCompanies(data.map(apiToCompany))
      }
    } catch {
      // silently ignore fetch errors (works with mock data fallback)
    }
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const filtered = companies.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalCompanies = companies.length
  const activeCompanies = companies.filter(c => c.status === 'active').length
  const totalLeads = companies.reduce((s, c) => s + c.activeLeads, 0)
  const totalRevenue = companies.reduce((s, c) => s + c.monthlyRevenue, 0)
  const totalConversations = companies.reduce((s, c) => s + c.monthlyConversations, 0)

  function resetForm() {
    setForm({ companyName: '', agencyName: '', whatsapp: '', email: '', planTier: 'starter', agentCount: '1' })
    setFormError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.companyName.trim() || !form.email.trim() || !form.agentCount) return
    setSubmitting(true)
    setFormError('')
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.companyName.trim(),
          agency_name: form.agencyName.trim(),
          whatsapp: form.whatsapp.trim(),
          email: form.email.trim(),
          plan_tier: form.planTier,
          agent_count: parseInt(form.agentCount, 10) || 1,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Request failed' }))
        setFormError(err.detail || 'Something went wrong')
        return
      }
      const data: Credentials = await res.json()
      setCredentials(data)
      setShowForm(false)
      resetForm()
      fetchCompanies()
    } catch {
      setFormError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function copyToClipboard(text: string, field: keyof CopyState) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(prev => ({ ...prev, [field]: true }))
      setTimeout(() => setCopied(prev => ({ ...prev, [field]: false })), 2000)
    })
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Companies</h1>
          <p className="text-sm text-slate-500 mt-0.5">All client companies on the Wakeeli platform</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-all shadow-sm"
        >
          <Plus size={16} />
          Add Company
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard icon={<Building2 size={20} className="text-blue-600" />} label="Total Companies" value={totalCompanies.toString()} sub={`${activeCompanies} active`} bg="bg-blue-50" />
        <KpiCard icon={<Users size={20} className="text-green-600" />} label="Active Leads" value={totalLeads.toLocaleString()} sub="across all companies" bg="bg-green-50" />
        <KpiCard icon={<DollarSign size={20} className="text-purple-600" />} label="Monthly Revenue" value={`$${totalRevenue.toLocaleString()}`} sub="MRR" bg="bg-purple-50" />
        <KpiCard icon={<MessageSquare size={20} className="text-amber-600" />} label="Conversations" value={totalConversations.toLocaleString()} sub="this month" bg="bg-amber-50" />
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
                statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: PLAN_DOT[company.plan] }}>
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
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${PLAN_COLORS[company.plan]}`}>{company.plan}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[company.status]}`}>{company.status}</span>
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
          <p className="text-slate-500 text-sm">
            {companies.length === 0 ? 'No clients yet. Add your first company.' : 'No companies match your filters.'}
          </p>
        </div>
      )}

      {/* Add Company Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Company</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <Field label="Company Name" required>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                  placeholder="e.g. Beirut Commune"
                  className="field-input"
                />
              </Field>

              <Field label="Agency Name" required>
                <input
                  type="text"
                  required
                  value={form.agencyName}
                  onChange={e => setForm(f => ({ ...f, agencyName: e.target.value }))}
                  placeholder="e.g. Beirut Commune Real Estate"
                  className="field-input"
                />
              </Field>

              <Field label="WhatsApp Number">
                <input
                  type="text"
                  value={form.whatsapp}
                  onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                  placeholder="+961..."
                  className="field-input"
                />
              </Field>

              <Field label="Contact Email" required>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@agency.com"
                  className="field-input"
                />
              </Field>

              <Field label="Plan Tier" required>
                <select
                  value={form.planTier}
                  onChange={e => setForm(f => ({ ...f, planTier: e.target.value as FormState['planTier'] }))}
                  className="field-input"
                >
                  <option value="starter">Starter ($149/mo)</option>
                  <option value="professional">Professional ($599/mo)</option>
                  <option value="enterprise">Enterprise ($1,200/mo)</option>
                </select>
              </Field>

              <Field label="Number of Agents" required>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.agentCount}
                  onChange={e => setForm(f => ({ ...f, agentCount: e.target.value }))}
                  placeholder="1"
                  className="field-input"
                />
              </Field>

              {formError && (
                <div className="rounded-lg px-4 py-2.5 text-sm bg-red-50 border border-red-200 text-red-600">
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all disabled:opacity-60"
                >
                  {submitting ? 'Creating...' : 'Create Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Success Modal */}
      {credentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check size={16} className="text-green-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Company Created</h2>
              </div>
              <p className="text-sm text-slate-500">Admin credentials generated. Save these now.</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <CredentialRow
                  label="Company ID"
                  value={String(credentials.company_id)}
                />
                <CredentialRow
                  label="Admin Username"
                  value={credentials.username}
                  onCopy={() => copyToClipboard(credentials.username, 'username')}
                  copied={copied.username}
                />
                <CredentialRow
                  label="Admin Password"
                  value={credentials.password}
                  onCopy={() => copyToClipboard(credentials.password, 'password')}
                  copied={copied.password}
                  sensitive
                />
              </div>

              <div className="rounded-lg px-4 py-3 bg-amber-50 border border-amber-200">
                <p className="text-xs font-medium text-amber-700">
                  Save these credentials now. The password will not be shown again.
                </p>
              </div>

              <button
                onClick={() => setCredentials(null)}
                className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function CredentialRow({
  label,
  value,
  onCopy,
  copied,
  sensitive,
}: {
  label: string
  value: string
  onCopy?: () => void
  copied?: boolean
  sensitive?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`text-sm font-mono font-semibold text-slate-900 truncate ${sensitive ? 'tracking-wider' : ''}`}>{value}</p>
      </div>
      {onCopy && (
        <button
          onClick={onCopy}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-500"
          title="Copy"
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
        </button>
      )}
    </div>
  )
}

function KpiCard({ icon, label, value, sub, bg }: { icon: React.ReactNode; label: string; value: string; sub: string; bg: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg}`}>{icon}</div>
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
