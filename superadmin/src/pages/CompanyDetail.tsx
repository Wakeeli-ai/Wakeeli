import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Users, MessageSquare, Home, CreditCard, TrendingUp, Star } from 'lucide-react'
import { COMPANIES, LEADS, CONVERSATIONS, LISTINGS, AGENTS, BILLING } from '../data/mockData'

const TABS = ['Overview', 'Leads', 'Conversations', 'Listings', 'Agents', 'Billing'] as const
type Tab = typeof TABS[number]

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

const LEAD_STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  qualified: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-600',
}

export default function CompanyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('Overview')

  const company = COMPANIES.find(c => c.id === id)
  if (!company) {
    return (
      <div className="p-6">
        <button onClick={() => navigate('/companies')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6">
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-slate-500">Company not found.</p>
      </div>
    )
  }

  const leads = LEADS.filter(l => l.companyId === id)
  const conversations = CONVERSATIONS.filter(c => c.companyId === id)
  const listings = LISTINGS.filter(l => l.companyId === id)
  const agents = AGENTS.filter(a => a.companyId === id)
  const billing = BILLING.filter(b => b.companyId === id)

  const TAB_ICONS: Record<Tab, React.ReactNode> = {
    Overview: <TrendingUp size={14} />,
    Leads: <Users size={14} />,
    Conversations: <MessageSquare size={14} />,
    Listings: <Home size={14} />,
    Agents: <Users size={14} />,
    Billing: <CreditCard size={14} />,
  }

  return (
    <div className="p-6">
      {/* Back */}
      <button
        onClick={() => navigate('/companies')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-5 transition-colors"
      >
        <ArrowLeft size={15} />
        All Companies
      </button>

      {/* Company Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-base"
              style={{ background: company.plan === 'enterprise' ? '#7c3aed' : company.plan === 'professional' ? '#2563eb' : '#64748b' }}
            >
              {company.initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{company.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <MapPin size={12} className="text-slate-400" />
                <span className="text-sm text-slate-500">{company.city}, Lebanon</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${PLAN_COLORS[company.plan]}`}>
              {company.plan}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[company.status]}`}>
              {company.status}
            </span>
          </div>
        </div>

        {/* Contact row */}
        <div className="flex items-center gap-6 mt-5 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users size={14} className="text-slate-400" />
            {company.contactName}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail size={14} className="text-slate-400" />
            {company.contactEmail}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone size={14} className="text-slate-400" />
            {company.contactPhone}
          </div>
          <div className="ml-auto text-sm text-slate-400">
            Joined: {new Date(company.joinedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1.5 mb-5 w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {TAB_ICONS[tab]}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Overview' && <OverviewTab company={company} leads={leads} conversations={conversations} />}
      {activeTab === 'Leads' && <LeadsTab leads={leads} />}
      {activeTab === 'Conversations' && <ConversationsTab conversations={conversations} />}
      {activeTab === 'Listings' && <ListingsTab listings={listings} />}
      {activeTab === 'Agents' && <AgentsTab agents={agents} />}
      {activeTab === 'Billing' && <BillingTab company={company} billing={billing} />}
    </div>
  )
}

function OverviewTab({ company, leads, conversations }: any) {
  const metrics = [
    { label: 'Active Leads', value: company.activeLeads.toString(), color: 'text-blue-600' },
    { label: 'Monthly Convos', value: company.monthlyConversations.toLocaleString(), color: 'text-green-600' },
    { label: 'Conversion Rate', value: `${company.conversionRate}%`, color: 'text-purple-600' },
    { label: 'Avg Response', value: company.responseTime, color: 'text-amber-600' },
    { label: 'Agents', value: company.agentCount.toString(), color: 'text-slate-600' },
    { label: 'Listings', value: company.totalListings.toString(), color: 'text-rose-600' },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-6 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="bg-white rounded-xl p-4 border border-slate-200">
            <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Recent Leads */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Recent Leads</h3>
          {leads.length > 0 ? (
            <div className="space-y-3">
              {leads.slice(0, 4).map((lead: any) => (
                <div key={lead.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{lead.name}</p>
                    <p className="text-xs text-slate-400">{lead.propertyInterest}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${LEAD_STATUS_COLORS[lead.status]}`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No leads recorded.</p>
          )}
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Recent Conversations</h3>
          {conversations.length > 0 ? (
            <div className="space-y-3">
              {conversations.slice(0, 4).map((conv: any) => (
                <div key={conv.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-brand-700">{conv.leadName[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{conv.leadName}</p>
                    <p className="text-xs text-slate-400 truncate">{conv.lastMessage}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{conv.messageCount} msgs</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No conversations yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function LeadsTab({ leads }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900 text-sm">{leads.length} Leads</h3>
      </div>
      {leads.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {['Name', 'Phone', 'Source', 'Interest', 'Budget', 'Agent', 'Status', 'Date'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead: any) => (
              <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-slate-900">{lead.name}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{lead.phone}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{lead.source}</td>
                <td className="px-5 py-3 text-xs text-slate-600 max-w-xs truncate">{lead.propertyInterest}</td>
                <td className="px-5 py-3 text-sm font-medium text-slate-700">{lead.budget}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{lead.assignedAgent}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${LEAD_STATUS_COLORS[lead.status]}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-slate-400">{lead.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-slate-400">No leads for this company.</p>
        </div>
      )}
    </div>
  )
}

function ConversationsTab({ conversations }: any) {
  const statusStyle: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    closed: 'bg-slate-100 text-slate-600',
    bot: 'bg-blue-100 text-blue-700',
    agent: 'bg-purple-100 text-purple-700',
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900 text-sm">{conversations.length} Conversations</h3>
      </div>
      {conversations.length > 0 ? (
        <div className="divide-y divide-slate-50">
          {conversations.map((conv: any) => (
            <div key={conv.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-brand-700">{conv.leadName[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-900">{conv.leadName}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusStyle[conv.status]}`}>
                      {conv.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 truncate">{conv.lastMessage}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400">{conv.phone}</span>
                    <span className="text-xs text-slate-400">{conv.messageCount} messages</span>
                    <span className="text-xs text-slate-400">{conv.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-slate-400">No conversations for this company.</p>
        </div>
      )}
    </div>
  )
}

function ListingsTab({ listings }: any) {
  const statusStyle: Record<string, string> = {
    available: 'bg-green-100 text-green-700',
    sold: 'bg-slate-100 text-slate-600',
    rented: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900 text-sm">{listings.length} Listings</h3>
      </div>
      {listings.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {['Title', 'Type', 'Location', 'Price', 'Area', 'Beds', 'Status'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listings.map((l: any) => (
              <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-slate-900">{l.title}</td>
                <td className="px-5 py-3 text-sm capitalize text-slate-500">{l.type}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{l.location}</td>
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">{l.price}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{l.area}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{l.bedrooms > 0 ? l.bedrooms : 'N/A'}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusStyle[l.status]}`}>
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-slate-400">No listings for this company.</p>
        </div>
      )}
    </div>
  )
}

function AgentsTab({ agents }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900 text-sm">{agents.length} Agents</h3>
      </div>
      {agents.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {['Agent', 'Role', 'Leads', 'Conversions', 'Resp. Time', 'Satisfaction'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map((a: any) => (
              <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-brand-700">{a.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{a.name}</p>
                      <p className="text-xs text-slate-400">{a.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-slate-500">{a.role}</td>
                <td className="px-5 py-3 text-sm font-medium text-slate-900">{a.leads}</td>
                <td className="px-5 py-3 text-sm text-slate-900">{a.conversions}</td>
                <td className="px-5 py-3 text-sm text-slate-500">{a.responseTime}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-medium text-slate-900">{a.satisfaction}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-slate-400">No agents found for this company.</p>
        </div>
      )}
    </div>
  )
}

function BillingTab({ company, billing }: any) {
  const planPrices: Record<string, number> = { starter: 149, professional: 599, enterprise: 1200 }

  return (
    <div className="space-y-5">
      {/* Current Plan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 text-sm mb-4">Current Subscription</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-slate-900 capitalize">{company.plan} Plan</p>
            <p className="text-sm text-slate-500 mt-0.5">${planPrices[company.plan]}/month per company</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">${company.monthlyRevenue > 0 ? company.monthlyRevenue : 0}</p>
            <p className="text-xs text-slate-400">Monthly Revenue</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'WhatsApp Agents', value: company.plan === 'starter' ? '2' : company.plan === 'professional' ? '5' : 'Unlimited' },
            { label: 'Monthly Leads', value: company.plan === 'starter' ? '100' : company.plan === 'professional' ? '500' : 'Unlimited' },
            { label: 'AI Conversations', value: company.plan === 'starter' ? '500/mo' : company.plan === 'professional' ? '2,000/mo' : 'Unlimited' },
          ].map(f => (
            <div key={f.label} className="bg-slate-50 rounded-xl p-3">
              <p className="text-sm font-semibold text-slate-900">{f.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{f.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900 text-sm">Payment History</h3>
        </div>
        {billing.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Date', 'Description', 'Amount', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {billing.map((b: any) => (
                <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-slate-600">{b.date}</td>
                  <td className="px-5 py-3 text-sm text-slate-800">{b.description}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-slate-900">${b.amount}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                      b.status === 'paid' ? 'bg-green-100 text-green-700' :
                      b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-slate-400">No billing history available.</p>
          </div>
        )}
      </div>
    </div>
  )
}
