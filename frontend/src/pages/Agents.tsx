import { useState, useEffect, useRef } from 'react';
import {
  UserPlus, Filter, Users, UserCheck, Clock, TrendingUp,
  X, Mail, Phone, Briefcase, ChevronLeft, ChevronRight,
  Loader2, Search,
} from 'lucide-react';
import { getAgents, createAgent, deleteAgent } from '../api';
import { toast } from '../utils/toast';

// ---- Types ----

type Agent = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  specialization?: string;
  specialties?: string[];
  territories?: string[];
  priority?: number;
  status?: AgentStatus;
  role?: string;
};

type AgentStatus = 'available' | 'on_break' | 'offline';

// ---- Mock Data ----

const MOCK_AGENTS: Agent[] = [
  {
    id: 1,
    name: 'Michel Boutros',
    role: 'Senior Agent',
    specialization: 'Luxury Properties',
    email: 'michel.b@wakeeli.app',
    phone: '+961 3 456 789',
    status: 'available',
    specialties: ['Luxury Properties'],
    territories: [],
    priority: 1,
  },
  {
    id: 2,
    name: 'Joelle Rizk',
    role: 'Agent',
    specialization: 'Residential Rentals',
    email: 'joelle.r@wakeeli.app',
    phone: '+961 70 123 456',
    status: 'available',
    specialties: ['Residential Rentals'],
    territories: [],
    priority: 1,
  },
  {
    id: 3,
    name: 'Elie Khoury',
    role: 'Senior Agent',
    specialization: 'Commercial',
    email: 'elie.k@wakeeli.app',
    phone: '+961 71 789 012',
    status: 'available',
    specialties: ['Commercial'],
    territories: [],
    priority: 1,
  },
  {
    id: 4,
    name: 'Roula Bou Jawde',
    role: 'Agent',
    specialization: 'Mountain Properties',
    email: 'roula.bj@wakeeli.app',
    phone: '+961 76 345 678',
    status: 'on_break',
    specialties: ['Mountain Properties'],
    territories: [],
    priority: 1,
  },
  {
    id: 5,
    name: 'Karim Haddad',
    role: 'Agent',
    specialization: 'Sea View Apartments',
    email: 'karim.h@wakeeli.app',
    phone: '+961 3 567 890',
    status: 'available',
    specialties: ['Sea View Apartments'],
    territories: [],
    priority: 1,
  },
];

// ---- Helpers ----

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Deterministic mock performance data seeded by agent id */
function mockPerf(id: number) {
  const s = id * 17;
  return {
    role: s % 3 === 0 ? 'Senior Agent' : 'Agent',
    status: 'available' as AgentStatus,
    totalLeads: 40 + (s % 60),
    liveLoad: 3 + (s % 8),
    conversionRate: 25 + (s % 30),
    avgResponse: `${4 + (s % 8)}m ${10 + (s % 50)}s`,
    activeLeads: 5 + (s % 10),
    toursCompleted: 12 + (s % 20),
    dealsClosed: 3 + (s % 8),
    satisfaction: 87 + (s % 12),
  };
}

