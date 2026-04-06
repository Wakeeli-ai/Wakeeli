import { useState, useEffect, useRef } from 'react';
import {
  UserPlus, Users, UserCheck, Clock, TrendingUp,
  X, Mail, Phone, Briefcase, ChevronLeft, ChevronRight,
  Loader2, Search, Filter,
} from 'lucide-react';
import { getAgents, createAgent, deleteAgent } from '../api';
import { toast } from '../utils/toast';

// Types

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

// Mock data

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
    role: 'Senior Agent',
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
    role: 'Agent',
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

// Helpers

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  { bg: '#dbeafe', text: '#2563eb' },
  { bg: '#ede9fe', text: '#7c3aed' },
  { bg: '#d1fae5', text: '#059669' },
  { bg: '#fce7f3', text: '#db2777' },
  { bg: '#fed7aa', text: '#ea580c' },
];

function getAvatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function mockPerf(id: number) {
  const s = id * 17;
  return {
    totalLeads: 40 + (s % 60),
    liveLoad: 3 + (s % 8),
    conversionRate: 25 + (s % 30),
    avgResponse: `${4 + (s % 8)}m ${10 + (s % 50)}s`,
    activeLeads: 5 + (s % 10),
    toursCompleted: 12 + (s % 20),
    dealsClosed: 3 + (s % 8),
    satisfaction: 87 + (s % 12),
    convPct: Math.min(95, 25 + (s % 30)),
  };
}

