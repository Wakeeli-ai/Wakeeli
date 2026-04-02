import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { getConversations } from '../api';
import {
  Users,
  MessageSquare,
  Calendar,
  TrendingUp,
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
    property: '2BR Apartment in Achrafieh',
    time: '9:00 AM',
    address: 'Rue Sursock, Achrafieh, Beirut',
    lead: 'Rami Khoury',
    agent: 'Joelle Rizk',
    status: 'Confirmed',
  },
  {
    id: 2,
    property: '3BR Villa in Broummana',
    time: '11:00 AM',
    address: 'Main Road, Broummana, Metn',
    lead: 'Nadia Saade',
    agent: 'Elie Khoury',
    status: 'Confirmed',
  },
  {
    id: 3,
    property: 'Studio in Mar Mikhael',
    time: '1:00 PM',
    address: 'Armenia Street, Mar Mikhael',
    lead: 'Tony Frem',
    agent: 'Joelle Rizk',
    status: 'Pending',
  },
  {
    id: 4,
    property: '4BR Duplex in Verdun',
    time: '3:00 PM',
    address: 'Verdun Street, Ras Beirut',
    lead: 'Maya Nassar',
    agent: 'Roula Bou Jawde',
    status: 'Confirmed',
  },
  {
    id: 5,
    property: 'Sea View Apt in Kaslik',
    time: '4:30 PM',
    address: "Rue de l'Eglise, Kaslik, Jounieh",
    lead: 'Hassan Mourad',
    agent: 'Elie Khoury',
    status: 'Pending',
  },
  {
    id: 6,
    property: '1BR Apartment in Hamra',
    time: '6:00 PM',
    address: 'Bliss Street, Hamra, Beirut',
    lead: 'Lara Bou Jawde',
    agent: 'Joelle Rizk',
    status: 'Cancelled',
  },
];

