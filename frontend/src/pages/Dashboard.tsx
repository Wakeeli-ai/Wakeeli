import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { getConversations, getAnalyticsCosts } from '../api';
import { toast } from '../utils/toast';
import { Users, MessageSquare, Calendar, TrendingUp, MapPin, ArrowUpRight } from 'lucide-react';

// ─── Mock Conversations ────────────────────────────────────────────────────

const MOCK_CONVERSATIONS = [
  { id: 101, user_phone: 'Rami Khoury', status: 'urgent', agent_id: null, created_at: '2026-03-31T06:00:00.000Z', updated_at: '2026-04-01T07:55:00.000Z' },
  { id: 102, user_phone: 'Nadia Saade', status: 'new', agent_id: null, created_at: '2026-04-01T06:30:00.000Z', updated_at: '2026-04-01T07:45:00.000Z' },
  { id: 103, user_phone: 'Tony Frem', status: 'qualified', agent_id: 1, created_at: '2026-03-30T10:00:00.000Z', updated_at: '2026-04-01T07:20:00.000Z' },
  { id: 104, user_phone: 'Maya Nassar', status: 'handed_off', agent_id: 2, created_at: '2026-03-28T09:00:00.000Z', updated_at: '2026-03-31T16:30:00.000Z' },
  { id: 105, user_phone: 'Hassan Mourad', status: 'new', agent_id: null, created_at: '2026-04-01T05:00:00.000Z', updated_at: '2026-04-01T06:50:00.000Z' },
  { id: 106, user_phone: 'Lara Bou Jawde', status: 'urgent', agent_id: null, created_at: '2026-04-01T08:00:00.000Z', updated_at: '2026-04-01T09:40:00.000Z' },
  { id: 107, user_phone: 'Karim Abi Saab', status: 'closed', agent_id: 1, created_at: '2026-03-20T10:00:00.000Z', updated_at: '2026-03-25T15:00:00.000Z' },
  { id: 108, user_phone: 'Rita Haddad', status: 'new', agent_id: null, created_at: '2026-04-01T09:00:00.000Z', updated_at: '2026-04-01T09:30:00.000Z' },
  { id: 109, user_phone: 'Fadi Gemayel', status: 'qualified', agent_id: null, created_at: '2026-03-31T11:00:00.000Z', updated_at: '2026-04-01T08:10:00.000Z' },
];

// ─── Tours ─────────────────────────────────────────────────────────────────

const TOURS = [
  { id: 1, property: '2BR Apartment in Achrafieh', time: '9:00 AM', address: 'Rue Sursock, Achrafieh', lead: 'Rami Khoury', agent: 'Joelle Rizk', status: 'Confirmed' },
  { id: 2, property: '3BR Villa in Broummana', time: '11:00 AM', address: 'Main Road, Broummana', lead: 'Nadia Saade', agent: 'Elie Khoury', status: 'Confirmed' },
  { id: 3, property: 'Studio in Mar Mikhael', time: '1:00 PM', address: 'Armenia Street, Mar Mikhael', lead: 'Tony Frem', agent: 'Joelle Rizk', status: 'Pending' },
  { id: 4, property: '4BR Duplex in Verdun', time: '3:00 PM', address: 'Verdun Street, Ras Beirut', lead: 'Maya Nassar', agent: 'Roula Bou Jawde', status: 'Confirmed' },
  { id: 5, property: 'Sea View Apt in Kaslik', time: '4:30 PM', address: "Rue de l'Eglise, Kaslik", lead: 'Hassan Mourad', agent: 'Elie Khoury', status: 'Pending' },
  { id: 6, property: '1BR Apartment in Hamra', time: '6:00 PM', address: 'Bliss Street, Hamra', lead: 'Lara Bou Jawde', agent: 'Joelle Rizk', status: 'Cancelled' },
];

const TOUR_STATUS_COLORS: Record<string, string> = {
  Confirmed: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
  Cancelled: 'bg-red-100 text-red-700',
};

// ─── Recent Leads ──────────────────────────────────────────────────────────