const MOCK_ASSIGNMENT_POOL = [
  ['Ahmad Khalil', 'Rania Haddad', 'Tony Gemayel', 'Sara Khoury'],
  ['Nadia Bassil', 'Karl Abi Nader', 'Maya Frem', 'Jad Harb'],
  ['Lea Tanous', 'Pierre Karam', 'Nour Saad', 'Elias Rahme'],
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SLOTS = ['Morning', 'Afternoon'];

const STATUS_CONFIG: Record<AgentStatus, { bg: string; text: string; dot: string; label: string }> = {
  available: { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a', label: 'Available' },
  on_break: { bg: '#fffbeb', text: '#b45309', dot: '#f59e0b', label: 'On Break' },
  offline: { bg: '#f8fafc', text: '#475569', dot: '#94a3b8', label: 'Offline' },
};

const PAGE_SIZE = 10;

// Agent Detail Drawer

function AgentDrawer({
  agent,
  onClose,
  onDelete,
  onEdit,
}: {
  agent: Agent;
  onClose: () => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, updated: Partial<Agent>) => void;
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const perf = mockPerf(agent.id);
  const agentStatus: AgentStatus = agent.status ?? 'available';
  const agentRole = agent.role ?? 'Agent';
  const initials = getInitials(agent.name);
  const avatarColor = getAvatarColor(agent.id);
  const assignments = MOCK_ASSIGNMENT_POOL[agent.id % MOCK_ASSIGNMENT_POOL.length];
  const statusCfg = STATUS_CONFIG[agentStatus];

  const assignmentStatuses = ['New', 'Touring', 'Negotiating', 'New'];
  const assignmentColors = [
    { bg: '#eff6ff', text: '#2563eb' },
    { bg: '#f0fdf4', text: '#16a34a' },
    { bg: '#faf5ff', text: '#7c3aed' },
    { bg: '#eff6ff', text: '#2563eb' },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={!showEditModal ? onClose : undefined} />
      <div className="fixed right-0 top-0 h-full w-[480px] max-w-full bg-white shadow-2xl z-50 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{ background: avatarColor.bg, color: avatarColor.text }}
            >
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{agent.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{agentRole}</p>
              <span
                className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: statusCfg.bg, color: statusCfg.text }}
              >
                <span className="w-[5px] h-[5px] rounded-full" style={{ background: statusCfg.dot }} />
                {statusCfg.label}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-6">
          {/* Stats overview */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Active Leads', value: String(perf.activeLeads), color: '#2563eb' },
              { label: 'Tours Done', value: String(perf.toursCompleted), color: '#7c3aed' },
              { label: 'Deals Closed', value: String(perf.dealsClosed), color: '#16a34a' },
              { label: 'Satisfaction', value: `${perf.satisfaction}%`, color: '#f59e0b' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-[#f8fafc] rounded-xl p-4 border border-slate-100"
              >
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{stat.label}</p>
                <p className="text-xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Conversion rate bar */}
          <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Conversion Rate</span>
              <span className="text-sm font-bold text-slate-900">{perf.conversionRate}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${perf.convPct}%`, background: 'linear-gradient(90deg, #2563eb, #7c3aed)' }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Avg response: {perf.avgResponse}</p>
          </div>

          {/* Contact info */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contact</h3>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Mail size={14} className="text-slate-400" />
                </div>
                <span className="text-slate-700">{agent.email || 'No email on file'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Phone size={14} className="text-slate-400" />
                </div>
                <span className="text-slate-700">{agent.phone || 'No phone on file'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Briefcase size={14} className="text-slate-400" />
                </div>
                <span className="text-slate-700">
                  {agent.specialization ||
                    (agent.specialties && agent.specialties.length > 0
                      ? agent.specialties.join(', ')
                      : 'General')}
                </span>
              </div>
            </div>
          </section>

          {/* Current assignments */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Current Assignments</h3>
            <div className="space-y-2">
              {assignments.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#f8fafc] border border-slate-100"
                >
                  <span className="text-sm font-medium text-slate-700">{name}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: assignmentColors[i % assignmentColors.length].bg,
                      color: assignmentColors[i % assignmentColors.length].text,
                    }}
                  >
                    {assignmentStatuses[i % assignmentStatuses.length]}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Schedule */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Schedule</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center">
                <thead>
                  <tr>
                    <th className="py-1 pr-3 text-left text-slate-400 font-normal w-20"></th>
                    {DAYS.map((d) => (
                      <th key={d} className="py-1 px-1 text-slate-500 font-semibold">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SLOTS.map((slot, si) => (
                    <tr key={slot}>
                      <td className="py-1 pr-3 text-left text-slate-400 whitespace-nowrap text-xs">{slot}</td>
                      {DAYS.map((d, di) => {
                        const on = (agent.id + si + di) % 4 !== 0;
                        return (
                          <td key={d} className="py-1 px-0.5">
                            <span
                              className="inline-flex w-full py-1 rounded-lg text-xs font-semibold items-center justify-center"
                              style={{
                                background: on ? '#f0fdf4' : '#f8fafc',
                                color: on ? '#16a34a' : '#94a3b8',
                              }}
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 flex-shrink-0 bg-[#f8fafc]/50">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Edit Agent
          </button>
          <button
            onClick={() => { onDelete(agent.id); onClose(); }}
            className="flex-1 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors"
          >
            Remove Agent
          </button>
        </div>
      </div>

      {showEditModal && (
        <EditAgentModal
          agent={agent}
          onClose={() => setShowEditModal(false)}
          onSave={(data) => {
            onEdit(agent.id, {
              name: data.name,
              email: data.email || undefined,
              phone: data.phone || undefined,
              role: data.role,
              specialization: data.specialization || undefined,
              status: data.status,
            });
            setShowEditModal(false);
          }}
        />
      )}
    </>
  );
}

// Add Agent Modal

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
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                <UserPlus size={15} className="text-brand-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Add Agent</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {[
              { key: 'name', label: 'Full Name', placeholder: 'e.g. Joelle Rizk', required: true, type: 'text' },
              { key: 'email', label: 'Email', placeholder: 'agent@wakeeli.app', required: false, type: 'email' },
              { key: 'phone', label: 'Phone', placeholder: '+961 70 000 000', required: false, type: 'text' },
              { key: 'specialization', label: 'Specialization', placeholder: 'e.g. Residential, Luxury, Commercial', required: false, type: 'text' },
            ].map(({ key, label, placeholder, required, type }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {label}{required && ' *'}
                </label>
                <input
                  required={required}
                  type={type}
                  className="w-full px-3 h-11 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                  placeholder={placeholder}
                  value={form[key as keyof typeof EMPTY_FORM]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
              <select
                className="w-full px-3 h-11 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option>Agent</option>
                <option>Senior Agent</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2.5 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Add Agent'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// Edit Agent Modal

type EditAgentForm = {
  name: string;
  email: string;
  phone: string;
  role: string;
  specialization: string;
  status: AgentStatus;
};

function EditAgentModal({
  agent,
  onClose,
  onSave,
}: {
  agent: Agent;
  onClose: () => void;
  onSave: (data: EditAgentForm) => void;
}) {
  const [form, setForm] = useState<EditAgentForm>({
    name: agent.name,
    email: agent.email || '',
    phone: agent.phone || '',
    role: agent.role || 'Agent',
    specialization: agent.specialization || '',
    status: agent.status || 'available',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    onSave(form);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                <UserPlus size={15} className="text-brand-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Edit Agent</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', required: true },
              { key: 'email', label: 'Email', type: 'email', required: false },
              { key: 'phone', label: 'Phone', type: 'text', required: false },
              { key: 'specialization', label: 'Specialization', type: 'text', required: false },
            ].map(({ key, label, type, required }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {label}{required && ' *'}
                </label>
                <input
                  required={required}
                  type={type}
                  className="w-full px-3 h-11 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors"
                  value={form[key as keyof EditAgentForm] as string}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
              <select
                className="w-full px-3 h-11 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option>Agent</option>
                <option>Senior Agent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status</label>
              <select
                className="w-full px-3 h-11 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as AgentStatus })}
              >
                <option value="available">Available</option>
                <option value="on_break">On Break</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2.5 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// Main page

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

  const handleEditAgent = (id: number, updated: Partial<Agent>) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    setSelectedAgent((prev) => (prev && prev.id === id ? { ...prev, ...updated } : prev));
    toast.success('Agent updated.');
  };

  const handleDelete = (id: number) => {
    if (!confirm('Remove this agent?')) return;
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

  const filteredAgents = agents.filter((a) => {
    if ((a.status ?? 'available') !== statusTab) return false;
    if (nameSearch && !a.name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
    if (roleFilter && (a.role ?? '') !== roleFilter) return false;
    return true;
  });

  const hasActiveFilters = nameSearch !== '' || roleFilter !== '';
  const clearFilters = () => { setNameSearch(''); setRoleFilter(''); };

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
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      borderColor: '#2563eb',
    },
    {
      label: 'Active Now',
      value: loading ? '...' : String(tabCounts.available),
      sub: `${availabilityPct}% available`,
      icon: UserCheck,
      iconBg: '#f0fdf4',
      iconColor: '#16a34a',
      borderColor: '#16a34a',
    },
    {
      label: 'Avg Response',
      value: '8m',
      sub: '2m improvement',
      icon: Clock,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      borderColor: '#93c5fd',
    },
    {
      label: 'Avg Conversion',
      value: '34%',
      sub: '+5% this quarter',
      icon: TrendingUp,
      iconBg: '#faf5ff',
      iconColor: '#7c3aed',
      borderColor: '#7c3aed',
    },
  ];

  const showStart = filteredAgents.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showEnd = Math.min(page * PAGE_SIZE, filteredAgents.length);

  return (
    <div className="space-y-5 pb-24 md:pb-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Agents</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            Manage your team, track performance, and optimize lead assignments
          </p>
        </div>
        {/* Add Agent button: visible on desktop in header, hidden on mobile (shown at bottom) */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <UserPlus size={15} />
            Add Agent
          </button>
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className={`inline-flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium transition-colors shadow-sm ${
                hasActiveFilters
                  ? 'border-brand-400 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
              }`}
            >
              <Filter size={15} />
              Filter
              {hasActiveFilters && (
                <span className="w-4 h-4 bg-brand-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {(nameSearch ? 1 : 0) + (roleFilter ? 1 : 0)}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-30 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Filter Agents</span>
                  {hasActiveFilters && (
                    <button type="button" onClick={clearFilters} className="text-xs text-brand-600 hover:text-brand-700 font-semibold">
                      Clear all
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Search by name</label>
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={nameSearch}
                      onChange={(e) => { setNameSearch(e.target.value); setPage(1); }}
                      placeholder="e.g. Joelle"
                      className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {nameSearch && (
                      <button type="button" onClick={() => setNameSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Role</label>
                  <div className="flex gap-2 flex-wrap">
                    {['', 'Agent', 'Senior Agent'].map((r) => (
                      <button
                        key={r || 'all'}
                        type="button"
                        onClick={() => { setRoleFilter(r); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                          roleFilter === r
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {r || 'All Roles'}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="w-full py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: filter button only in header */}
        <div className="flex md:hidden gap-2 w-full">
          <div className="relative flex-1" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium transition-colors shadow-sm ${
                hasActiveFilters
                  ? 'border-brand-400 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
              }`}
            >
              <Filter size={15} />
              Filter
              {hasActiveFilters && (
                <span className="w-4 h-4 bg-brand-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {(nameSearch ? 1 : 0) + (roleFilter ? 1 : 0)}
                </span>
              )}
            </button>

            {filterOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-30 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Filter Agents</span>
                  {hasActiveFilters && (
                    <button type="button" onClick={clearFilters} className="text-xs text-brand-600 hover:text-brand-700 font-semibold">
                      Clear all
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Search by name</label>
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={nameSearch}
                      onChange={(e) => { setNameSearch(e.target.value); setPage(1); }}
                      placeholder="e.g. Joelle"
                      className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    {nameSearch && (
                      <button type="button" onClick={() => setNameSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Role</label>
                  <div className="flex gap-2 flex-wrap">
                    {['', 'Agent', 'Senior Agent'].map((r) => (
                      <button
                        key={r || 'all'}
                        type="button"
                        onClick={() => { setRoleFilter(r); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                          roleFilter === r
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {r || 'All Roles'}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="w-full py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 shadow-sm border-l-4"
              style={{ borderLeftColor: card.borderColor }}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide truncate">{card.label}</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{card.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                </div>
                <div className="rounded-lg p-1.5 md:p-2 flex-shrink-0 ml-2" style={{ background: card.iconBg }}>
                  <Icon size={16} style={{ color: card.iconColor }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        {(['available', 'on_break', 'offline'] as AgentStatus[]).map((tab) => {
          const cfg = STATUS_CONFIG[tab];
          const isActive = statusTab === tab;
          return (
            <button
              key={tab}
              onClick={() => { setStatusTab(tab); setPage(1); }}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all border shadow-sm whitespace-nowrap flex-shrink-0 min-h-[44px]"
              style={isActive
                ? { background: cfg.bg, color: cfg.text, borderColor: cfg.dot }
                : { background: '#fff', color: '#475569', borderColor: '#e2e8f0' }
              }
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ background: isActive ? cfg.dot : '#94a3b8' }}
              />
              {cfg.label}
              <span
                className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={isActive ? { background: cfg.dot, color: '#fff' } : { background: '#f1f5f9', color: '#64748b' }}
              >
                {tabCounts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Agent list / table container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
          </div>
        ) : paged.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            No agents with this status.
          </div>
        ) : (
          <>
            {/* Mobile compact list */}
            <div className="md:hidden">
              {paged.map((agent) => {
                const agentStatus: AgentStatus = agent.status ?? 'available';
                const cfg = STATUS_CONFIG[agentStatus];
                const ac = getAvatarColor(agent.id);
                const perf = mockPerf(agent.id);
                return (
                  <div
                    key={agent.id}
                    className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 min-h-[64px] cursor-pointer active:bg-slate-50 transition-colors"
                    onClick={() => setSelectedAgent(agent)}
                  >
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: ac.bg, color: ac.text }}
                    >
                      {getInitials(agent.name)}
                    </div>

                    {/* Center: name + role */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{agent.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {agent.role ?? 'Agent'}{agent.specialization ? ` · ${agent.specialization}` : ''}
                      </p>
                    </div>

                    {/* Right: status dot + active leads */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ background: cfg.dot }}
                        title={cfg.label}
                      />
                      <span className="text-xs text-slate-400 font-medium">{perf.activeLeads} leads</span>
                    </div>
                  </div>
                );
              })}

              {/* Mobile pagination */}
              <div className="px-4 py-3 flex items-center justify-between text-sm text-slate-500 border-t border-slate-100">
                <span className="text-xs">Showing {showStart}–{showEnd} of {filteredAgents.length}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-slate-200">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Agent</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Leads Assigned</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Live Load</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Conversion</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Performance</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg Response</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((agent, i) => {
                    const perf = mockPerf(agent.id);
                    const agentStatus: AgentStatus = agent.status ?? 'available';
                    const cfg = STATUS_CONFIG[agentStatus];
                    const ac = getAvatarColor(agent.id);
                    const rowBg = i % 2 === 1 ? 'bg-[#f8fafc]/60' : 'bg-white';
                    return (
                      <tr
                        key={agent.id}
                        className={`${rowBg} hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-0`}
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ background: ac.bg, color: ac.text }}
                            >
                              {getInitials(agent.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{agent.name}</p>
                              <p className="text-xs text-slate-400">{agent.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-600">
                            {agent.role ?? 'Agent'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: cfg.bg, color: cfg.text }}
                          >
                            <span className="w-[5px] h-[5px] rounded-full" style={{ background: cfg.dot }} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-700 font-medium">{perf.totalLeads}</td>
                        <td className="px-5 py-3.5 text-slate-700">{perf.liveLoad}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className="font-bold text-sm"
                            style={{ color: perf.conversionRate >= 45 ? '#16a34a' : perf.conversionRate >= 35 ? '#2563eb' : '#b45309' }}
                          >
                            {perf.conversionRate}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${perf.convPct}%`,
                                background: perf.conversionRate >= 45 ? '#16a34a' : perf.conversionRate >= 35 ? '#2563eb' : '#f59e0b',
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 text-sm">{perf.avgResponse}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Desktop pagination */}
            <div className="hidden md:flex px-5 py-3.5 border-t border-slate-100 items-center justify-between text-sm text-slate-500 bg-[#f8fafc]/50">
              <span className="text-xs text-slate-500">
                Showing {showStart} to {showEnd} of {filteredAgents.length} agents
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
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
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile: full-width Add Agent button fixed at bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-20">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full flex items-center justify-center gap-2 h-12 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <UserPlus size={16} />
          Add Agent
        </button>
      </div>

      {selectedAgent && (
        <AgentDrawer
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onDelete={handleDelete}
          onEdit={handleEditAgent}
        />
      )}

      {showAddModal && (
        <AddAgentModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddAgent}
        />
      )}
    </div>
  );
}
