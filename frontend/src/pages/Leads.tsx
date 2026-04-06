import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { Download, LayoutGrid, X, Loader2 } from 'lucide-react';
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

const SOURCE_BADGE: Record<string, string> = {
  WhatsApp: 'bg-emerald-100 text-emerald-800',
  Instagram: 'bg-purple-100 text-purple-800',
  Website: 'bg-blue-100 text-blue-800',
};

const TYPE_BADGE: Record<string, string> = {
  buy: 'bg-brand-100 text-brand-700',
  rent: 'bg-amber-100 text-amber-800',
};

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  qualifying: 'bg-amber-100 text-amber-800',
  qualified: 'bg-emerald-100 text-emerald-800',
  tour_booked: 'bg-purple-100 text-purple-800',
  handed_to_agent: 'bg-slate-100 text-slate-600',
};

const STATUS_LABEL: Record<string, string> = {
  new: 'New',
  qualifying: 'Qualifying',
  qualified: 'Qualified',
  tour_booked: 'Tour Booked',
  handed_to_agent: 'Handed to Agent',
};

const PAGE_SIZE = 10;

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

export default function Leads() {
  const { role } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ source: '', type: '', status: '', agent: '' });
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

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
  const subtitle = searchQuery
    ? `Search results for "${searchQuery}"`
    : 'Manage and track all your property leads';

  const filtered = leads.filter((lead) => {
    if (
      searchQuery &&
      !lead.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !lead.phone.includes(searchQuery)
    )
      return false;
    if (filters.source && lead.source !== filters.source) return false;
    if (filters.type && lead.type !== filters.type) return false;
    if (filters.status && lead.status !== filters.status) return false;
    if (filters.agent && lead.agent !== filters.agent) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, filtered.length);
  const paginated = filtered.slice(pageStart, pageEnd);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>
          {searchQuery && (
            <button
              onClick={() => setSearchParams({})}
              className="mt-2 inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700"
            >
              <X size={14} />
              Clear search
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
          >
            <Download size={16} />
            Export
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
          >
            <LayoutGrid size={16} />
            Table View
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-bold text-slate-700">Filters:</span>

        <select
          value={filters.source}
          onChange={(e) => { setFilters({ ...filters, source: e.target.value }); setPage(1); }}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Sources</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Instagram">Instagram</option>
          <option value="Website">Website</option>
        </select>

        <select
          value={filters.type}
          onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Types</option>
          <option value="buy">Buy</option>
          <option value="rent">Rent</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="qualifying">Qualifying</option>
          <option value="qualified">Qualified</option>
          <option value="tour_booked">Tour Booked</option>
          <option value="handed_to_agent">Handed to Agent</option>
        </select>

        {!isAgent && (
          <select
            value={filters.agent}
            onChange={(e) => { setFilters({ ...filters, agent: e.target.value }); setPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Agents</option>
            {MOCK_AGENTS.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={() => { setFilters({ source: '', type: '', status: '', agent: '' }); setPage(1); }}
          className="ml-auto text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-medium uppercase tracking-wide">
                <th className="px-6 py-4 w-10">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="px-6 py-4">Lead Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                {!isAgent && <th className="px-6 py-4">Assigned Agent</th>}
                <th className="px-6 py-4">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={isAgent ? 7 : 8} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-600" />
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAgent ? 7 : 8}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No leads found.
                  </td>
                </tr>
              ) : (
                paginated.map((lead) => {
                  const initials = lead.name
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase();
                  const statusLabel = STATUS_LABEL[lead.status] || lead.status;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedLeadId(lead.id)}
                    >
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-slate-300" />
                      </td>

                      {/* Lead Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{lead.name}</p>
                            <p className="text-xs text-slate-400">{lead.budget}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4 text-slate-700">{lead.phone}</td>

                      {/* Source */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${SOURCE_BADGE[lead.source]}`}>
                          {lead.source}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_BADGE[lead.type] || 'bg-slate-100 text-slate-600'}`}>
                          {lead.type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[lead.status] || 'bg-slate-100 text-slate-600'}`}>
                          {statusLabel}
                        </span>
                      </td>

                      {/* Assigned Agent */}
                      {!isAgent && (
                        <td className="px-6 py-4">
                          {lead.agent ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                                {lead.agent
                                  .split(' ')
                                  .slice(0, 2)
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </div>
                              <span className="text-slate-700">{lead.agent}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-xs">AI Routing</span>
                          )}
                        </td>
                      )}

                      {/* Last Activity */}
                      <td className="px-6 py-4">
                        <p className="text-slate-600 text-sm">{lead.lastActivity}</p>
                        <p className="text-xs text-slate-400">{lead.activityText}</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <span>
            {filtered.length === 0
              ? 'No leads'
              : `Showing ${pageStart + 1}–${pageEnd} of ${filtered.length} leads`}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Lead Detail Panel (right-side drawer) */}
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
