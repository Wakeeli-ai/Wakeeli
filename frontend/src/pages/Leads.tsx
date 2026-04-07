import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { Download, X, Loader2, Phone, MessageCircle, UserPlus, Search, Plus } from 'lucide-react';
import LeadDetailPanel from '../components/LeadDetailPanel';
import { getConversations } from '../api';
import { toast } from '../utils/toast';

type Lead = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  source: 'WhatsApp' | 'Instagram' | 'Website';
  type: 'buy' | 'rent';
  status: 'new' | 'qualifying' | 'qualified' | 'tour_booked' | 'handed_to_agent';
  agent: string | null;
  lastActivity: string;
  activityText: string;
  notes: string;
  budget: string;
};

type NewLeadForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  source: Lead['source'];
  notes: string;
  status: Lead['status'];
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
  };
}

const EMPTY_NEW_LEAD_FORM: NewLeadForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  source: 'WhatsApp',
  notes: '',
  status: 'new',
};

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
  const [mobileStatusTab, setMobileStatusTab] = useState<string>('All');
  const [showNewLeadDrawer, setShowNewLeadDrawer] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState<NewLeadForm>(EMPTY_NEW_LEAD_FORM);
  const [newLeadDrawerVisible, setNewLeadDrawerVisible] = useState(false);

  const openNewLeadDrawer = () => {
    setShowNewLeadDrawer(true);
    requestAnimationFrame(() => setNewLeadDrawerVisible(true));
  };

  const closeNewLeadDrawer = () => {
    setNewLeadDrawerVisible(false);
    setTimeout(() => {
      setShowNewLeadDrawer(false);
      setNewLeadForm(EMPTY_NEW_LEAD_FORM);
    }, 280);
  };

  const handleAddLead = () => {
    const fullName = `${newLeadForm.firstName} ${newLeadForm.lastName}`.trim();
    if (!fullName) {
      toast.error('Please enter a name.');
      return;
    }
    const newLead: Lead = {
      id: Date.now(),
      name: fullName,
      phone: newLeadForm.phone,
      email: newLeadForm.email,
      source: newLeadForm.source,
      type: 'buy',
      status: newLeadForm.status,
      agent: null,
      lastActivity: 'Just now',
      activityText: 'Lead created',
      notes: newLeadForm.notes,
      budget: 'N/A',
    };
    setLeads((prev) => [newLead, ...prev]);
    closeNewLeadDrawer();
    toast.success('Lead added.');
  };

  const handleExport = (filteredLeads: Lead[]) => {
    const headers = ['Name', 'Phone', 'Source', 'Type', 'Status', 'Agent', 'Budget', 'Last Activity'];
    const rows = filteredLeads.map((l) => [
      l.name,
      l.phone,
      l.source,
      l.type,
      STATUS_STYLES[l.status]?.label || l.status,
      l.agent || 'AI Routing',
      l.budget,
      l.lastActivity,
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
    if (effectiveSearch) {
      const searchLower = effectiveSearch.toLowerCase();
      const nameParts = lead.name.toLowerCase().split(' ');
      const nameMatch = nameParts.some((part) => part.startsWith(searchLower));
      if (!nameMatch && !lead.phone.includes(effectiveSearch)) return false;
    }
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

  // colSpan: checkbox + lead + contact + source + type + status + agent(admin) + lastActivity + actions
  const colCount = isAgent ? 8 : 9;

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

      {/* Mobile search bar */}
      <div className="sm:hidden px-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => { setLocalSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or phone..."
            className="w-full pl-8 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white shadow-sm"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => { setLocalSearch(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={13} />
            </button>
          )}
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
          <button
            type="button"
            onClick={openNewLeadDrawer}
            className="inline-flex items-center gap-2 px-3 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm min-h-[44px]"
          >
            <Plus size={15} />
            New Lead
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
                {!isAgent && <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Agent</th>}
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Activity</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colCount} className="px-5 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-600" />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-5 py-12 text-center text-slate-400 text-sm">
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

      {/* New Lead Drawer */}
      {showNewLeadDrawer && createPortal(
        <>
          {/* Overlay - fixed full screen */}
          <div
            onClick={closeNewLeadDrawer}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
            className={`bg-black/30 transition-opacity duration-300 ${newLeadDrawerVisible ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Drawer panel */}
          <div
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 10000, width: '460px', maxWidth: '100vw' }}
            className={`bg-white shadow-xl flex flex-col transition-transform duration-300 ease-out ${newLeadDrawerVisible ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {/* Drawer header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-base font-semibold text-slate-900">New Lead</h2>
                <p className="text-xs text-slate-400 mt-0.5">Add a lead manually</p>
              </div>
              <button
                onClick={closeNewLeadDrawer}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer form */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={newLeadForm.firstName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, firstName: e.target.value })}
                    placeholder="Rami"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={newLeadForm.lastName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, lastName: e.target.value })}
                    placeholder="Khoury"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-300"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  placeholder="+961 70 123 456"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-300"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={newLeadForm.email}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                  placeholder="rami@example.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-300"
                />
              </div>

              {/* Source + Status row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Source</label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value as Lead['source'] })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Website">Website</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
                  <select
                    value={newLeadForm.status}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, status: e.target.value as Lead['status'] })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
                  >
                    <option value="new">New</option>
                    <option value="qualifying">Qualifying</option>
                    <option value="qualified">Qualified</option>
                    <option value="tour_booked">Tour Booked</option>
                    <option value="handed_to_agent">With Agent</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes</label>
                <textarea
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="Requirements, preferences, context..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-300 resize-none"
                />
              </div>
            </div>

            {/* Drawer footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={closeNewLeadDrawer}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddLead}
                className="flex-1 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
              >
                Add Lead
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