const TOUR_STATUS_COLORS: Record<string, string> = {
  Confirmed: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const RECENT_LEADS = [
  { name: 'Rami Khoury', phone: '+961 71 234 567', source: 'WhatsApp', status: 'new', ago: '2h ago' },
  { name: 'Nadia Saade', phone: '+961 76 891 234', source: 'Website', status: 'qualified', ago: '5h ago' },
  { name: 'Tony Frem', phone: '+961 70 345 678', source: 'Instagram', status: 'urgent', ago: '1d ago' },
  { name: 'Maya Nassar', phone: '+961 03 567 890', source: 'Referral', status: 'new', ago: '1d ago' },
  { name: 'Hassan Mourad', phone: '+961 71 123 456', source: 'WhatsApp', status: 'follow_up', ago: '2d ago' },
  { name: 'Lara Bou Jawde', phone: '+961 76 234 567', source: 'Website', status: 'new', ago: '2d ago' },
];

const SOURCE_COLORS: Record<string, string> = {
  WhatsApp: 'bg-emerald-100 text-emerald-700',
  Website: 'bg-blue-100 text-blue-700',
  Instagram: 'bg-purple-100 text-purple-700',
  Referral: 'bg-amber-100 text-amber-700',
};

const LEAD_STATUS_COLORS: Record<string, { label: string; cls: string }> = {
  new: { label: 'New', cls: 'bg-emerald-100 text-emerald-700' },
  urgent: { label: 'Urgent', cls: 'bg-red-100 text-red-700' },
  qualified: { label: 'Qualified', cls: 'bg-amber-100 text-amber-700' },
  follow_up: { label: 'Follow-up', cls: 'bg-amber-100 text-amber-700' },
  handed_off: { label: 'AI Handover', cls: 'bg-purple-100 text-purple-700' },
  waiting: { label: 'Waiting', cls: 'bg-blue-100 text-blue-700' },
  closed: { label: 'Closed', cls: 'bg-slate-100 text-slate-600' },
};

const MOCK_CONVERSATIONS = [
  {
    id: 101,
    user_phone: 'Rami Khoury',
    status: 'urgent',
    agent_id: null,
    created_at: '2026-03-31T06:00:00.000Z',
    updated_at: '2026-04-01T07:55:00.000Z',
    messages: [
      { id: 1001, role: 'user', content: 'Hi, I saw your listing on OLX. 2BR in Achrafieh still available?', timestamp: '2026-04-01T07:30:00.000Z' },
      { id: 1002, role: 'assistant', content: 'Hey Rami! Yes still available. 2BR, 120m2, $1,200/mo. Want to book a viewing?', timestamp: '2026-04-01T07:31:00.000Z' },
      { id: 1003, role: 'user', content: 'fi parking w generator?', timestamp: '2026-04-01T07:33:00.000Z' },
      { id: 1004, role: 'assistant', content: 'Yes to both. Covered parking included, 150KVA generator, full coverage.', timestamp: '2026-04-01T07:34:00.000Z' },
      { id: 1005, role: 'user', content: 'baddi 1000 max. 3andi 2 eyyel w el parking lazem ykon fi', timestamp: '2026-04-01T07:54:00.000Z' },
    ],
  },
  {
    id: 102,
    user_phone: 'Nadia Saade',
    status: 'new',
    agent_id: null,
    created_at: '2026-04-01T06:30:00.000Z',
    updated_at: '2026-04-01T07:45:00.000Z',
    messages: [
      { id: 1009, role: 'user', content: 'Good morning! Looking for a 2BR in Achrafieh or Gemmayzeh. Budget $900/mo.', timestamp: '2026-04-01T06:30:00.000Z' },
      { id: 1010, role: 'assistant', content: 'Good morning Nadia! I have 3 options matching your budget. Furnished or unfurnished?', timestamp: '2026-04-01T06:31:00.000Z' },
      { id: 1011, role: 'user', content: 'semi furnished w lazem ykon fi elevator. ma baddi ground floor', timestamp: '2026-04-01T06:45:00.000Z' },
      { id: 1012, role: 'assistant', content: 'Two options have elevators: one on Rue Sursock, one near Sassine Square. Want details?', timestamp: '2026-04-01T06:46:00.000Z' },
    ],
  },
  {
    id: 103,
    user_phone: 'Tony Frem',
    status: 'qualified',
    agent_id: 1,
    created_at: '2026-03-30T10:00:00.000Z',
    updated_at: '2026-04-01T07:20:00.000Z',
    messages: [
      { id: 1015, role: 'user', content: 'Hi, I want to buy a 3BR in Dbayeh. What do you have?', timestamp: '2026-03-30T10:00:00.000Z' },
      { id: 1016, role: 'assistant', content: 'Hey Tony! 3BR in Dbayeh near the highway. 180m2, $380,000. Sea view from master bedroom.', timestamp: '2026-03-30T10:02:00.000Z' },
      { id: 1019, role: 'user', content: 'ana baddi 350k max. fi room for negotiation?', timestamp: '2026-04-01T07:15:00.000Z' },
      { id: 1020, role: 'assistant', content: 'Passed your offer. They came back at $365k, that is their final number.', timestamp: '2026-04-01T07:18:00.000Z' },
    ],
  },
  {
    id: 104,
    user_phone: 'Maya Nassar',
    status: 'handed_off',
    agent_id: 2,
    created_at: '2026-03-28T09:00:00.000Z',
    updated_at: '2026-03-31T16:30:00.000Z',
    messages: [
      { id: 1022, role: 'user', content: 'Hello, I toured the apartment in Kaslik yesterday. I want to proceed.', timestamp: '2026-03-31T14:00:00.000Z' },
      { id: 1023, role: 'assistant', content: 'Amazing Maya! Elie will prepare the contract today.', timestamp: '2026-03-31T14:01:00.000Z' },
      { id: 1026, role: 'user', content: 'Thursday works. See you then', timestamp: '2026-03-31T16:30:00.000Z' },
    ],
  },
  {
    id: 105,
    user_phone: 'Hassan Mourad',
    status: 'new',
    agent_id: null,
    created_at: '2026-04-01T05:00:00.000Z',
    updated_at: '2026-04-01T06:50:00.000Z',
    messages: [
      { id: 1027, role: 'user', content: 'Marhaba, baddi villa fi Broummana aw Beit Mery. 4 ghorf w pool if possible', timestamp: '2026-04-01T05:00:00.000Z' },
      { id: 1028, role: 'assistant', content: 'Ahla Hassan! Stunning 4BR villa in Beit Mery with pool and mountain views. $2,800/mo.', timestamp: '2026-04-01T05:01:00.000Z' },
      { id: 1031, role: 'user', content: 'wow looks amazing. when can I visit?', timestamp: '2026-04-01T06:45:00.000Z' },
    ],
  },
  {
    id: 106,
    user_phone: 'Lara Bou Jawde',
    status: 'urgent',
    agent_id: null,
    created_at: '2026-04-01T08:00:00.000Z',
    updated_at: '2026-04-01T09:40:00.000Z',
    messages: [
      { id: 1033, role: 'user', content: 'URGENT. I need an apartment before end of this week. Hamra or Ras Beirut. Max $800/mo', timestamp: '2026-04-01T08:00:00.000Z' },
      { id: 1034, role: 'assistant', content: '1BR in Hamra near AUB at $750/mo, available immediately. Want to see it today?', timestamp: '2026-04-01T08:02:00.000Z' },
      { id: 1037, role: 'user', content: 'ok I prefer the 1BR. can I see it at 5pm today?', timestamp: '2026-04-01T09:35:00.000Z' },
    ],
  },
  {
    id: 107,
    user_phone: 'Karim Abi Saab',
    status: 'closed',
    agent_id: 1,
    created_at: '2026-03-20T10:00:00.000Z',
    updated_at: '2026-03-25T15:00:00.000Z',
    messages: [
      { id: 1039, role: 'user', content: 'Hi I found something else. Thanks anyway.', timestamp: '2026-03-25T14:55:00.000Z' },
      { id: 1040, role: 'assistant', content: 'No worries Karim! If anything changes we are always here. Good luck!', timestamp: '2026-03-25T15:00:00.000Z' },
    ],
  },
  {
    id: 108,
    user_phone: 'Rita Haddad',
    status: 'new',
    agent_id: null,
    created_at: '2026-04-01T09:00:00.000Z',
    updated_at: '2026-04-01T09:30:00.000Z',
    messages: [
      { id: 1041, role: 'user', content: 'Hi! Looking for a 2BR in Jounieh or Kaslik. Budget $1,000/mo', timestamp: '2026-04-01T09:00:00.000Z' },
      { id: 1042, role: 'assistant', content: 'Hi Rita! 4 options in that area. All 2BR within budget. Sea view preference?', timestamp: '2026-04-01T09:01:00.000Z' },
      { id: 1045, role: 'user', content: '3andi appointment bukra at 10am. can we schedule a tour after?', timestamp: '2026-04-01T09:29:00.000Z' },
    ],
  },
  {
    id: 109,
    user_phone: 'Fadi Gemayel',
    status: 'qualified',
    agent_id: null,
    created_at: '2026-03-31T11:00:00.000Z',
    updated_at: '2026-04-01T08:10:00.000Z',
    messages: [
      { id: 1047, role: 'user', content: 'I visited the Mar Mikhael studio yesterday. I want to rent it.', timestamp: '2026-04-01T07:50:00.000Z' },
      { id: 1048, role: 'assistant', content: 'Excellent Fadi! The owner is very interested. Shall I proceed with contract paperwork?', timestamp: '2026-04-01T07:51:00.000Z' },
      { id: 1052, role: 'assistant', content: 'Send documents over on WhatsApp when ready. Contract will be drafted by then.', timestamp: '2026-04-01T08:10:00.000Z' },
    ],
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
  const [conversations, setConversations] = useState<any[]>(MOCK_CONVERSATIONS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [selectedConvo, setSelectedConvo] = useState<any | null>(MOCK_CONVERSATIONS[0]);

  useEffect(() => {
    getConversations()
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : [];
        const list = data.length > 0 ? data : MOCK_CONVERSATIONS;
        setConversations(list);
        setSelectedConvo((prev: any) => prev ?? list[0]);
      })
      .catch(() => {
        setConversations(MOCK_CONVERSATIONS);
        setSelectedConvo(MOCK_CONVERSATIONS[0]);
      })
      .finally(() => setLoading(false));
  }, []);

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Leads</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">847</p>
              <p className="text-xs text-emerald-600 mt-1">+23 this week</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Users className="text-brand-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Conversations</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">23</p>
              <p className="text-xs text-emerald-600 mt-1">+5 since yesterday</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="text-purple-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Scheduled Tours</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
              <p className="text-xs text-emerald-600 mt-1">+3 this week</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Calendar className="text-amber-600" size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">8.2%</p>
              <p className="text-xs text-emerald-600 mt-1">+1.4% vs last month</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="text-emerald-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Recent Leads</h2>
          <Link to="/leads" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Source</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RECENT_LEADS.map((lead) => {
                const statusInfo = LEAD_STATUS_COLORS[lead.status] ?? { label: lead.status, cls: 'bg-slate-100 text-slate-600' };
                return (
                  <tr key={lead.phone} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {lead.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="font-medium text-slate-900 text-sm">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-600">{lead.phone}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${SOURCE_COLORS[lead.source] ?? 'bg-slate-100 text-slate-600'}`}>
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400">{lead.ago}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Conversations</h2>
            <Link to="/conversations" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View all
            </Link>
          </div>

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

          <div className="flex min-h-[320px]">
            <div className="w-80 flex-shrink-0 border-r border-slate-100 max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="p-6 text-center text-slate-500 text-sm">No conversations here.</p>
              ) : (
                filtered.slice(0, 15).map((c) => {
                  const msgs: any[] = c.messages ?? [];
                  const lastMsg: string = msgs.length ? msgs[msgs.length - 1]?.content ?? '' : '';
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
                          <span className="font-medium text-slate-900 text-sm truncate">{c.user_phone}</span>
                          <span className="text-xs text-slate-400 flex-shrink-0">
                            {formatTimeAgo(c.updated_at || c.created_at)}
                          </span>
                        </div>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium ${badge.cls}`}>
                          {badge.label}
                        </span>
                        {lastMsg && (
                          <p className="text-xs text-slate-500 truncate mt-1">{lastMsg.slice(0, 50)}</p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex-1 bg-slate-50/50 p-5 overflow-y-auto max-h-[420px]">
              {selectedConvo && (selectedConvo.messages ?? []).length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
                    {selectedConvo.user_phone}
                  </p>
                  {((selectedConvo.messages ?? []) as any[]).slice(-5).map((msg: any, i: number) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
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
                    <Link to="/conversations" className="text-brand-600 hover:underline font-medium">
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
          <Link to="/tours" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
            View All
          </Link>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {TOURS.map((tour) => (
            <div key={tour.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-900 text-sm leading-snug">{tour.property}</p>
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
                  {tour.lead.split(' ').map((n) => n[0]).join('')}
                </div>
                <span className="text-xs text-slate-700 font-medium truncate">{tour.lead}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <User size={12} className="flex-shrink-0" />
                  <span>Agent: {tour.agent}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TOUR_STATUS_COLORS[tour.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {tour.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
