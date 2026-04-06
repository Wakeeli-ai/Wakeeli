import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { getConversations, getAnalyticsCosts } from '../api';
import { toast } from '../utils/toast';
import { Users, MessageSquare, Calendar, TrendingUp, MapPin } from 'lucide-react';

// ─── Mock Conversations (preserved for API fallback + KPI count) ───────────

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

// ─── Tours ────────────────────────────────────────────────────────────────

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

// ─── Recent Leads ─────────────────────────────────────────────────────────

const RECENT_LEADS = [
  {
    name: 'Rami Khoury',
    initials: 'RK',
    avatarColor: '#2060e8',
    phone: '+961 70 123 456',
    source: 'WhatsApp',
    type: 'Buy',
    statusLabel: 'Qualified',
    statusCls: 'bg-amber-50 text-amber-700',
    budget: '$350,000',
    ago: '2h ago',
  },
  {
    name: 'Nadia Haddad',
    initials: 'NH',
    avatarColor: '#7c3aed',
    phone: '+961 71 234 567',
    source: 'Instagram',
    type: 'Rent',
    statusLabel: 'New',
    statusCls: 'bg-emerald-50 text-emerald-700',
    budget: '$1,200/mo',
    ago: '5h ago',
  },
  {
    name: 'Tony Gemayel',
    initials: 'TG',
    avatarColor: '#0891b2',
    phone: '+961 76 345 678',
    source: 'WhatsApp',
    type: 'Buy',
    statusLabel: 'Tour Booked',
    statusCls: 'bg-blue-50 text-blue-700',
    budget: '$500,000',
    ago: '1d ago',
  },
  {
    name: 'Maya Nasrallah',
    initials: 'MN',
    avatarColor: '#be185d',
    phone: '+961 78 456 789',
    source: 'Website',
    type: 'Rent',
    statusLabel: 'Qualifying',
    statusCls: 'bg-amber-50 text-amber-700',
    budget: '$1,500/mo',
    ago: '1d ago',
  },
  {
    name: 'Sami Aoun',
    initials: 'SA',
    avatarColor: '#c2410c',
    phone: '+961 03 567 890',
    source: 'WhatsApp',
    type: 'Buy',
    statusLabel: 'Handed Off',
    statusCls: 'bg-slate-100 text-slate-600',
    budget: '$250,000',
    ago: '1 week ago',
  },
];

const SOURCE_BADGE: Record<string, string> = {
  WhatsApp: 'bg-emerald-50 text-emerald-700',
  Website: 'bg-blue-50 text-blue-700',
  Instagram: 'bg-purple-50 text-purple-700',
  Referral: 'bg-amber-50 text-amber-700',
};

const TYPE_BADGE: Record<string, string> = {
  Buy: 'bg-blue-50 text-blue-700',
  Rent: 'bg-amber-50 text-amber-700',
};

// ─── Funnel ───────────────────────────────────────────────────────────────

const FUNNEL_DATA = [
  { label: 'New Leads', count: 214, pct: 100, color: '#2060e8' },
  { label: 'Qualified', count: 154, pct: 72, color: '#7c3aed' },
  { label: 'Tours Booked', count: 94, pct: 44, color: '#f59e0b' },
  { label: 'Deals Closed', count: 24, pct: 11, color: '#16a34a' },
];

// ─── Agent Leaderboard ────────────────────────────────────────────────────

const AGENT_LEADERBOARD = [
  { rank: 1, initials: 'JR', name: 'Joelle Rizk', deals: 14, conversion: '14.2%', delta: '+2.1%', color: '#2060e8' },
  { rank: 2, initials: 'EK', name: 'Elie Khoury', deals: 11, conversion: '11.0%', delta: '+1.0%', color: '#7c3aed' },
  { rank: 3, initials: 'RB', name: 'Roula Bou Jawde', deals: 8, conversion: '9.4%', delta: null, color: '#0891b2' },
  { rank: 4, initials: 'MN', name: 'Marc Nader', deals: 4, conversion: '7.3%', delta: null, color: '#c2410c' },
];

