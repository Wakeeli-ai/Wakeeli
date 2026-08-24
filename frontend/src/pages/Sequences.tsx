import { useState } from 'react';
import {
  Plus, X, ChevronRight, ChevronLeft, Clock, Users, Zap,
  CheckCircle2, Play, Pause,
} from 'lucide-react';

type SequenceStatus = 'active' | 'paused' | 'draft';

interface SequenceStep {
  id: number;
  day: number;
  delayLabel: string;
  message: string;
  condition: string;
}

interface Sequence {
  id: number;
  name: string;
  description: string;
  steps: SequenceStep[];
  enrolledLeads: number;
  status: SequenceStatus;
  createdAt: string;
}

const MOCK_SEQUENCES: Sequence[] = [
  {
    id: 1,
    name: 'Cold Lead Revival',
    description: 'Re-engage leads that went silent after initial contact',
    enrolledLeads: 34,
    status: 'active',
    createdAt: 'Mar 12, 2026',
    steps: [
      {
        id: 1,
        day: 0,
        delayLabel: 'Day 0 (immediately)',
        message:
          'Hi [Name]! 👋 We noticed you were interested in properties recently. We have some exciting new listings that match your requirements. Would you like to take a look?',
        condition: 'Send immediately after enrollment',
      },
      {
        id: 2,
        day: 2,
        delayLabel: 'Day 2 (+48h)',
        message:
          'مرحباً [Name] 😊 لدينا شقق رائعة في منطقة [Area] تناسب ميزانيتك تماماً. هل أنت متاح لجولة هذا الأسبوع؟',
        condition: 'Only if no reply to Step 1',
      },
      {
        id: 3,
        day: 5,
        delayLabel: 'Day 5 (+72h)',
        message:
          "Just checking in one last time! We have a special offer on 2BR apartments in Achrafieh this week only. Let us know if you'd like details. 🏠",
        condition: 'Only if no reply to Step 2',
      },
    ],
  },
  {
    id: 2,
    name: 'Post-Tour Follow-Up',
    description: 'Nurture leads after a property tour to close the deal',
    enrolledLeads: 18,
    status: 'active',
    createdAt: 'Mar 18, 2026',
    steps: [
      {
        id: 1,
        day: 0,
        delayLabel: 'Day 0 (2h after tour)',
        message:
          "Hi [Name]! Thanks for visiting [Property] today. We hope you loved it! Do you have any questions or would you like to see similar options? 😊",
        condition: 'Send 2 hours after tour ends',
      },
      {
        id: 2,
        day: 1,
        delayLabel: 'Day 1 (+24h)',
        message:
          'شكراً لزيارتك اليوم [Name]! هل لديك أي أسئلة حول العقار؟ يمكننا تحديد موعد للتحدث مع أحد وكلائنا في أي وقت يناسبك.',
        condition: 'If no reply to Step 1',
      },
      {
        id: 3,
        day: 3,
        delayLabel: 'Day 3 (+48h)',
        message:
          "[Name], we have another property that's very similar to what you toured but with a better price. Interested in a quick visit? 🏡",
        condition: 'Always send',
      },
      {
        id: 4,
        day: 7,
        delayLabel: 'Day 7 (+96h)',
        message:
          'آخر تذكير [Name] 🙂 لدينا عروض حصرية لعملائنا المميزين هذا الشهر. هل أنت مستعد لاتخاذ القرار؟',
        condition: 'If no deal closed',
      },
    ],
  },
  {
    id: 3,
    name: 'Price Drop Alert',
    description: 'Notify interested leads when a property price drops',
    enrolledLeads: 52,
    status: 'active',
    createdAt: 'Apr 2, 2026',
    steps: [
      {
        id: 1,
        day: 0,
        delayLabel: 'Day 0 (immediately)',
        message:
          '🔔 Good news [Name]! The [Property] you were interested in just dropped in price from [OldPrice] to [NewPrice]. This is a limited time offer. Interested?',
        condition: 'Send immediately on price drop trigger',
      },
      {
        id: 2,
        day: 1,
        delayLabel: 'Day 1 (+24h)',
        message:
          '[Name] انخفض سعر شقة [Property] التي أعجبتك! السعر الجديد هو [NewPrice] بدلاً من [OldPrice]. هل تريد حجز جولة؟ 🔑',
        condition: 'If no reply to Step 1',
      },
    ],
  },
  {
    id: 4,
    name: 'New Listing Match',
    description: 'Alert leads when a new listing matches their saved criteria',
    enrolledLeads: 0,
    status: 'draft',
    createdAt: 'Apr 10, 2026',
    steps: [
      {
        id: 1,
        day: 0,
        delayLabel: 'Day 0 (immediately)',
        message:
          "Hi [Name]! 🏠 We just listed a [Beds]BR [Type] in [Area] that matches exactly what you're looking for. Price: [Price]. Want the full details?",
        condition: 'Send when new matching listing is published',
      },
      {
        id: 2,
        day: 1,
        delayLabel: 'Day 1 (+24h)',
        message:
          '[Name] لدينا عقار جديد في [Area] يناسب متطلباتك تماماً! [Beds] غرف نوم، سعر [Price]. هل تريد مشاهدة الصور والتفاصيل؟',
        condition: 'If no reply to Step 1',
      },
      {
        id: 3,
        day: 3,
        delayLabel: 'Day 3 (+48h)',
        message:
          "This listing won't last long! [Name], the [Type] in [Area] is getting a lot of interest. Shall we book a viewing before it's gone? 📍",
        condition: 'If high interest on listing (3+ views)',
      },
    ],
  },
];

