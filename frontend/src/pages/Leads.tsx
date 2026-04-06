import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { Download, X, Loader2, Phone, MessageCircle, UserPlus, Search } from 'lucide-react';
import LeadDetailPanel from '../components/LeadDetailPanel';
import { getConversations } from '../api';
import { toast } from '../utils/toast';

type Lead = {
  id: number;
  name: string;
  phone: string;
  source: 'WhatsApp' | 'Instagram' | 'Website';
  type: 'buy' | 'rent';
  status: 'new' | 'qualifying' | 'qualified' | 'tour_booked' | 'handed_to_agent';
  agent: string | null;
  lastActivity: string;
  activityText: string;
  notes: string;
  budget: string;
  score: number;
};

const MOCK_LEADS: Lead[] = [
  {
    id: 1,
    name: 'Rami Khoury',
    phone: '+961 70 123 456',
    source: 'WhatsApp',
    type: 'buy',
    status: 'qualified',
    agent: 'Rafic Khoury',
    lastActivity: '3 days ago',
    activityText: 'Requirements confirmed',
    notes: 'Looking for a 3BR apartment in Achrafieh. Prefers high floor with city view.',
    budget: '$350,000',
    score: 82,
  },
  {
    id: 2,
    name: 'Nadia Haddad',
    phone: '+961 71 234 567',
    source: 'Instagram',
    type: 'rent',
    status: 'new',
    agent: null,
    lastActivity: '2 hours ago',
    activityText: 'AI follow-up sent',
    notes: 'Interested in a furnished apartment in Hamra. Needs parking.',
    budget: '$1,200/mo',
    score: 45,
  },
  {
    id: 3,
    name: 'Tony Gemayel',
    phone: '+961 76 345 678',
    source: 'WhatsApp',
    type: 'buy',
    status: 'tour_booked',
    agent: 'Rami Haddad',
    lastActivity: 'Yesterday',
    activityText: 'Tour scheduled',
    notes: 'Wants a spacious 4BR in Achrafieh. Flexible on floor, prefers garden access.',
    budget: '$500,000',
    score: 91,
  },
  {
    id: 4,
    name: 'Maya Nasrallah',
    phone: '+961 78 456 789',
    source: 'Website',
    type: 'rent',
    status: 'qualifying',
    agent: 'Mary Rizk',
    lastActivity: '5 days ago',
    activityText: 'Viewed listing',
    notes: 'Looking for a 2BR in Verdun, close to schools. Prefers modern building.',
    budget: '$1,500/mo',
    score: 61,
  },
  {
    id: 5,
    name: 'Sami Aoun',
    phone: '+961 03 567 890',
    source: 'WhatsApp',
    type: 'buy',
    status: 'handed_to_agent',
    agent: 'Clara Nassar',
    lastActivity: '1 week ago',
    activityText: 'Handed to agent',
    notes: 'Interested in a 2BR apartment in Jounieh. Sea view preferred.',
    budget: '$250,000',
    score: 78,
  },
  {
    id: 6,
    name: 'Lara Saliba',
    phone: '+961 70 678 901',
    source: 'WhatsApp',
    type: 'rent',
    status: 'qualified',
    agent: 'Rafic Khoury',
    lastActivity: '2 days ago',
    activityText: 'Requirements confirmed',
    notes: 'Furnished studio or 1BR in Dbayeh. Near highway access. Moving in 3 weeks.',
    budget: '$900/mo',
    score: 76,
  },
  {
    id: 7,
    name: 'Karim Mouawad',
    phone: '+961 71 789 012',
    source: 'Instagram',
    type: 'buy',
    status: 'new',
    agent: null,
    lastActivity: '4 hours ago',
    activityText: 'AI follow-up sent',
    notes: 'Looking for a chalet or villa in Broummana area. Mountain views essential.',
    budget: '$600,000',
    score: 38,
  },
  {
    id: 8,
    name: 'Rita Fares',
    phone: '+961 76 890 123',
    source: 'WhatsApp',
    type: 'rent',
    status: 'qualifying',
    agent: 'Mary Rizk',
    lastActivity: '3 days ago',
    activityText: 'Viewed listing',
    notes: 'Wants 2BR in Beit Mery. Quiet neighborhood, away from main road.',
    budget: '$1,100/mo',
    score: 54,
  },
  {
    id: 9,
    name: 'Hassan Khalil',
    phone: '+961 78 901 234',
    source: 'WhatsApp',
    type: 'buy',
    status: 'qualified',
    agent: 'Rami Haddad',
    lastActivity: '6 days ago',
    activityText: 'Requirements confirmed',
    notes: 'Investment apartment in Hamra, 1BR or studio. Wants rental yield potential.',
    budget: '$200,000',
    score: 70,
  },
  {
    id: 10,
    name: 'Joelle Abi Saab',
    phone: '+961 03 012 345',
    source: 'Instagram',
    type: 'rent',
    status: 'tour_booked',
    agent: 'Clara Nassar',
    lastActivity: 'Yesterday',
    activityText: 'Tour scheduled',
    notes: 'High-end 3BR in Achrafieh or Saifi. Must have concierge and gym.',
    budget: '$2,000/mo',
    score: 88,
  },
  {
    id: 11,
    name: 'Omar Darwish',
    phone: '+961 70 123 567',
    source: 'Website',
    type: 'buy',
    status: 'handed_to_agent',
    agent: 'Rafic Khoury',
    lastActivity: '10 days ago',
    activityText: 'Handed to agent',
    notes: 'Commercial retail space in Verdun or Hamra. Ground floor preferred.',
    budget: '$450,000',
    score: 65,
  },
  {
    id: 12,
    name: 'Celine Rizk',
    phone: '+961 71 234 678',
    source: 'WhatsApp',
    type: 'rent',
    status: 'new',
    agent: null,
    lastActivity: '1 hour ago',
    activityText: 'AI follow-up sent',
    notes: 'Studio or 1BR in Jounieh. Furnished. Close to the waterfront.',
    budget: '$800/mo',
    score: 42,
  },
  {
    id: 13,
    name: 'Elie Bitar',
    phone: '+961 76 345 789',
    source: 'WhatsApp',
    type: 'buy',
    status: 'qualifying',
    agent: 'Rami Haddad',
    lastActivity: '4 days ago',
    activityText: 'Viewed listing',
    notes: 'Looking for a beachfront or sea-view apartment in Batroun. 2-3BR.',
    budget: '$300,000',
    score: 58,
  },
  {
    id: 14,
    name: 'Dina Hamdan',
    phone: '+961 78 456 890',
    source: 'Instagram',
    type: 'rent',
    status: 'qualified',
    agent: 'Mary Rizk',
    lastActivity: '2 days ago',
    activityText: 'Requirements confirmed',
    notes: 'Luxury 3BR in Dbayeh or Antelias. Building must have generator and water tank.',
    budget: '$1,800/mo',
    score: 74,
  },
  {
    id: 15,
    name: 'Georges Skaff',
    phone: '+961 03 567 901',
    source: 'Website',
    type: 'buy',
    status: 'handed_to_agent',
    agent: 'Clara Nassar',
    lastActivity: '8 days ago',
    activityText: 'Handed to agent',
    notes: 'Mountain villa or large chalet in Broummana or Beit Mery. Pool preferred.',
    budget: '$750,000',
    score: 80,
  },
];

