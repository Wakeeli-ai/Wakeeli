import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { getConversations, getAgents } from '../api';
import { Download, LayoutGrid, Loader2, X } from 'lucide-react';
import LeadDetailPanel from '../components/LeadDetailPanel';

type Conversation = {
  id: number;
  user_phone: string;
  status: string;
  user_requirements: { listing_type?: string } | null;
  agent_id: number | null;
  agent?: { name: string } | null;
  created_at: string;
  updated_at: string | null;
  messages?: { content: string }[];
};

function formatTimeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getMockSource(id: number): 'WhatsApp' | 'Instagram' | 'Website' {
  const sources = ['WhatsApp', 'Instagram', 'Website'] as const;
  return sources[id % 3];
}

function getMockType(c: Conversation): string {
  if (c.user_requirements?.listing_type) return c.user_requirements.listing_type;
  return c.id % 2 === 0 ? 'buy' : 'rent';
}

function getActivityText(status: string): string {
  switch (status) {
    case 'qualifying': return 'Viewed listing';
    case 'qualified': return 'Requirements confirmed';
    case 'tour_booked': return 'Tour scheduled';
    case 'handed_to_agent':
    case 'handed_off': return 'Handed to agent';
    default: return 'AI follow-up sent';
  }
}

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
  handed_off: 'bg-slate-100 text-slate-600',
};

const STATUS_LABEL: Record<string, string> = {
  new: 'New',
  qualifying: 'Qualifying',
  qualified: 'Qualified',
  tour_booked: 'Tour Booked',
  handed_to_agent: 'Handed to Agent',
  handed_off: 'Handed to Agent',
};

const PAGE_SIZE = 10;

export default function Leads() {
  const { role } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [agents, setAgents] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ source: '', type: '', status: '', agent: '' });
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const isAgent = role === 'agent';
  const title = isAgent ? 'My Leads' : 'Leads';
  const subtitle = searchQuery
    ? `Search results for "${searchQuery}"`
    : 'Manage and track all your property leads';

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [convos, agentsList] = await Promise.all([
        getConversations(searchQuery || undefined).then((r) => r.data),
        getAgents().then((r) => r.data),
      ]);
      setConversations(Array.isArray(convos) ? convos : []);
      setAgents(Array.isArray(agentsList) ? agentsList : []);
    } catch {
      setError('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const filtered = conversations.filter((c) => {
    if (filters.source && getMockSource(c.id) !== filters.source) return false;
    if (filters.type && getMockType(c) !== filters.type) return false;
    if (filters.status && c.status !== filters.status) return false;
    if (filters.agent) {
      const aid = parseInt(filters.agent, 10);
      if (c.agent_id !== aid) return false;
    }
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
            {agents.map((a) => (
              <option key={a.id} value={String(a.id)}>{a.name}</option>
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          </div>
        ) : (
          <>
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
                  {paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isAgent ? 7 : 8}
                        className="px-6 py-12 text-center text-slate-400"
                      >
                        No leads found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((c) => {
                      const initials = c.user_phone.slice(-2).toUpperCase();
                      const source = getMockSource(c.id);
                      const type = getMockType(c);
                      const statusLabel = STATUS_LABEL[c.status] || c.status;
                      const activityText = getActivityText(c.status);
                      const timeAgo = formatTimeAgo(c.updated_at || c.created_at);

                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedLeadId(c.id)}
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
                                <p className="font-semibold text-slate-900">{c.user_phone}</p>
                                <p className="text-xs text-slate-400">No email on file</p>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-6 py-4 text-slate-700">{c.user_phone}</td>

                          {/* Source */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${SOURCE_BADGE[source]}`}>
                              {source}
                            </span>
                          </td>

                          {/* Type */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_BADGE[type] || 'bg-slate-100 text-slate-600'}`}>
                              {type}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[c.status] || 'bg-slate-100 text-slate-600'}`}>
                              {statusLabel}
                            </span>
                          </td>

                          {/* Assigned Agent */}
                          {!isAgent && (
                            <td className="px-6 py-4">
                              {c.agent ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                                    {c.agent.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <span className="text-slate-700">{c.agent.name}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-xs">AI Routing</span>
                              )}
                            </td>
                          )}

                          {/* Last Activity */}
                          <td className="px-6 py-4">
                            <p className="text-slate-600 text-sm">{timeAgo}</p>
                            <p className="text-xs text-slate-400">{activityText}</p>
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
          </>
        )}
      </div>

      {/* Lead Detail Panel (right-side drawer) */}
      {selectedLeadId !== null && (
        <LeadDetailPanel
          conversationId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
