import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import {
  getListings,
  getAgents,
  getConversations,
} from '../api';
import {
  UserPlus,
  CheckCircle,
  Building2,
  MessageSquare,
  Loader2,
} from 'lucide-react';

const quickActions = [
  { label: 'View Unassigned Leads', to: '/leads' },
  { label: 'Add New Listing', to: '/listings' },
  { label: "View Today's Tours", to: '/tours' },
  { label: 'Edit Existing Listing', to: '/listings' },
  { label: 'View Analytics Report', to: '/analytics' },
];

function formatTimeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function Dashboard() {
  const { user } = useRole();
  const [listingsCount, setListingsCount] = useState<number | null>(null);
  const [agentsCount, setAgentsCount] = useState<number | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getListings().then((r) => r.data),
      getAgents().then((r) => r.data),
      getConversations().then((r) => r.data),
    ])
      .then(([listings, agents, convos]) => {
        if (cancelled) return;
        setListingsCount(Array.isArray(listings) ? listings.length : 0);
        setAgentsCount(Array.isArray(agents) ? agents.length : 0);
        setConversations(Array.isArray(convos) ? convos : []);
      })
      .catch(() => {
        if (!cancelled) {
          setListingsCount(0);
          setAgentsCount(0);
          setConversations([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const unassignedCount = conversations.filter((c) => !c.agent_id).length;
  const assignedCount = conversations.filter((c) => c.agent_id).length;

  const kpiCards = [
    {
      label: 'Total Listings',
      value: loading ? '—' : String(listingsCount ?? 0),
      icon: Building2,
      color: 'text-brand-600',
    },
    {
      label: 'Active Conversations',
      value: loading ? '—' : String(conversations.length),
      icon: MessageSquare,
      color: 'text-purple-600',
    },
    {
      label: 'With Agent',
      value: loading ? '—' : String(assignedCount),
      sub: `${unassignedCount} unassigned`,
      icon: CheckCircle,
      color: 'text-emerald-600',
    },
    {
      label: 'Total Agents',
      value: loading ? '—' : String(agentsCount ?? 0),
      icon: UserPlus,
      color: 'text-slate-600',
    },
  ];

  const statusColor: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    qualified: 'bg-emerald-100 text-emerald-800',
    handed_off: 'bg-purple-100 text-purple-800',
    closed: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          Welcome back, {user.name.split(' ')[0]}! Here's what's happening today.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{card.label}</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                      {card.sub && (
                        <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
                      )}
                    </div>
                    <Icon className={card.color} size={24} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Conversations */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Conversations</h2>
                <Link
                  to="/conversations"
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  View all
                </Link>
              </div>
              <div className="flex">
                <div className="w-80 border-r border-slate-100 flex flex-col max-h-[320px] overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      No conversations yet. Messages from WhatsApp will appear here.
                    </div>
                  ) : (
                    conversations.slice(0, 10).map((c) => {
                      const lastMsg = c.messages?.length
                        ? c.messages[c.messages.length - 1]?.content
                        : '';
                      return (
                        <Link
                          key={c.id}
                          to="/conversations"
                          className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-700 flex-shrink-0">
                            {String(c.user_phone).slice(-2)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-slate-900 truncate">{c.user_phone}</span>
                              <span className="text-xs text-slate-500 flex-shrink-0">
                                {formatTimeAgo(c.updated_at || c.created_at)}
                              </span>
                            </div>
                            <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${statusColor[c.status] || 'bg-slate-100 text-slate-600'}`}>
                              {c.status.replace('_', ' ')}
                            </span>
                            {lastMsg && (
                              <p className="text-sm text-slate-600 truncate mt-1">{lastMsg.slice(0, 40)}…</p>
                            )}
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
                <div className="flex-1 p-6 bg-slate-50/50 flex items-center justify-center min-h-[200px]">
                  <p className="text-slate-500 text-sm text-center">
                    <Link to="/conversations" className="text-brand-600 hover:underline font-medium">Open Conversations</Link>
                    {' '}to view and manage chats.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-wakeeli-sidebar rounded-xl p-5 text-white">
              <h2 className="font-semibold text-lg">Quick Actions</h2>
              <p className="text-white/80 text-sm mt-1">Streamline your workflow</p>
              <div className="mt-4 space-y-2">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="block w-full text-left px-4 py-2.5 bg-white/15 hover:bg-white/25 rounded-lg text-sm font-medium transition-colors"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
