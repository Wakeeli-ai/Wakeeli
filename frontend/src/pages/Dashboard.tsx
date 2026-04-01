import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { getConversations } from '../api';
import {
  UserPlus,
  Calendar,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  User,
} from 'lucide-react';

const FILTER_TABS = ['All', 'Urgent', 'AI Handover', 'Waiting', 'New'] as const;
type FilterTab = typeof FILTER_TABS[number];

const QUICK_ACTIONS = [
  { label: 'View Unassigned Leads', to: '/leads' },
  { label: 'Add New Listing', to: '/listings' },
  { label: "View Today's Tours", to: '/tours' },
  { label: 'Edit Existing Listing', to: '/listings' },
  { label: 'View Analytics Report', to: '/analytics' },
];

const TOURS = [
  {
    id: 1,
    property: 'Modern Loft Downtown',
    time: '9:00 AM',
    address: '2847 Oak Street, Suite 301',
    lead: 'Sophia Chen',
    agent: 'Michael Chen',
  },
  {
    id: 2,
    property: 'Family Home with Pool',
    time: '11:30 AM',
    address: '1542 Maple Avenue',
    lead: 'Brandon Harris',
    agent: 'Jessica Park',
  },
  {
    id: 3,
    property: 'Luxury Penthouse',
    time: '2:00 PM',
    address: '890 Harbor View Drive',
    lead: 'Nicole Garcia',
    agent: 'David Lee',
  },
  {
    id: 4,
    property: 'Suburban Townhouse',
    time: '4:30 PM',
    address: '3621 Elm Street',
    lead: 'Alex Wilson',
    agent: 'Sarah Mitchell',
  },
];

