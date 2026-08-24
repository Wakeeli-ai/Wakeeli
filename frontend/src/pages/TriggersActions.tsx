import { useState } from 'react';
import { Zap, Plus, X, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { toast } from '../utils/toast';

// Types

type RuleStatus = 'active' | 'inactive';

type TriggerType =
  | 'budget_under'
  | 'budget_over'
  | 'no_reply'
  | 'keyword_match'
  | 'area_preference'
  | 'property_type'
  | 'asks_payment';

type ActionType =
  | 'route_listings'
  | 'send_followup'
  | 'send_document'
  | 'assign_agent'
  | 'send_message'
  | 'tag_lead';

type Rule = {
  id: number;
  name: string;
  triggerType: TriggerType;
  triggerLabel: string;
  actionType: ActionType;
  actionLabel: string;
  status: RuleStatus;
  lastFired: string | null;
  firedCount: number;
};

// Mock data

const MOCK_RULES: Rule[] = [
  {
    id: 1,
    name: 'Affordable listings route',
    triggerType: 'budget_under',
    triggerLabel: 'Budget under $200,000',
    actionType: 'route_listings',
    actionLabel: 'Send affordable listings',
    status: 'active',
    lastFired: '2026-04-01T08:12:00.000Z',
    firedCount: 47,
  },
  {
    id: 2,
    name: '48h no-reply follow-up',
    triggerType: 'no_reply',
    triggerLabel: 'No reply in 48 hours',
    actionType: 'send_followup',
    actionLabel: 'Send follow-up message',
    status: 'active',
    lastFired: '2026-04-01T06:00:00.000Z',
    firedCount: 23,
  },
  {
    id: 3,
    name: '3BR listings push',
    triggerType: 'keyword_match',
    triggerLabel: 'Mentions 3BR',
    actionType: 'route_listings',
    actionLabel: 'Send 3BR listings',
    status: 'active',
    lastFired: '2026-04-01T09:30:00.000Z',
    firedCount: 61,
  },
  {
    id: 4,
    name: 'Payment options info',
    triggerType: 'asks_payment',
    triggerLabel: 'Asks about payment plan',
    actionType: 'send_document',
    actionLabel: 'Send payment options PDF',
    status: 'active',
    lastFired: '2026-03-31T14:22:00.000Z',
    firedCount: 18,
  },
  {
    id: 5,
    name: 'Luxury lead escalation',
    triggerType: 'budget_over',
    triggerLabel: 'Budget over $500,000',
    actionType: 'assign_agent',
    actionLabel: 'Assign to senior agent',
    status: 'active',
    lastFired: '2026-04-01T07:45:00.000Z',
    firedCount: 9,
  },
  {
    id: 6,
    name: 'Metn area route',
    triggerType: 'area_preference',
    triggerLabel: 'Mentions Metn or Kesrouan',
    actionType: 'route_listings',
    actionLabel: 'Send Metn & Kesrouan listings',
    status: 'active',
    lastFired: '2026-04-01T09:00:00.000Z',
    firedCount: 34,
  },
  {
    id: 7,
    name: 'Villa inquiry tag',
    triggerType: 'property_type',
    triggerLabel: 'Asks about villas',
    actionType: 'tag_lead',
    actionLabel: 'Tag lead as Villa Seeker',
    status: 'inactive',
    lastFired: '2026-03-28T11:00:00.000Z',
    firedCount: 12,
  },
];

// Options

const TRIGGER_OPTIONS: { value: TriggerType; label: string }[] = [
  { value: 'budget_under', label: 'Budget under threshold' },
  { value: 'budget_over', label: 'Budget over threshold' },
  { value: 'no_reply', label: 'No reply after X hours' },
  { value: 'keyword_match', label: 'Keyword in message' },
  { value: 'area_preference', label: 'Area preference mentioned' },
  { value: 'property_type', label: 'Property type mentioned' },
  { value: 'asks_payment', label: 'Asks about payment' },
];

const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'route_listings', label: 'Send matching listings' },
  { value: 'send_followup', label: 'Send follow-up message' },
  { value: 'send_document', label: 'Send a document' },
  { value: 'assign_agent', label: 'Assign to an agent' },
  { value: 'send_message', label: 'Send custom message' },
  { value: 'tag_lead', label: 'Tag lead' },
];

// Badge colors