const RECENT_LEADS = [
  { name: 'Rami Khoury', initials: 'RK', avatarColor: '#2060e8', phone: '+961 70 123 456', source: 'WhatsApp', type: 'Buy', statusLabel: 'Qualified', statusCls: 'bg-amber-50 text-amber-700', budget: '$350,000', ago: '2h ago' },
  { name: 'Nadia Haddad', initials: 'NH', avatarColor: '#7c3aed', phone: '+961 71 234 567', source: 'Instagram', type: 'Rent', statusLabel: 'New', statusCls: 'bg-emerald-50 text-emerald-700', budget: '$1,200/mo', ago: '5h ago' },
  { name: 'Tony Gemayel', initials: 'TG', avatarColor: '#0891b2', phone: '+961 76 345 678', source: 'WhatsApp', type: 'Buy', statusLabel: 'Tour Booked', statusCls: 'bg-blue-50 text-blue-700', budget: '$500,000', ago: '1d ago' },
  { name: 'Maya Nasrallah', initials: 'MN', avatarColor: '#be185d', phone: '+961 78 456 789', source: 'Website', type: 'Rent', statusLabel: 'Qualifying', statusCls: 'bg-amber-50 text-amber-700', budget: '$1,500/mo', ago: '1d ago' },
  { name: 'Sami Aoun', initials: 'SA', avatarColor: '#c2410c', phone: '+961 03 567 890', source: 'WhatsApp', type: 'Buy', statusLabel: 'Handed Off', statusCls: 'bg-slate-100 text-slate-600', budget: '$250,000', ago: '1 week ago' },
];

const SOURCE_BADGE: Record<string, string> = {
  WhatsApp: 'bg-emerald-50 text-emerald-700',
  Website: 'bg-blue-50 text-blue-700',
  Instagram: 'bg-purple-50 text-purple-700',
  Referral: 'bg-amber-50 text-amber-700',
};

// ─── Funnel ────────────────────────────────────────────────────────────────

const FUNNEL_DATA = [
  { label: 'New Leads', count: 214, pct: 100, color: '#2060e8' },
  { label: 'Qualified', count: 154, pct: 72, color: '#7c3aed' },
  { label: 'Tours Booked', count: 94, pct: 44, color: '#f59e0b' },
  { label: 'Deals Closed', count: 24, pct: 11, color: '#16a34a' },
];

// ─── Agent Leaderboard ─────────────────────────────────────────────────────

const AGENT_LEADERBOARD = [
  { rank: 1, initials: 'JR', name: 'Joelle Rizk', deals: 14, conversion: '14.2%', delta: '+2.1%', color: '#2060e8' },
  { rank: 2, initials: 'EK', name: 'Elie Khoury', deals: 11, conversion: '11.0%', delta: '+1.0%', color: '#7c3aed' },
  { rank: 3, initials: 'RB', name: 'Roula Bou Jawde', deals: 8, conversion: '9.4%', delta: null, color: '#0891b2' },
  { rank: 4, initials: 'MN', name: 'Marc Nader', deals: 4, conversion: '7.3%', delta: null, color: '#c2410c' },
];

// ─── Recent Activity ───────────────────────────────────────────────────────