const STATUS_STYLES: Record<SequenceStatus, { bg: string; text: string; dot: string; label: string }> = {
  active: { bg: '#f0fdf4', text: '#16a34a', dot: '#16a34a', label: 'Active' },
  paused: { bg: '#fffbeb', text: '#b45309', dot: '#f59e0b', label: 'Paused' },
  draft: { bg: '#f8fafc', text: '#475569', dot: '#94a3b8', label: 'Draft' },
};

export default function Sequences() {
  const [sequences, setSequences] = useState<Sequence[]>(MOCK_SEQUENCES);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');

  const selected = sequences.find((s) => s.id === selectedId) ?? null;

  function toggleStatus(id: number) {
    setSequences((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status:
                s.status === 'active' ? 'paused' : s.status === 'paused' ? 'active' : s.status,
            }
          : s,
      ),
    );
  }

  function handleAddSequence() {
    if (!newName.trim()) return;
    const newSeq: Sequence = {
      id: Date.now(),
      name: newName.trim(),
      description: 'New sequence',
      enrolledLeads: 0,
      status: 'draft',
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      steps: [],
    };
    setSequences((prev) => [newSeq, ...prev]);
    setNewName('');
    setShowNewModal(false);
  }

  // Detail view
  if (selected) {
    const s = STATUS_STYLES[selected.status];
    return (
      <div className="space-y-4">
        {/* Back + header */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">{selected.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{selected.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: s.bg, color: s.text }}
            >
              <span className="w-[5px] h-[5px] rounded-full" style={{ background: s.dot }} />
              {s.label}
            </span>
            {selected.status !== 'draft' && (
              <button
                type="button"
                onClick={() => toggleStatus(selected.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {selected.status === 'active' ? <Pause size={12} /> : <Play size={12} />}
                {selected.status === 'active' ? 'Pause' : 'Resume'}
              </button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Steps',
              value: String(selected.steps.length),
              icon: Zap,
              color: 'text-brand-600',
              bg: 'bg-brand-50',
            },
            {
              label: 'Enrolled Leads',
              value: String(selected.enrolledLeads),
              icon: Users,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
            },
            {
              label: 'Created',
              value: selected.createdAt,
              icon: Clock,
              color: 'text-slate-600',
              bg: 'bg-slate-100',
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center mb-2`}>
                <Icon size={16} className={color} />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Sequence Steps</h2>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700 transition-colors"
            >
              <Plus size={13} />
              Add Step
            </button>
          </div>

          {selected.steps.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Zap size={28} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No steps yet. Add your first message step.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {selected.steps.map((step, idx) => (
                <div key={step.id} className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Step indicator */}
                    <div className="flex flex-col items-center flex-shrink-0 pt-1">
                      <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      {idx < selected.steps.length - 1 && (
                        <div className="w-px bg-slate-200 mt-2" style={{ height: 24 }} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Step meta */}
                      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">Step {idx + 1}</span>
                        <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Clock size={10} />
                          {step.delayLabel}
                        </span>
                      </div>

                      {/* Message bubble */}
                      <div className="bg-[#f0fdf4] border border-emerald-100 rounded-xl p-3.5 mb-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                            <span className="text-[7px] font-bold text-white">W</span>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-700">WhatsApp Message</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {step.message}
                        </p>
                      </div>

                      {/* Condition */}
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-slate-500">{step.condition}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view
  const totalEnrolled = sequences.reduce((acc, s) => acc + s.enrolledLeads, 0);
  const avgSteps = sequences.length
    ? Math.round(sequences.reduce((acc, s) => acc + s.steps.length, 0) / sequences.length)
    : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sequences</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            Automated WhatsApp re-engagement campaigns for cold and warm leads
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-3 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm min-h-[44px]"
        >
          <Plus size={15} />
          New Sequence
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Sequences', value: String(sequences.length) },
          { label: 'Active', value: String(sequences.filter((s) => s.status === 'active').length) },
          { label: 'Leads Enrolled', value: String(totalEnrolled) },
          { label: 'Avg Steps', value: String(avgSteps) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 md:p-5">
            <p className="text-[11px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {label}
            </p>
            <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight leading-none">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile list */}
      <div className="sm:hidden bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {sequences.map((seq) => {
          const st = STATUS_STYLES[seq.status];
          return (
            <div
              key={seq.id}
              className="flex items-center gap-3 px-4 py-3 min-h-[72px] cursor-pointer active:bg-slate-50 transition-colors"
              onClick={() => setSelectedId(seq.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="font-semibold text-sm text-slate-900 truncate">{seq.name}</p>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
                    style={{ background: st.bg, color: st.text }}
                  >
                    <span className="w-[4px] h-[4px] rounded-full" style={{ background: st.dot }} />
                    {st.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-slate-400">{seq.steps.length} steps</span>
                  <span className="text-xs text-slate-400">{seq.enrolledLeads} enrolled</span>
                  <span className="text-xs text-slate-400">{seq.createdAt}</span>
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-slate-200">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Sequence
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Steps
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Enrolled Leads
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Created
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sequences.map((seq, i) => {
              const st = STATUS_STYLES[seq.status];
              return (
                <tr
                  key={seq.id}
                  className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors group ${i % 2 === 1 ? 'bg-[#f8fafc]/60' : 'bg-white'}`}
                  onClick={() => setSelectedId(seq.id)}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-900">{seq.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{seq.description}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      <Zap size={13} className="text-brand-600" />
                      {seq.steps.length}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      <Users size={13} className="text-purple-500" />
                      {seq.enrolledLeads}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: st.bg, color: st.text }}
                    >
                      <span className="w-[5px] h-[5px] rounded-full" style={{ background: st.dot }} />
                      {st.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{seq.createdAt}</td>
                  <td className="px-5 py-3.5">
                    <div
                      className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {seq.status !== 'draft' && (
                        <button
                          type="button"
                          onClick={() => toggleStatus(seq.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title={seq.status === 'active' ? 'Pause' : 'Resume'}
                        >
                          {seq.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedId(seq.id)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors px-2 py-1 rounded-md hover:bg-brand-50"
                      >
                        View Steps
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New Sequence Modal */}
      {showNewModal && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setShowNewModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                    <Zap size={14} className="text-brand-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">New Sequence</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Sequence Name
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSequence();
                    }}
                    placeholder="e.g. Cold Lead Revival"
                    className="w-full px-3 h-11 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSequence}
                    className="px-4 py-2.5 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