const MOCK_AGENTS = ['Rafic Khoury', 'Rami Haddad', 'Mary Rizk', 'Clara Nassar'];

const SOURCE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  WhatsApp: { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a' },
  Instagram: { bg: '#faf5ff', text: '#7c3aed', dot: '#7c3aed' },
  Website: { bg: '#eff6ff', text: '#2563eb', dot: '#2563eb' },
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  new: { bg: '#eff6ff', text: '#2563eb', dot: '#2563eb', label: 'New' },
  qualifying: { bg: '#fffbeb', text: '#b45309', dot: '#f59e0b', label: 'Qualifying' },
  qualified: { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a', label: 'Qualified' },
  tour_booked: { bg: '#faf5ff', text: '#7c3aed', dot: '#7c3aed', label: 'Tour Booked' },
  handed_to_agent: { bg: '#f8fafc', text: '#475569', dot: '#94a3b8', label: 'With Agent' },
};

const TYPE_STYLES: Record<string, { bg: string; text: string }> = {
  buy: { bg: '#eff6ff', text: '#2563eb' },
  rent: { bg: '#fffbeb', text: '#b45309' },
};

const PAGE_SIZE = 10;

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#2060e8' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color }}>{score}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8', label: status };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.text }}
    >
      <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

function mapConversationToLead(conv: any, idx: number): Lead {
  const req = conv.user_requirements || {};
  const name = req.name || conv.user_name || conv.user_phone || `Lead ${idx + 1}`;
  const statusMap: Record<string, Lead['status']> = {
    new: 'new',
    qualified: 'qualified',
    handed_off: 'handed_to_agent',
    closed: 'handed_to_agent',
    urgent: 'qualifying',
  };
  const budgetVal = req.budget_max || req.budget_min;
  const budgetStr = budgetVal
    ? req.listing_type === 'rent'
      ? `$${budgetVal.toLocaleString()}/mo`
      : `$${budgetVal.toLocaleString()}`
    : 'N/A';

  const updatedAt = conv.updated_at || conv.created_at || '';
  let lastActivity = '';
  if (updatedAt) {
    const diff = Math.floor((Date.now() - new Date(updatedAt).getTime()) / 1000);
    if (diff < 3600) lastActivity = `${Math.floor(diff / 60)} min ago`;
    else if (diff < 86400) lastActivity = `${Math.floor(diff / 3600)}h ago`;
    else lastActivity = `${Math.floor(diff / 86400)}d ago`;
  }

  return {
    id: conv.id,
    name,
    phone: conv.user_phone || '',
    source: 'WhatsApp',
    type: req.listing_type === 'buy' ? 'buy' : 'rent',
    status: statusMap[conv.status] || 'new',
    agent: conv.agent?.name || null,
    lastActivity: lastActivity || 'Unknown',
    activityText: conv.status === 'handed_off' ? 'Handed to agent' : 'AI active',
    notes: req.location ? `Looking in ${req.location}` : '',
    budget: budgetStr,
    score: 50 + (conv.id % 40),
  };
}

export default function Leads() {
  const { role } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ source: '', type: '', status: '', agent: '' });
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [localSearch, setLocalSearch] = useState('');
  // Mobile status tab filter
  const [mobileStatusTab, setMobileStatusTab] = useState<string>('All');

  const handleExport = (filteredLeads: Lead[]) => {
    const headers = ['Name', 'Phone', 'Source', 'Type', 'Status', 'Agent', 'Budget', 'Last Activity', 'Score'];
    const rows = filteredLeads.map((l) => [
      l.name,
      l.phone,
      l.source,
      l.type,
      STATUS_STYLES[l.status]?.label || l.status,
      l.agent || 'AI Routing',
      l.budget,
      l.lastActivity,
      String(l.score),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wakeeli-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredLeads.length} leads to CSV`);
  };

  useEffect(() => {
    getConversations()
      .then((res) => {
        const data: any[] = Array.isArray(res.data) ? res.data : [];
        if (data.length > 0) {
          setLeads(data.map(mapConversationToLead));
        }
      })
      .catch(() => {
        toast.error('Failed to load leads.');
      })
      .finally(() => setLoading(false));
  }, []);

  const isAgent = role === 'agent';
  const title = isAgent ? 'My Leads' : 'Leads';

  const effectiveSearch = searchQuery || localSearch;

  const MOBILE_STATUS_TABS = ['All', 'New', 'Qualifying', 'Qualified', 'Tour Booked', 'Handed Off'] as const;
  const MOBILE_STATUS_MAP: Record<string, string> = {
    'New': 'new',
    'Qualifying': 'qualifying',
    'Qualified': 'qualified',
    'Tour Booked': 'tour_booked',
    'Handed Off': 'handed_to_agent',
  };

  const filtered = leads.filter((lead) => {
    if (
      effectiveSearch &&
      !lead.name.toLowerCase().includes(effectiveSearch.toLowerCase()) &&
      !lead.phone.includes(effectiveSearch)
    )
      return false;
    if (filters.source && lead.source !== filters.source) return false;
    if (filters.type && lead.type !== filters.type) return false;
    if (filters.status && lead.status !== filters.status) return false;
    if (filters.agent && lead.agent !== filters.agent) return false;
    return true;
  });

  const mobileFiltered = mobileStatusTab === 'All'
    ? filtered
    : filtered.filter((l) => l.status === MOBILE_STATUS_MAP[mobileStatusTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, filtered.length);
  const paginated = filtered.slice(pageStart, pageEnd);

  const hasFilters = filters.source !== '' || filters.type !== '' || filters.status !== '' || filters.agent !== '';

  return (
    <div className="space-y-4">
      {/* Mobile filter tabs */}
      <div className="sm:hidden overflow-x-auto px-4 pt-2">
        <div className="flex gap-1 pb-2 w-max border-b border-slate-100">
          {MOBILE_STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMobileStatusTab(tab)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all min-h-[36px] ${
                mobileStatusTab === tab
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-4 sm:px-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            {effectiveSearch
              ? `Search results for "${effectiveSearch}"`
              : `${filtered.length} leads total`}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchParams({})}
              className="mt-1 inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700"
            >
              <X size={12} />
              Clear search
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleExport(filtered)}
            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm min-h-[44px]"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter and search bar - desktop only */}
      <div className="hidden sm:flex bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex-wrap items-center gap-3">
        {/* Local search */}
        <div className="relative flex-shrink-0 w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => { setLocalSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or phone..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
          />
        </div>

        <div className="w-px h-5 bg-slate-200 hidden sm:block" />

        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Filter:</span>

        <select
          value={filters.source}
          onChange={(e) => { setFilters({ ...filters, source: e.target.value }); setPage(1); }}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
        >
          <option value="">All Sources</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Instagram">Instagram</option>
          <option value="Website">Website</option>
        </select>

        <select
          value={filters.type}
          onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
        >
          <option value="">All Types</option>
          <option value="buy">Buy</option>
          <option value="rent">Rent</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="qualifying">Qualifying</option>
          <option value="qualified">Qualified</option>
          <option value="tour_booked">Tour Booked</option>
          <option value="handed_to_agent">With Agent</option>
        </select>

        {!isAgent && (
          <select
            value={filters.agent}
            onChange={(e) => { setFilters({ ...filters, agent: e.target.value }); setPage(1); }}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
          >
            <option value="">All Agents</option>
            {MOCK_AGENTS.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        )}

        {(hasFilters || localSearch) && (
          <button
            type="button"
            onClick={() => { setFilters({ source: '', type: '', status: '', agent: '' }); setLocalSearch(''); setPage(1); }}
            className="ml-auto text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
          >
            <X size={12} />
            Clear all
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Mobile compact list */}
        <div className="sm:hidden divide-y divide-slate-100">
          {mobileFiltered.length === 0 ? (
            <p className="px-5 py-10 text-center text-slate-400 text-sm">No leads found.</p>
          ) : (
            mobileFiltered.map((lead) => {
              const avatarInitials = lead.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
              const src = SOURCE_STYLES[lead.source] || { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' };
              return (
                <div
                  key={lead.id}
                  className="flex items-center gap-3 px-4 py-3 bg-white min-h-[64px] cursor-pointer active:bg-slate-50 transition-colors"
                  onClick={() => setSelectedLeadId(lead.id)}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {avatarInitials}
                  </div>
                  {/* Center info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{lead.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <StatusBadge status={lead.status} />
                      <span className="text-xs text-slate-500">{lead.budget}</span>
                    </div>
                  </div>
                  {/* Right: source + time */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: src.bg, color: src.text }}
                    >
                      {lead.source}
                    </span>
                    <span className="text-[10px] text-slate-400">{lead.lastActivity}</span>
                  </div>
                </div>
              );
            })
          )}
          {/* Mobile pagination */}
          <div className="px-4 py-3 flex items-center justify-between text-sm text-slate-500 border-t border-slate-100">
            <span className="text-xs">{mobileFiltered.length === 0 ? 'No leads' : `${mobileFiltered.length} leads`}</span>
            <div className="flex gap-2">
              <button type="button" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white hover:bg-slate-50 disabled:opacity-40 min-h-[36px]">Prev</button>
              <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white hover:bg-slate-50 disabled:opacity-40 min-h-[36px]">Next</button>
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-slate-200">
                <th className="px-5 py-3 w-10">
                  <input type="checkbox" className="rounded border-slate-300 cursor-pointer" />
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Lead</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Source</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Score</th>
                {!isAgent && <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Agent</th>}
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Activity</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAgent ? 9 : 10} className="px-5 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-600" />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={isAgent ? 9 : 10} className="px-5 py-12 text-center text-slate-400 text-sm">
                    No leads found.
                  </td>
                </tr>
              ) : (
                paginated.map((lead, i) => {
                  const avatarInitials = lead.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
                  const src = SOURCE_STYLES[lead.source] || { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' };
                  const rowBg = i % 2 === 1 ? 'bg-[#f8fafc]/60' : 'bg-white';

                  return (
                    <tr
                      key={lead.id}
                      className={`${rowBg} hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0 group`}
                      onClick={() => setSelectedLeadId(lead.id)}
                    >
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-slate-300 cursor-pointer" />
                      </td>

                      {/* Lead Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: '#dbeafe', color: '#2563eb' }}
                          >
                            {avatarInitials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{lead.name}</p>
                            <p className="text-xs text-slate-400">{lead.budget}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5 text-sm text-slate-600">{lead.phone}</td>

                      {/* Source */}
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: src.bg, color: src.text }}
                        >
                          <span className="w-[5px] h-[5px] rounded-full" style={{ background: src.dot }} />
                          {lead.source}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                          style={TYPE_STYLES[lead.type] || { background: '#f1f5f9', color: '#64748b' }}
                        >
                          {lead.type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={lead.status} />
                      </td>

                      {/* Score */}
                      <td className="px-5 py-3.5">
                        <ScoreBar score={lead.score} />
                      </td>

                      {/* Agent */}
                      {!isAgent && (
                        <td className="px-5 py-3.5">
                          {lead.agent ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-600 flex-shrink-0">
                                {lead.agent.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()}
                              </div>
                              <span className="text-sm text-slate-700">{lead.agent}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-xs">AI Routing</span>
                          )}
                        </td>
                      )}

                      {/* Last Activity */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-slate-700">{lead.lastActivity}</p>
                        <p className="text-xs text-slate-400">{lead.activityText}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Call"
                          >
                            <Phone size={13} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            title="Message"
                          >
                            <MessageCircle size={13} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="Assign"
                          >
                            <UserPlus size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop pagination footer */}
        <div className="hidden sm:flex px-5 py-3.5 border-t border-slate-100 items-center justify-between text-sm text-slate-500 bg-[#f8fafc]/50">
          <span className="text-xs text-slate-500">
            {filtered.length === 0
              ? 'No leads'
              : `Showing ${pageStart + 1} to ${pageEnd} of ${filtered.length} leads`}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
              if (p < 1 || p > totalPages) return null;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors shadow-sm ${
                    p === currentPage
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Lead Detail Panel */}
      {selectedLeadId !== null && (
        <LeadDetailPanel
          conversationId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onUpdate={() => {}}
        />
      )}
    </div>
  );
}