const ACTIVITY = [
  { icon: MessageSquare, color: 'text-brand-600 bg-brand-50', text: 'Charbel Khoury started a WhatsApp conversation', time: '2m ago' },
  { icon: Calendar, color: 'text-emerald-600 bg-emerald-50', text: 'Tour confirmed: Nadia Saade at Broummana villa', time: '18m ago' },
  { icon: Users, color: 'text-amber-600 bg-amber-50', text: 'Omar Fakih handed off to Joelle Rizk', time: '45m ago' },
  { icon: MessageSquare, color: 'text-purple-600 bg-purple-50', text: 'New lead from Instagram: Karim Mouawad', time: '1h ago' },
  { icon: TrendingUp, color: 'text-slate-600 bg-slate-50', text: 'Lara Daher signed rental contract in Achrafieh', time: '2h ago' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getTodayString(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function rankColor(rank: number): string {
  if (rank === 1) return 'text-amber-400';
  if (rank === 2) return 'text-slate-400';
  if (rank === 3) return 'text-orange-700';
  return 'text-slate-300';
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useRole();
  const [conversations, setConversations] = useState<any[]>(MOCK_CONVERSATIONS);
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState<{ totalConversations: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'tours'>('overview');

  useEffect(() => {
    getConversations()
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : [];
        if (data.length > 0) setConversations(data);
      })
      .catch(() => {
        toast.error('Failed to load conversations.');
      })
      .finally(() => setLoading(false));

    getAnalyticsCosts(30)
      .then((r) => {
        const summary = r.data?.summary;
        if (summary) setKpi({ totalConversations: summary.total_conversations });
      })
      .catch(() => { /* silent */ });
  }, []);

  void loading;

  const activeConvCount = conversations.filter((c) => c.status !== 'closed').length || 23;
  const totalLeads = kpi?.totalConversations || 1847;
  const toursToday = TOURS.filter((t) => t.status !== 'Cancelled').length;
  const firstName = user.name.split(' ')[0];
  const activeTours = TOURS.filter((t) => t.status !== 'Cancelled').slice(0, 4);

  const kpiCards = [
    {
      icon: Users,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      label: 'Total Leads',
      value: totalLeads.toLocaleString(),
      trend: '+23 this week',
      trendColor: 'text-emerald-600',
    },
    {
      icon: MessageSquare,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      label: 'Active Chats',
      value: String(activeConvCount),
      trend: '+5 since yesterday',
      trendColor: 'text-emerald-600',
    },
    {
      icon: Calendar,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      label: 'Tours Today',
      value: String(toursToday),
      trend: 'Next at 9:00 AM',
      trendColor: 'text-slate-500',
    },
    {
      icon: TrendingUp,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      label: 'Conversion',
      value: '11.2%',
      trend: '+1.4% vs last month',
      trendColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">

      {/* ===== PAGE HEADER ===== */}
      <div>
        <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          {getTodayString()}
        </p>
      </div>

      {/* ===== KPI GRID ===== */}
      {/* Mobile: compact 2x2 grid | Desktop: 4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 md:p-5"
            >
              {/* Mobile: icon + label inline | Desktop: icon above */}
              <div className="flex items-center gap-2 md:block">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl ${kpi.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={16} className={`md:w-5 md:h-5 ${kpi.iconColor}`} />
                </div>
                <p className="text-[11px] md:hidden font-semibold text-slate-500 uppercase tracking-wide leading-tight">
                  {kpi.label}
                </p>
              </div>
              <p className="hidden md:block text-xs font-semibold text-slate-500 uppercase tracking-wider mt-3.5">
                {kpi.label}
              </p>
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight leading-none">
                {kpi.value}
              </p>
              <p className={`text-[11px] md:text-xs font-semibold mt-1 ${kpi.trendColor}`}>
                {kpi.trend}
              </p>
            </div>
          );
        })}
      </div>

      {/* ===== MOBILE TABS: Overview / Activity / Tours ===== */}
      <div className="md:hidden flex border-b border-slate-200 bg-white rounded-t-xl overflow-hidden -mb-4">
        {(['overview', 'activity', 'tours'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ===== MOBILE: Overview Tab ===== */}
      {activeTab === 'overview' && (
        <div className="md:hidden space-y-3 pt-4">

          {/* Recent Leads compact list */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Recent Leads</h2>
              <Link to="/leads" className="text-xs font-semibold text-brand-600 flex items-center gap-0.5">
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            {RECENT_LEADS.slice(0, 5).map((lead) => (
              <div
                key={lead.phone}
                className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: lead.avatarColor }}
                >
                  {lead.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate leading-tight">{lead.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${lead.statusCls}`}>
                      {lead.statusLabel}
                    </span>
                    <span className="text-[11px] text-slate-400">{lead.budget}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${SOURCE_BADGE[lead.source] ?? 'bg-slate-100 text-slate-600'}`}>
                    {lead.source}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{lead.ago}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Funnel - compact on mobile */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Conversion Funnel</h2>
              <span className="text-xs text-slate-400">This month</span>
            </div>
            <div className="p-4 space-y-2.5">
              {FUNNEL_DATA.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 w-20 flex-shrink-0 leading-tight">
                    {item.label}
                  </span>
                  <div className="flex-1 h-5 bg-slate-100 rounded-md overflow-hidden">
                    <div
                      className="h-full rounded-md flex items-center pl-2"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    >
                      <span className="text-[10px] font-bold text-white">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Performance strip */}
          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: 'linear-gradient(160deg, #0f1729 0%, #1e3a8a 100%)' }}
          >
            <div>
              <div className="text-xs font-semibold text-white/60 mb-0.5">AI Performance</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-white">94%</span>
                <span className="text-xs text-white/50">handled without agent</span>
              </div>
            </div>
            <Link
              to="/analytics"
              className="ml-auto px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-semibold text-white"
            >
              Analytics
            </Link>
          </div>
        </div>
      )}

      {/* ===== MOBILE: Activity Tab ===== */}
      {activeTab === 'activity' && (
        <div className="md:hidden pt-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
            </div>
            {ACTIVITY.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 leading-snug">{item.text}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== MOBILE: Tours Tab ===== */}
      {activeTab === 'tours' && (
        <div className="md:hidden pt-4 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Today's Tours</h2>
              <Link to="/tours" className="text-xs font-semibold text-brand-600 flex items-center gap-0.5">
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            {activeTours.map((tour) => (
              <div key={tour.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg flex-shrink-0 whitespace-nowrap">
                  {tour.time}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate leading-tight">{tour.property}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={9} className="text-slate-400 flex-shrink-0" />
                    <span className="text-[11px] text-slate-400 truncate">{tour.address}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{tour.lead}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${TOUR_STATUS_COLORS[tour.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {tour.status}
                </span>
              </div>
            ))}
          </div>

          {/* Agent leaderboard on tours tab for mobile */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Leaderboard</h2>
              <span className="text-xs text-slate-400">This month</span>
            </div>
            <div className="px-4 py-3">
              {AGENT_LEADERBOARD.map((agent) => (
                <div key={agent.rank} className="flex items-center gap-2.5 py-2.5 border-b border-slate-50 last:border-0">
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
                    <div className="text-xs font-semibold text-slate-700 truncate">{agent.name}</div>
                    <div className="text-[10px] text-slate-400">{agent.deals} deals</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold text-slate-900">{agent.conversion}</div>
                    {agent.delta && <div className="text-[10px] text-emerald-600">{agent.delta}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== DESKTOP LAYOUT (hidden on mobile) ===== */}
      <div className="hidden md:block space-y-5">

        {/* Recent Leads + Funnel/Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent Leads Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Recent Leads</h2>
              <Link to="/leads" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
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
                    <tr key={lead.phone} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: lead.avatarColor }}>
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
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${lead.type === 'Buy' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
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
                    <span className="text-xs font-semibold text-slate-500 w-24 flex-shrink-0 leading-tight">{item.label}</span>
                    <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden">
                      <div className="h-full rounded-md flex items-center pl-2.5" style={{ width: `${item.pct}%`, backgroundColor: item.color }}>
                        <span className="text-xs font-bold text-white">{item.count}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-8 text-right flex-shrink-0">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl p-5 text-white" style={{ background: 'linear-gradient(160deg, #0f1729 0%, #1e3a8a 100%)' }}>
              <h2 className="text-sm font-bold">Quick Actions</h2>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Streamline your workflow</p>
              <div className="mt-3.5 space-y-1.5">
                {[
                  { label: 'View Unassigned Leads', to: '/leads' },
                  { label: 'Add New Listing', to: '/listings' },
                  { label: "View Today's Tours", to: '/tours' },
                  { label: 'View Analytics Report', to: '/analytics' },
                ].map((action) => (
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
              <Link to="/tours" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">View All</Link>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {activeTours.map((tour) => (
                <div key={tour.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <span className="inline-block text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md mb-2">{tour.time}</span>
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
                <div key={agent.rank} className="flex items-center gap-2.5 py-2.5 border-b border-slate-100 last:border-0">
                  <span className={`text-sm font-extrabold w-5 text-center flex-shrink-0 ${rankColor(agent.rank)}`}>{agent.rank}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: agent.color }}>
                    {agent.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-700 leading-tight">{agent.name}</div>
                    <div className="text-xs text-slate-400">{agent.deals} deals closed</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold text-slate-900">
                      {agent.conversion}
                      {agent.delta && <span className="text-emerald-600 font-semibold ml-1">{agent.delta}</span>}
                    </div>
                    <div className="text-xs text-slate-400">conversion</div>
                  </div>
                </div>
              ))}
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

    </div>
  );
}