// ─── Quick Actions ────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'View Unassigned Leads', to: '/leads' },
  { label: 'Add New Listing', to: '/listings' },
  { label: "View Today's Tours", to: '/tours' },
  { label: 'View Analytics Report', to: '/analytics' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────

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

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getTodayString(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function rankColor(rank: number): string {
  if (rank === 1) return 'text-amber-400';
  if (rank === 2) return 'text-slate-400';
  if (rank === 3) return 'text-orange-700';
  return 'text-slate-300';
}

// ─── Component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useRole();
  const [conversations, setConversations] = useState<any[]>(MOCK_CONVERSATIONS);
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState<{ totalConversations: number; activeConversations: number } | null>(null);

  useEffect(() => {
    getConversations()
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : [];
        const list = data.length > 0 ? data : MOCK_CONVERSATIONS;
        setConversations(list);
      })
      .catch(() => {
        toast.error('Failed to load conversations.');
        setConversations(MOCK_CONVERSATIONS);
      })
      .finally(() => setLoading(false));

    getAnalyticsCosts(30)
      .then((r) => {
        const summary = r.data?.summary;
        if (summary) {
          setKpi({
            totalConversations: summary.total_conversations,
            activeConversations: summary.total_conversations,
          });
        }
      })
      .catch(() => {
        console.warn('[Dashboard] Analytics unavailable.');
      });
  }, []);

  const activeConvCount = conversations.filter((c) => c.status !== 'closed').length || 23;
  const totalLeads = kpi?.totalConversations || 1847;
  const toursToday = TOURS.filter((t) => t.status !== 'Cancelled').length;
  const firstName = user.name.split(' ')[0];
  const activeTours = TOURS.filter((t) => t.status !== 'Cancelled').slice(0, 4);

  // Suppress unused var warning while preserving the function
  void formatTimeAgo;
  void loading;

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {getTodayString()} · Here is what is happening today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users size={20} className="text-blue-600" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-3.5">Total Leads</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
            {totalLeads.toLocaleString()}
          </p>
          <p className="text-xs font-semibold text-emerald-600 mt-1">+23 this week</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <MessageSquare size={20} className="text-purple-600" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-3.5">Active Conversations</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{activeConvCount}</p>
          <p className="text-xs font-semibold text-emerald-600 mt-1">+5 since yesterday</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Calendar size={20} className="text-amber-600" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-3.5">Tours Today</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{toursToday}</p>
          <p className="text-xs font-semibold text-emerald-600 mt-1">Next at 9:00 AM</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <TrendingUp size={20} className="text-emerald-600" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-3.5">Conversion Rate</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">11.2%</p>
          <p className="text-xs font-semibold text-emerald-600 mt-1">+1.4% vs last month</p>
        </div>

      </div>

      {/* Main Grid: Recent Leads (2fr) + Funnel/Quick Actions (1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Leads Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Recent Leads</h2>
            <Link
              to="/leads"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              View all {totalLeads.toLocaleString()}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Source</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Budget</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">Added</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_LEADS.map((lead) => (
                  <tr
                    key={lead.phone}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: lead.avatarColor }}
                        >
                          {lead.initials}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900 leading-tight">{lead.name}</div>
                          <div className="text-xs text-slate-400">{lead.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${SOURCE_BADGE[lead.source] ?? 'bg-slate-100 text-slate-600'}`}>
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_BADGE[lead.type] ?? 'bg-slate-100 text-slate-600'}`}>
                        {lead.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${lead.statusCls}`}>
                        {lead.statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">{lead.budget}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{lead.ago}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Funnel + Quick Actions */}
        <div className="flex flex-col gap-5">

          {/* Conversion Funnel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Conversion Funnel</h2>
              <span className="text-xs text-slate-400">This month</span>
            </div>
            <div className="p-5 space-y-3">
              {FUNNEL_DATA.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500 w-24 flex-shrink-0 leading-tight">
                    {item.label}
                  </span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden">
                    <div
                      className="h-full rounded-md flex items-center pl-2.5"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    >
                      <span className="text-xs font-bold text-white">{item.count}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-8 text-right flex-shrink-0">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="rounded-xl p-5 text-white"
            style={{ background: 'linear-gradient(160deg, #0f1729 0%, #1e3a8a 100%)' }}
          >
            <h2 className="text-sm font-bold">Quick Actions</h2>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Streamline your workflow
            </p>
            <div className="mt-3.5 space-y-1.5">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="block w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border border-white/10 text-white/90 transition-colors hover:bg-white/20"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Grid: Today's Tours + Agent Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Today's Tours */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Today's Tours</h2>
            <Link
              to="/tours"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {activeTours.map((tour) => (
              <div
                key={tour.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3.5"
              >
                <span className="inline-block text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md mb-2">
                  {tour.time}
                </span>
                <div className="text-sm font-bold text-slate-900 leading-snug">{tour.property}</div>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={10} className="text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-500 truncate">{tour.address}</span>
                </div>
                <div className="flex items-center justify-between mt-2.5 gap-2">
                  <span className="text-xs font-semibold text-slate-700 truncate">{tour.lead}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${TOUR_STATUS_COLORS[tour.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {tour.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Leaderboard */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Agent Leaderboard</h2>
            <span className="text-xs text-slate-400">This month</span>
          </div>
          <div className="px-5 pt-4 pb-5">

            {AGENT_LEADERBOARD.map((agent) => (
              <div
                key={agent.rank}
                className="flex items-center gap-2.5 py-2.5 border-b border-slate-100 last:border-0"
              >
                <span className={`text-sm font-extrabold w-5 text-center flex-shrink-0 ${rankColor(agent.rank)}`}>
                  {agent.rank}
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700 leading-tight">{agent.name}</div>
                  <div className="text-xs text-slate-400">{agent.deals} deals closed</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-slate-900">
                    {agent.conversion}
                    {agent.delta && (
                      <span className="text-emerald-600 font-semibold ml-1">{agent.delta}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">conversion</div>
                </div>
              </div>
            ))}

            {/* AI Performance */}
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 mb-1">AI Performance</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold text-purple-600">94%</span>
                <span className="text-xs text-slate-400">conversations handled without agent</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