const MOCK_ASSIGNMENT_POOL = [
  ['Ahmad Khalil', 'Rania Haddad', 'Tony Gemayel', 'Sara Khoury'],
  ['Nadia Bassil', 'Karl Abi Nader', 'Maya Frem', 'Jad Harb'],
  ['Lea Tanous', 'Pierre Karam', 'Nour Saad', 'Elias Rahme'],
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SLOTS = ['Morning', 'Afternoon'];

const STATUS_COLORS: Record<AgentStatus, string> = {
  available: 'bg-emerald-100 text-emerald-800',
  on_break: 'bg-amber-100 text-amber-800',
  offline: 'bg-slate-100 text-slate-600',
};

const STATUS_LABELS: Record<AgentStatus, string> = {
  available: 'Available',
  on_break: 'On Break',
  offline: 'Offline',
};

const PAGE_SIZE = 10;

// ---- Agent Detail Drawer ----

function AgentDrawer({
  agent,
  onClose,
  onDelete,
}: {
  agent: Agent;
  onClose: () => void;
  onDelete: (id: number) => void;
}) {
  const perf = mockPerf(agent.id);
  const agentStatus: AgentStatus = agent.status ?? perf.status;
  const agentRole = agent.role ?? perf.role;
  const initials = getInitials(agent.name);
  const assignments = MOCK_ASSIGNMENT_POOL[agent.id % MOCK_ASSIGNMENT_POOL.length];

  const assignmentStatuses = ['New', 'Touring', 'Negotiating', 'New'];
  const assignmentColors = [
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-purple-100 text-purple-700',
    'bg-blue-100 text-blue-700',
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-[500px] max-w-full bg-white shadow-xl z-50 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{agent.name}</h2>
              <p className="text-sm text-slate-500">{agentRole}</p>
              <span
                className={`inline-flex mt-1 px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[agentStatus]}`}
              >
                {STATUS_LABELS[agentStatus]}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 mt-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-7">
          {/* Contact Info */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Contact Info
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail size={15} className="text-slate-400 flex-shrink-0" />
                {agent.email || 'No email on file'}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone size={15} className="text-slate-400 flex-shrink-0" />
                {agent.phone || 'No phone on file'}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Briefcase size={15} className="text-slate-400 flex-shrink-0" />
                {agent.specialization ||
                  (agent.specialties && agent.specialties.length > 0
                    ? agent.specialties.join(', ')
                    : 'General')}
              </div>
            </div>
          </section>

          {/* Performance Summary */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Performance Summary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Active Leads', value: String(perf.activeLeads) },
                { label: 'Tours Completed', value: String(perf.toursCompleted) },
                { label: 'Deals Closed', value: String(perf.dealsClosed) },
                { label: 'Satisfaction Rate', value: `${perf.satisfaction}%` },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-slate-50 rounded-lg p-3 border border-slate-100"
                >
                  <p className="text-xs text-slate-500">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Current Assignments */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Current Assignments
            </h3>
            <div className="space-y-2">
              {assignments.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="text-sm text-slate-700">{name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${assignmentColors[i % assignmentColors.length]}`}
                  >
                    {assignmentStatuses[i % assignmentStatuses.length]}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Schedule */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Schedule &amp; Availability
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center">
                <thead>
                  <tr>
                    <th className="py-1 pr-3 text-left text-slate-400 font-normal w-20"></th>
                    {DAYS.map((d) => (
                      <th key={d} className="py-1 px-1 text-slate-500 font-medium">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SLOTS.map((slot, si) => (
                    <tr key={slot}>
                      <td className="py-1 pr-3 text-left text-slate-400 whitespace-nowrap">
                        {slot}
                      </td>
                      {DAYS.map((d, di) => {
                        const on = (agent.id + si + di) % 4 !== 0;
                        return (
                          <td key={d} className="py-1 px-0.5">
                            <span
                              className={`inline-block w-full py-1 rounded text-xs font-medium ${
                                on
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {on ? 'On' : 'Off'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0">
          <button className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">
            Edit Agent
          </button>
          <button
            onClick={() => {
              onDelete(agent.id);
              onClose();
            }}
            className="flex-1 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
          >
            Remove Agent
          </button>
        </div>
      </div>
    </>
  );
}

// ---- Add Agent Modal ----

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  role: 'Agent',
  specialization: '',
};

function AddAgentModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: typeof EMPTY_FORM) => Promise<void>;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">Add Agent</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Role
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option>Agent</option>
                <option>Senior Agent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Specialization
              </label>
              <input
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. Residential, Luxury, Commercial"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Agent'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ---- Main Page ----

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState<AgentStatus>('available');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [nameSearch, setNameSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = () => {
    setLoading(true);
    getAgents()
      .then((res) => {
        const data: any[] = Array.isArray(res.data) ? res.data : [];
        if (data.length > 0) {
          const mapped: Agent[] = data.map((a: any) => ({
            id: a.id,
            name: a.name,
            email: a.email || undefined,
            phone: a.phone || undefined,
            specialization: a.specialties?.[0] || undefined,
            specialties: a.specialties || [],
            territories: a.territories || [],
            priority: a.priority ?? 1,
            status: a.is_active ? 'available' : 'offline',
            role: 'Agent',
          }));
          setAgents(mapped);
        } else {
          setAgents(MOCK_AGENTS);
        }
      })
      .catch(() => {
        toast.error('Failed to load agents.');
        setAgents(MOCK_AGENTS);
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = (id: number) => {
    if (!confirm('Remove this agent?')) return;
    // Optimistically remove from UI
    setAgents((prev) => prev.filter((a) => a.id !== id));
    setSelectedAgent(null);
    deleteAgent(id)
      .then(() => toast.success('Agent removed.'))
      .catch(() => {
        toast.error('Failed to remove agent. Reloading.');
        loadAgents();
      });
  };

  const handleAddAgent = async (data: typeof EMPTY_FORM) => {
    try {
      const res = await createAgent({
        name: data.name,
        email: data.email || null,
        phone: data.phone || '',
        specialties: data.specialization ? [data.specialization] : [],
        territories: [],
        priority: 1,
        is_active: true,
      });
      const a = res.data;
      setAgents((prev) => [
        ...prev,
        {
          id: a.id,
          name: a.name,
          email: a.email || undefined,
          phone: a.phone || undefined,
          specialization: a.specialties?.[0] || data.specialization || undefined,
          specialties: a.specialties || [],
          territories: a.territories || [],
          priority: a.priority ?? 1,
          status: 'available' as AgentStatus,
          role: data.role,
        },
      ]);
      toast.success('Agent added.');
    } catch {
      toast.error('Failed to add agent.');
    }
    setShowAddModal(false);
  };

  const tabCounts: Record<AgentStatus, number> = {
    available: agents.filter((a) => (a.status ?? 'available') === 'available').length,
    on_break: agents.filter((a) => a.status === 'on_break').length,
    offline: agents.filter((a) => a.status === 'offline').length,
  };

  const filteredAgents = agents.filter((a) => (a.status ?? 'available') === statusTab);
  const totalPages = Math.max(1, Math.ceil(filteredAgents.length / PAGE_SIZE));
  const paged = filteredAgents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const availabilityPct =
    agents.length > 0 ? Math.round((tabCounts.available / agents.length) * 100) : 0;

  const kpiCards = [
    {
      label: 'Total Agents',
      value: loading ? '...' : String(agents.length),
      sub: '+2 this month',
      icon: Users,
      color: 'text-brand-600',
    },
    {
      label: 'Active Now',
      value: loading ? '...' : String(agents.length),
      sub: `${availabilityPct}% availability`,
      icon: UserCheck,
      color: 'text-emerald-600',
    },
    {
      label: 'Avg Response Time',
      value: '8m',
      sub: '-2m improvement',
      icon: Clock,
      color: 'text-blue-600',
    },
    {
      label: 'Avg Conversion',
      value: '34%',
      sub: '+5% this quarter',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
  ];

  const tabLabels: Record<AgentStatus, string> = {
    available: 'Available',
    on_break: 'On Break',
    offline: 'Offline',
  };

  const showStart = filteredAgents.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showEnd = Math.min(page * PAGE_SIZE, filteredAgents.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agents</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage your team, track performance, and optimize lead assignments
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <UserPlus size={16} />
            Add Agent
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

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
                  <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
                </div>
                <Icon className={card.color} size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {(['available', 'on_break', 'offline'] as AgentStatus[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setStatusTab(tab);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusTab === tab
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tabLabels[tab]} ({tabCounts[tab]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          </div>
        ) : paged.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No agents with this status.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    <th className="px-6 py-3">Agent</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Total Assigned Leads</th>
                    <th className="px-6 py-3">Live Load: Today</th>
                    <th className="px-6 py-3">Conversion Rate</th>
                    <th className="px-6 py-3">Avg Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.map((agent) => {
                    const perf = mockPerf(agent.id);
                    const initials = getInitials(agent.name);
                    const agentStatus: AgentStatus = agent.status ?? 'available';
                    const agentRole = agent.role ?? perf.role;
                    return (
                      <tr
                        key={agent.id}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{agent.name}</p>
                              <p className="text-xs text-slate-500">
                                {agent.email || 'No email'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{agentRole}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[agentStatus]}`}
                          >
                            {STATUS_LABELS[agentStatus]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">{perf.totalLeads}</td>
                        <td className="px-6 py-4 text-slate-700">{perf.liveLoad}</td>
                        <td className="px-6 py-4 text-slate-700">{perf.conversionRate}%</td>
                        <td className="px-6 py-4 text-slate-700">{perf.avgResponse}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span>
                Showing {showStart} to {showEnd} of {filteredAgents.length} agents
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1.5 rounded border text-sm font-medium transition-colors ${
                      page === p
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Agent Detail Drawer */}
      {selectedAgent && (
        <AgentDrawer
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onDelete={handleDelete}
        />
      )}

      {/* Add Agent Modal */}
      {showAddModal && (
        <AddAgentModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddAgent}
        />
      )}
    </div>
  );
}
