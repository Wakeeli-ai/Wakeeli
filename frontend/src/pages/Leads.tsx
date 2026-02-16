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

export default function Leads() {
  const { role } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [agents, setAgents] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ type: '', status: '', agent: '' });
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
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

  const clearSearch = () => {
    setSearchParams({});
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const filtered = conversations.filter((c) => {
    if (filters.type && (c.user_requirements?.listing_type || '') !== filters.type) return false;
    if (filters.status && c.status !== filters.status) return false;
    if (filters.agent) {
      const aid = parseInt(filters.agent, 10);
      if (c.agent_id !== aid) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1">{subtitle}</p>
          {searchQuery && (
            <button
              onClick={clearSearch}
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
            <Download size={18} />
            Export
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
          >
            <LayoutGrid size={18} />
            Table View
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-600">Filters:</span>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Types</option>
          <option value="buy">Buy</option>
          <option value="rent">Rent</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="qualified">Qualified</option>
          <option value="handed_off">Handed off</option>
          <option value="closed">Closed</option>
        </select>
        {!isAgent && (
          <select
            value={filters.agent}
            onChange={(e) => setFilters({ ...filters, agent: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
          >
            <option value="">All Agents</option>
            {agents.map((a) => (
              <option key={a.id} value={String(a.id)}>{a.name}</option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={() => setFilters({ type: '', status: '', agent: '' })}
          className="text-sm text-brand-600 hover:text-brand-700 font-medium"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                    <th className="px-6 py-4 w-10"><input type="checkbox" className="rounded" /></th>
                    <th className="px-6 py-4">Lead</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    {!isAgent && <th className="px-6 py-4">Assigned Agent</th>}
                    <th className="px-6 py-4">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => {
                    const initials = String(c.user_phone).slice(-2);
                    const type = c.user_requirements?.listing_type ? String(c.user_requirements.listing_type) : '—';
                    const lastMsg = c.messages?.length ? c.messages[c.messages.length - 1]?.content?.slice(0, 30) : '';
                    return (
                      <tr 
                        key={c.id} 
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedLeadId(c.id)}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-medium">
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{c.user_phone}</p>
                              <p className="text-xs text-slate-500">{c.status.replace('_', ' ')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-900">{c.user_phone}</p>
                          <p className="text-xs text-slate-500">WhatsApp</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                            WhatsApp
                          </span>
                        </td>
                        <td className="px-6 py-4 capitalize">{type}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            c.status === 'new' ? 'bg-blue-100 text-blue-800' :
                            c.status === 'qualified' ? 'bg-emerald-100 text-emerald-800' :
                            c.status === 'handed_off' ? 'bg-purple-100 text-purple-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {c.status.replace('_', ' ')}
                          </span>
                        </td>
                        {!isAgent && (
                          <td className="px-6 py-4">
                            {c.agent ? (
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                                  {c.agent.name.slice(0, 2).toUpperCase()}
                                </div>
                                {c.agent.name}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <p className="text-slate-600">{formatTimeAgo(c.updated_at || c.created_at)}</p>
                          {lastMsg && <p className="text-xs text-slate-500 truncate max-w-[120px]">{lastMsg}…</p>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-slate-100 text-sm text-slate-500">
              Showing 1–{filtered.length} of {filtered.length} leads
            </div>
          </>
        )}
      </div>

      {/* Lead Detail Panel */}
      {selectedLeadId && (
        <LeadDetailPanel
          conversationId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