const TRIGGER_BADGE: Record<TriggerType, string> = {
  budget_under: 'bg-blue-50 text-blue-700',
  budget_over: 'bg-violet-50 text-violet-700',
  no_reply: 'bg-amber-50 text-amber-700',
  keyword_match: 'bg-purple-50 text-purple-700',
  area_preference: 'bg-emerald-50 text-emerald-700',
  property_type: 'bg-cyan-50 text-cyan-700',
  asks_payment: 'bg-orange-50 text-orange-700',
};

const ACTION_BADGE: Record<ActionType, string> = {
  route_listings: 'bg-blue-50 text-blue-700',
  send_followup: 'bg-amber-50 text-amber-700',
  send_document: 'bg-slate-100 text-slate-600',
  assign_agent: 'bg-emerald-50 text-emerald-700',
  send_message: 'bg-purple-50 text-purple-700',
  tag_lead: 'bg-pink-50 text-pink-700',
};

// Helpers

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function StatusBadge({ status }: { status: RuleStatus }) {
  return status === 'active' ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Inactive
    </span>
  );
}

// Trigger condition sub-field

function TriggerConditionField({ triggerType }: { triggerType: TriggerType }) {
  const inputCls =
    'w-full px-3 h-11 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition';

  if (triggerType === 'budget_under' || triggerType === 'budget_over') {
    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">$</span>
        <input
          type="number"
          defaultValue={triggerType === 'budget_under' ? 200000 : 500000}
          placeholder="e.g. 300000"
          className="w-full pl-7 pr-3 h-11 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
        />
      </div>
    );
  }

  if (triggerType === 'no_reply') {
    return (
      <select defaultValue="48" className={inputCls + ' cursor-pointer'}>
        <option value="24">24 hours</option>
        <option value="48">48 hours</option>
        <option value="72">72 hours</option>
      </select>
    );
  }

  if (triggerType === 'keyword_match') {
    return (
      <input
        type="text"
        placeholder='e.g. "3BR, three bedroom, tlat ghorfet"'
        className={inputCls}
      />
    );
  }

  if (triggerType === 'area_preference') {
    return (
      <select className={inputCls + ' cursor-pointer'}>
        <option>Metn + Kesrouan</option>
        <option>Beirut only</option>
        <option>South of Beirut</option>
        <option>North Lebanon</option>
        <option>Mountain areas (Broummana, Beit Mery, Aley)</option>
      </select>
    );
  }

  if (triggerType === 'property_type') {
    return (
      <select className={inputCls + ' cursor-pointer'}>
        <option>Villa</option>
        <option>Apartment</option>
        <option>Duplex</option>
        <option>Studio</option>
        <option>Commercial</option>
        <option>Chalet</option>
      </select>
    );
  }

  // asks_payment
  return (
    <p className="text-xs text-slate-400 py-2.5 bg-slate-50 rounded-lg px-3 border border-slate-200">
      Triggers when the lead mentions payment plan, bank loan, financing, or similar terms.
    </p>
  );
}

// Add Rule Modal

type NewRuleForm = {
  name: string;
  triggerType: TriggerType;
  actionType: ActionType;
};

const EMPTY_FORM: NewRuleForm = {
  name: '',
  triggerType: 'budget_under',
  actionType: 'route_listings',
};

function AddRuleModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: NewRuleForm) => void;
}) {
  const [form, setForm] = useState<NewRuleForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    onSave(form);
  };

  const inputCls =
    'w-full px-3 h-11 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition';
  const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5';

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 border border-slate-200">

          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                <Zap size={15} className="text-brand-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">New Rule</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className={labelCls}>Rule Name *</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder='e.g. "Studio leads route"'
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Trigger (When...)</label>
              <select
                value={form.triggerType}
                onChange={(e) => setForm({ ...form, triggerType: e.target.value as TriggerType })}
                className={inputCls + ' cursor-pointer'}
              >
                {TRIGGER_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Condition detail</label>
              <TriggerConditionField triggerType={form.triggerType} />
            </div>

            <div>
              <label className={labelCls}>Action (Then...)</label>
              <select
                value={form.actionType}
                onChange={(e) => setForm({ ...form, actionType: e.target.value as ActionType })}
                className={inputCls + ' cursor-pointer'}
              >
                {ACTION_OPTIONS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            {/* Footer */}
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
                {saving ? 'Creating...' : 'Create Rule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// Main component

export default function TriggersActions() {
  const [rules, setRules] = useState<Rule[]>(MOCK_RULES);
  const [showAddModal, setShowAddModal] = useState(false);

  const activeCount = rules.filter((r) => r.status === 'active').length;
  const totalFired = rules.reduce((acc, r) => acc + r.firedCount, 0);

  const todayFired = rules.filter((r) => {
    if (!r.lastFired) return false;
    const d = new Date(r.lastFired);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }).length;

  const toggleRule = (id: number) => {
    const rule = rules.find((r) => r.id === id);
    setRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r
      )
    );
    if (rule) {
      toast.success(rule.status === 'active' ? 'Rule deactivated.' : 'Rule activated.');
    }
  };

  const deleteRule = (id: number) => {
    if (!confirm('Delete this rule?')) return;
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.success('Rule deleted.');
  };

  const handleAddRule = (data: NewRuleForm) => {
    const triggerOpt = TRIGGER_OPTIONS.find((t) => t.value === data.triggerType);
    const actionOpt = ACTION_OPTIONS.find((a) => a.value === data.actionType);
    const newRule: Rule = {
      id: Date.now(),
      name: data.name,
      triggerType: data.triggerType,
      triggerLabel: triggerOpt?.label ?? data.triggerType,
      actionType: data.actionType,
      actionLabel: actionOpt?.label ?? data.actionType,
      status: 'active',
      lastFired: null,
      firedCount: 0,
    };
    setRules((prev) => [newRule, ...prev]);
    setShowAddModal(false);
    toast.success('Rule created.');
  };

  return (
    <div className="space-y-5 pb-24 md:pb-5">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Triggers & Actions</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            Automate AI behavior with condition-based rules
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={15} />
          Add Rule
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Rules', value: rules.length, color: 'text-slate-900' },
          { label: 'Active', value: activeCount, color: 'text-emerald-600' },
          { label: 'Fired Today', value: todayFired, color: 'text-brand-600' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 md:p-4 text-center"
          >
            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Rules table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">All Rules</h2>
          <span className="text-xs text-slate-400">{totalFired.toLocaleString()} total fires</span>
        </div>

        {rules.length === 0 ? (
          <div className="py-16 text-center">
            <Zap className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">No rules yet</p>
            <p className="text-xs text-slate-400 mt-1">Add your first rule to automate AI behavior</p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              <Plus size={14} />
              Add First Rule
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-slate-200">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rule Name</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Trigger Condition</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Fired</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fires</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule, i) => {
                    const rowBg = i % 2 === 1 ? 'bg-[#f8fafc]/60' : 'bg-white';
                    return (
                      <tr
                        key={rule.id}
                        className={`${rowBg} border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors`}
                      >
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-slate-900">{rule.name}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${TRIGGER_BADGE[rule.triggerType]}`}>
                            {rule.triggerLabel}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${ACTION_BADGE[rule.actionType]}`}>
                            {rule.actionLabel}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={rule.status} />
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-400">
                          {timeAgo(rule.lastFired)}
                        </td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">
                          {rule.firedCount}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => toggleRule(rule.id)}
                              title={rule.status === 'active' ? 'Deactivate' : 'Activate'}
                              className="transition-colors"
                            >
                              {rule.status === 'active'
                                ? <ToggleRight size={22} className="text-emerald-500 hover:text-emerald-600" />
                                : <ToggleLeft size={22} className="text-slate-300 hover:text-slate-400" />
                              }
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRule(rule.id)}
                              title="Delete rule"
                              className="p-1 text-slate-300 hover:text-red-500 transition-colors rounded"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="md:hidden divide-y divide-slate-100">
              {rules.map((rule) => (
                <div key={rule.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-slate-900 flex-1 min-w-0 leading-snug">
                      {rule.name}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleRule(rule.id)}
                      >
                        {rule.status === 'active'
                          ? <ToggleRight size={22} className="text-emerald-500" />
                          : <ToggleLeft size={22} className="text-slate-300" />
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRule(rule.id)}
                        className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TRIGGER_BADGE[rule.triggerType]}`}>
                      IF: {rule.triggerLabel}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ACTION_BADGE[rule.actionType]}`}>
                      THEN: {rule.actionLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={rule.status} />
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock size={10} />
                      {timeAgo(rule.lastFired)}
                    </span>
                    <span className="text-[11px] text-slate-400">{rule.firedCount} fires</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mobile add button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-20">
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="w-full flex items-center justify-center gap-2 h-12 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Rule
        </button>
      </div>

      {showAddModal && (
        <AddRuleModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddRule}
        />
      )}

    </div>
  );
}