function formatTimeAgo(dateStr: string): string {
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

function getInitials(phone: string): string {
  return String(phone).slice(-2).toUpperCase();
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function statusBadge(status: string): { label: string; cls: string } {
  const map: Record<string, { label: string; cls: string }> = {
    urgent: { label: 'Urgent', cls: 'bg-red-100 text-red-700' },
    handed_off: { label: 'AI Handover', cls: 'bg-purple-100 text-purple-700' },
    waiting: { label: 'Waiting', cls: 'bg-blue-100 text-blue-700' },
    new: { label: 'New', cls: 'bg-emerald-100 text-emerald-700' },
    follow_up: { label: 'Follow-up', cls: 'bg-amber-100 text-amber-700' },
    qualified: { label: 'Follow-up', cls: 'bg-amber-100 text-amber-700' },
    closed: { label: 'Closed', cls: 'bg-slate-100 text-slate-600' },
  };
  return map[status] ?? { label: status.replace('_', ' '), cls: 'bg-slate-100 text-slate-600' };
}

function filterConversations(convos: any[], tab: FilterTab): any[] {
  if (tab === 'All') return convos;
  if (tab === 'Urgent') return convos.filter((c) => c.status === 'urgent');
  if (tab === 'AI Handover') return convos.filter((c) => c.status === 'handed_off');
  if (tab === 'Waiting') return convos.filter((c) => c.status === 'waiting');
  if (tab === 'New') return convos.filter((c) => c.status === 'new');
  return convos;
}

export default function Dashboard() {
  const { user } = useRole();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [selectedConvo, setSelectedConvo] = useState<any | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getConversations()
      .then((r) => {
        if (cancelled) return;
        const data = Array.isArray(r.data) ? r.data : [];
        setConversations(data);
        if (data.length > 0) setSelectedConvo(data[0]);
      })
      .catch(() => {
        if (!cancelled) setConversations([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const newLeadsToday = conversations.filter(
    (c) => c.status === 'new' && isToday(c.created_at)
  ).length;

  const filtered = filterConversations(conversations, activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Welcome back, {user.name.split(' ')[0]}! Here's what's happening today.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">New Leads Today</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{newLeadsToday}</p>
                  <p className="text-xs text-emerald-600 mt-1">vs yesterday +12%</p>
                </div>
                <UserPlus className="text-brand-600 flex-shrink-0" size={22} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Tours Booked</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
                  <p className="text-xs text-emerald-600 mt-1">vs yesterday +15%</p>
                </div>
                <Calendar className="text-amber-600 flex-shrink-0" size={22} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Deals Closed</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">3</p>
                  <p className="text-xs text-emerald-600 mt-1">vs yesterday +8%</p>
                </div>
                <CheckCircle className="text-emerald-600 flex-shrink-0" size={22} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Avg Response Time</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">2.4 min</p>
                  <p className="text-xs text-slate-400 mt-1">AI: 0.8min / Human: 4.2min</p>
                </div>
                <Clock className="text-blue-600 flex-shrink-0" size={22} />
              </div>
            </div>
          </div>

          {/* Main 2-col layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations panel */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Panel header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">Conversations</h2>
                <Link
                  to="/conversations"
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  View all
                </Link>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1 px-4 pt-3 border-b border-slate-100">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                      activeTab === tab
                        ? 'bg-brand-50 text-brand-600 border-b-2 border-brand-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* List + preview split */}
              <div className="flex min-h-[320px]">
                {/* Conversation list */}
                <div className="w-80 flex-shrink-0 border-r border-slate-100 max-h-[420px] overflow-y-auto">
                  {filtered.length === 0 ? (
                    <p className="p-6 text-center text-slate-500 text-sm">
                      No conversations here.
                    </p>
                  ) : (
                    filtered.slice(0, 15).map((c) => {
                      const msgs: any[] = c.messages ?? [];
                      const lastMsg: string = msgs.length
                        ? msgs[msgs.length - 1]?.content ?? ''
                        : '';
                      const badge = statusBadge(c.status);
                      const isSelected = selectedConvo?.id === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedConvo(c)}
                          className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-slate-100 last:border-0 transition-colors ${
                            isSelected ? 'bg-brand-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 flex-shrink-0">
                            {getInitials(c.user_phone)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-medium text-slate-900 text-sm truncate">
                                {c.user_phone}
                              </span>
                              <span className="text-xs text-slate-400 flex-shrink-0">
                                {formatTimeAgo(c.updated_at || c.created_at)}
                              </span>
                            </div>
                            <span
                              className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium ${badge.cls}`}
                            >
                              {badge.label}
                            </span>
                            {lastMsg && (
                              <p className="text-xs text-slate-500 truncate mt-1">
                                {lastMsg.slice(0, 50)}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Chat preview */}
                <div className="flex-1 bg-slate-50/50 p-5 overflow-y-auto max-h-[420px]">
                  {selectedConvo && (selectedConvo.messages ?? []).length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
                        {selectedConvo.user_phone}
                      </p>
                      {((selectedConvo.messages ?? []) as any[])
                        .slice(-5)
                        .map((msg: any, i: number) => (
                          <div
                            key={i}
                            className={`flex ${
                              msg.role === 'user' ? 'justify-start' : 'justify-end'
                            }`}
                          >
                            <div
                              className={`max-w-xs rounded-xl px-3 py-2 text-sm ${
                                msg.role === 'user'
                                  ? 'bg-white border border-slate-200 text-slate-700'
                                  : 'bg-brand-600 text-white'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-slate-400 text-sm text-center">
                        <Link
                          to="/conversations"
                          className="text-brand-600 hover:underline font-medium"
                        >
                          Open Conversations
                        </Link>{' '}
                        to view and manage chats
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-wakeeli-sidebar rounded-xl p-5 text-white">
              <h2 className="font-semibold text-lg">Quick Actions</h2>
              <p className="text-white/70 text-sm mt-1">Streamline your workflow</p>
              <div className="mt-4 space-y-2">
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="block w-full px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Tours */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">Today's Tours</h2>
              <Link
                to="/tours"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {TOURS.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900 text-sm leading-snug">
                      {tour.property}
                    </p>
                    <span className="flex-shrink-0 text-xs font-medium bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {tour.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin size={12} className="flex-shrink-0" />
                    <span className="truncate">{tour.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 flex-shrink-0">
                      {tour.lead
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <span className="text-xs text-slate-700 font-medium truncate">
                      {tour.lead}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <User size={12} className="flex-shrink-0" />
                    <span>Agent: {tour.agent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
