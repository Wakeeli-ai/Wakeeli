import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2, Users, Home, MapPin, DollarSign, MessageCircle,
  Bot, Star, Upload, Rocket, Check, ChevronLeft, ChevronRight, X,
} from 'lucide-react';

// Types

type PropertyType = 'apartments' | 'villas' | 'commercial' | 'land';
type District = 'achrafieh' | 'hamra' | 'verdun' | 'jounieh' | 'metn' | 'kesrouan' | 'baabda' | 'jdeideh' | 'dbayeh' | 'antelias';
type AiTone = 'formal' | 'friendly';
type AiLanguage = 'arabic' | 'english' | 'bilingual';

interface AgentRow {
  id: number;
  name: string;
  whatsapp: string;
}

interface PriceRange {
  min: string;
  max: string;
}

interface WizardState {
  // Step 1
  agencyName: string;
  address: string;
  licenseNumber: string;
  yearsActive: string;
  // Step 2
  agents: AgentRow[];
  // Step 3
  propertyTypes: Record<PropertyType, boolean>;
  // Step 4
  districts: Record<District, boolean>;
  // Step 5
  priceRanges: Record<PropertyType, PriceRange>;
  // Step 6
  whatsappNumber: string;
  whatsappDisplayName: string;
  // Step 7
  aiTone: AiTone;
  aiLanguage: AiLanguage;
  // Step 8
  sellingPoints: string;
  // Step 9 (UI shell only)
  importMethod: 'csv' | 'manual' | null;
}

const INITIAL_STATE: WizardState = {
  agencyName: '',
  address: '',
  licenseNumber: '',
  yearsActive: '',
  agents: [{ id: 1, name: '', whatsapp: '' }],
  propertyTypes: { apartments: false, villas: false, commercial: false, land: false },
  districts: {
    achrafieh: false, hamra: false, verdun: false, jounieh: false,
    metn: false, kesrouan: false, baabda: false, jdeideh: false,
    dbayeh: false, antelias: false,
  },
  priceRanges: {
    apartments: { min: '', max: '' },
    villas: { min: '', max: '' },
    commercial: { min: '', max: '' },
    land: { min: '', max: '' },
  },
  whatsappNumber: '',
  whatsappDisplayName: '',
  aiTone: 'friendly',
  aiLanguage: 'bilingual',
  sellingPoints: '',
  importMethod: null,
};

const TOTAL_STEPS = 10;

const STEP_META: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { title: 'Agency Info', subtitle: 'Tell us about your agency', icon: Building2 },
  { title: 'Team Setup', subtitle: 'Add your agents', icon: Users },
  { title: 'Property Types', subtitle: 'What do you list?', icon: Home },
  { title: 'Coverage Areas', subtitle: 'Where do you operate?', icon: MapPin },
  { title: 'Price Ranges', subtitle: 'Set your typical range by type', icon: DollarSign },
  { title: 'WhatsApp Setup', subtitle: 'Connect your business number', icon: MessageCircle },
  { title: 'AI Tone', subtitle: 'How should your AI communicate?', icon: Bot },
  { title: 'Key Selling Points', subtitle: "What makes you different?", icon: Star },
  { title: 'Import Listings', subtitle: 'Add your property portfolio', icon: Upload },
  { title: 'Go Live', subtitle: "You're ready to start converting", icon: Rocket },
];

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartments: 'Apartments',
  villas: 'Villas',
  commercial: 'Commercial',
  land: 'Land',
};

const DISTRICT_LABELS: Record<District, string> = {
  achrafieh: 'Achrafieh',
  hamra: 'Hamra',
  verdun: 'Verdun',
  jounieh: 'Jounieh',
  metn: 'Metn',
  kesrouan: 'Kesrouan',
  baabda: 'Baabda',
  jdeideh: 'Jdeideh',
  dbayeh: 'Dbayeh',
  antelias: 'Antelias',
};

// Input components

function DarkInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 h-11 rounded-lg text-sm text-white placeholder:text-white/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        style={{ background: 'rgba(255,255,255,0.07)' }}
      />
    </div>
  );
}

function DarkCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all text-left ${
        checked
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-white/10 hover:border-white/20'
      }`}
      style={{ background: checked ? 'rgba(32,96,232,0.12)' : 'rgba(255,255,255,0.04)' }}
    >
      <div
        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all ${
          checked ? 'bg-blue-500' : 'border border-white/20'
        }`}
      >
        {checked && <Check size={12} className="text-white" />}
      </div>
      <span className={`text-sm font-medium ${checked ? 'text-white' : 'text-white/60'}`}>
        {label}
      </span>
    </button>
  );
}

// Step components

function Step1({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  return (
    <div className="space-y-4">
      <DarkInput
        label="Agency Name"
        value={state.agencyName}
        onChange={(v) => setState((s) => ({ ...s, agencyName: v }))}
        placeholder="e.g. Pro-Founders Real Estate"
      />
      <DarkInput
        label="Address"
        value={state.address}
        onChange={(v) => setState((s) => ({ ...s, address: v }))}
        placeholder="e.g. Achrafieh, Beirut, Lebanon"
      />
      <div className="grid grid-cols-2 gap-4">
        <DarkInput
          label="License Number"
          value={state.licenseNumber}
          onChange={(v) => setState((s) => ({ ...s, licenseNumber: v }))}
          placeholder="e.g. REL-2024-0123"
        />
        <DarkInput
          label="Years Active"
          value={state.yearsActive}
          onChange={(v) => setState((s) => ({ ...s, yearsActive: v }))}
          placeholder="e.g. 8"
          type="number"
        />
      </div>
    </div>
  );
}

function Step2({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  function addAgent() {
    setState((s) => ({
      ...s,
      agents: [...s.agents, { id: Date.now(), name: '', whatsapp: '' }],
    }));
  }

  function updateAgent(id: number, field: 'name' | 'whatsapp', value: string) {
    setState((s) => ({
      ...s,
      agents: s.agents.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    }));
  }

  function removeAgent(id: number) {
    setState((s) => ({
      ...s,
      agents: s.agents.filter((a) => a.id !== id),
    }));
  }

  return (
    <div className="space-y-3">
      {state.agents.map((agent, idx) => (
        <div
          key={agent.id}
          className="rounded-xl p-4 space-y-3 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wide">
              Agent {idx + 1}
            </span>
            {state.agents.length > 1 && (
              <button
                type="button"
                onClick={() => removeAgent(agent.id)}
                className="p-1 text-white/30 hover:text-red-400 transition-colors rounded"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DarkInput
              label="Full Name"
              value={agent.name}
              onChange={(v) => updateAgent(agent.id, 'name', v)}
              placeholder="e.g. Joelle Rizk"
            />
            <DarkInput
              label="WhatsApp Number"
              value={agent.whatsapp}
              onChange={(v) => updateAgent(agent.id, 'whatsapp', v)}
              placeholder="+961 70 123 456"
              type="tel"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addAgent}
        className="w-full py-3 rounded-xl border border-dashed border-white/20 text-sm font-semibold text-white/50 hover:text-white hover:border-white/40 transition-colors"
      >
        + Add Another Agent
      </button>
    </div>
  );
}

function Step3({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  const types = Object.keys(state.propertyTypes) as PropertyType[];
  return (
    <div className="grid grid-cols-2 gap-3">
      {types.map((type) => (
        <DarkCheckbox
          key={type}
          label={PROPERTY_TYPE_LABELS[type]}
          checked={state.propertyTypes[type]}
          onChange={() =>
            setState((s) => ({
              ...s,
              propertyTypes: { ...s.propertyTypes, [type]: !s.propertyTypes[type] },
            }))
          }
        />
      ))}
    </div>
  );
}

function Step4({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  const districts = Object.keys(state.districts) as District[];
  return (
    <div className="grid grid-cols-2 gap-2">
      {districts.map((d) => (
        <DarkCheckbox
          key={d}
          label={DISTRICT_LABELS[d]}
          checked={state.districts[d]}
          onChange={() =>
            setState((s) => ({
              ...s,
              districts: { ...s.districts, [d]: !s.districts[d] },
            }))
          }
        />
      ))}
    </div>
  );
}

function Step5({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  const activeTypes = (Object.keys(state.propertyTypes) as PropertyType[]).filter(
    (t) => state.propertyTypes[t],
  );

  if (activeTypes.length === 0) {
    return (
      <p className="text-sm text-white/40 text-center py-4">
        No property types selected. Go back to Step 3 to select them.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activeTypes.map((type) => (
        <div
          key={type}
          className="rounded-xl p-4 border border-white/10"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3">
            {PROPERTY_TYPE_LABELS[type]}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <DarkInput
              label="Min (USD)"
              value={state.priceRanges[type].min}
              onChange={(v) =>
                setState((s) => ({
                  ...s,
                  priceRanges: {
                    ...s.priceRanges,
                    [type]: { ...s.priceRanges[type], min: v },
                  },
                }))
              }
              placeholder="100,000"
              type="number"
            />
            <DarkInput
              label="Max (USD)"
              value={state.priceRanges[type].max}
              onChange={(v) =>
                setState((s) => ({
                  ...s,
                  priceRanges: {
                    ...s.priceRanges,
                    [type]: { ...s.priceRanges[type], max: v },
                  },
                }))
              }
              placeholder="1,000,000"
              type="number"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Step6({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  return (
    <div className="space-y-4">
      <DarkInput
        label="WhatsApp Business Number"
        value={state.whatsappNumber}
        onChange={(v) => setState((s) => ({ ...s, whatsappNumber: v }))}
        placeholder="+961 1 234 567"
        type="tel"
      />
      <DarkInput
        label="Display Name"
        value={state.whatsappDisplayName}
        onChange={(v) => setState((s) => ({ ...s, whatsappDisplayName: v }))}
        placeholder="e.g. Pro-Founders Properties"
      />
      <div
        className="rounded-xl p-4 border border-white/10"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        <p className="text-xs font-semibold text-white/60 mb-2">What happens next</p>
        <ul className="space-y-1.5">
          {[
            'We submit your number to Meta for WhatsApp Business API access',
            'Approval takes 1-2 business days',
            'You will receive a verification code via SMS',
            'Once live, your AI will respond to all inbound WhatsApp messages',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-white/50">
              <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Step7({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  const tones: { value: AiTone; label: string; description: string }[] = [
    {
      value: 'formal',
      label: 'Professional',
      description: 'Formal, polished language. Suited for high-end and luxury clients.',
    },
    {
      value: 'friendly',
      label: 'Friendly',
      description: 'Warm and conversational. Builds rapport quickly with all client types.',
    },
  ];

  const languages: { value: AiLanguage; label: string; description: string }[] = [
    { value: 'arabic', label: 'Arabic only', description: 'All messages in Arabic' },
    { value: 'english', label: 'English only', description: 'All messages in English' },
    {
      value: 'bilingual',
      label: 'Bilingual',
      description: 'AI detects the language the lead writes in and responds accordingly',
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3">Tone</p>
        <div className="space-y-2">
          {tones.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setState((s) => ({ ...s, aiTone: t.value }))}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                state.aiTone === t.value
                  ? 'border-blue-500'
                  : 'border-white/10 hover:border-white/20'
              }`}
              style={{
                background:
                  state.aiTone === t.value ? 'rgba(32,96,232,0.12)' : 'rgba(255,255,255,0.04)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    state.aiTone === t.value ? 'border-blue-500' : 'border-white/20'
                  }`}
                >
                  {state.aiTone === t.value && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{t.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-3">Language</p>
        <div className="space-y-2">
          {languages.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => setState((s) => ({ ...s, aiLanguage: l.value }))}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                state.aiLanguage === l.value
                  ? 'border-blue-500'
                  : 'border-white/10 hover:border-white/20'
              }`}
              style={{
                background:
                  state.aiLanguage === l.value
                    ? 'rgba(32,96,232,0.12)'
                    : 'rgba(255,255,255,0.04)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    state.aiLanguage === l.value ? 'border-blue-500' : 'border-white/20'
                  }`}
                >
                  {state.aiLanguage === l.value && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{l.label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{l.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step8({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-white/60">
        Describe what makes your agency stand out. Your AI will use this to answer questions like
        "Why should I work with you?" during conversations.
      </p>
      <textarea
        value={state.sellingPoints}
        onChange={(e) => setState((s) => ({ ...s, sellingPoints: e.target.value }))}
        placeholder={`e.g.\n- 15 years of experience in the Metn and Kesrouan markets\n- In-house legal team handles all title checks and notary coordination\n- 200+ successful transactions since 2010\n- We speak Arabic, English, and French\n- Same-day response guarantee on all inquiries`}
        rows={10}
        className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/25 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none leading-relaxed"
        style={{ background: 'rgba(255,255,255,0.07)' }}
      />
    </div>
  );
}

function Step9({ state, setState }: { state: WizardState; setState: React.Dispatch<React.SetStateAction<WizardState>> }) {
  const options = [
    {
      value: 'csv' as const,
      label: 'Upload CSV',
      description: 'Import all your listings at once from a spreadsheet',
      icon: Upload,
    },
    {
      value: 'manual' as const,
      label: 'Add Manually',
      description: "Add listings one by one after setup (you can also do this later)",
      icon: ChevronRight,
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">
        Add your property portfolio so your AI can match leads to listings automatically.
      </p>
      <div className="space-y-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setState((s) => ({ ...s, importMethod: opt.value }))}
              className={`w-full text-left px-4 py-4 rounded-xl border transition-all flex items-center gap-4 ${
                state.importMethod === opt.value
                  ? 'border-blue-500'
                  : 'border-white/10 hover:border-white/20'
              }`}
              style={{
                background:
                  state.importMethod === opt.value
                    ? 'rgba(32,96,232,0.12)'
                    : 'rgba(255,255,255,0.04)',
              }}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  state.importMethod === opt.value ? 'bg-blue-500/20' : 'bg-white/5'
                }`}
              >
                <Icon
                  size={18}
                  className={state.importMethod === opt.value ? 'text-blue-400' : 'text-white/30'}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{opt.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {state.importMethod === 'csv' && (
        <div
          className="rounded-xl border-2 border-dashed border-white/15 p-8 text-center"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <Upload size={28} className="text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/40">Drop your CSV file here</p>
          <p className="text-xs text-white/25 mt-1">or click to browse</p>
          <button
            type="button"
            className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold text-white/60 border border-white/15 hover:border-white/30 transition-colors"
          >
            Browse File
          </button>
        </div>
      )}

      <p className="text-xs text-white/30 text-center">
        You can always import or add listings later from the Listings page.
      </p>
    </div>
  );
}

function Step10({ state }: { state: WizardState }) {
  const completedItems = [
    { label: 'Agency Info', done: Boolean(state.agencyName) },
    { label: 'Team Setup', done: state.agents.some((a) => a.name) },
    {
      label: 'Property Types',
      done: Object.values(state.propertyTypes).some(Boolean),
    },
    { label: 'Coverage Areas', done: Object.values(state.districts).some(Boolean) },
    { label: 'WhatsApp Setup', done: Boolean(state.whatsappNumber) },
    { label: 'AI Tone Configured', done: Boolean(state.aiTone) },
    { label: 'Key Selling Points', done: Boolean(state.sellingPoints) },
    { label: 'Listings Import', done: Boolean(state.importMethod) },
  ];

  const completedCount = completedItems.filter((i) => i.done).length;
  const pct = Math.round((completedCount / completedItems.length) * 100);

  return (
    <div className="space-y-6">
      {/* Completion ring */}
      <div className="text-center py-4">
        <div
          className="w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4"
          style={{ background: 'rgba(32,96,232,0.15)', border: '3px solid #2060e8' }}
        >
          <Rocket size={36} className="text-blue-400" />
        </div>
        <h3 className="text-2xl font-extrabold text-white">
          {pct === 100 ? "You're ready!" : `${pct}% complete`}
        </h3>
        <p className="text-sm text-white/50 mt-1">
          {pct === 100
            ? 'Your AI is configured and ready to start converting leads.'
            : 'Complete the remaining steps to get the most out of Wakeeli.'}
        </p>
      </div>

      {/* Checklist */}
      <div
        className="rounded-xl border border-white/10 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)' }}
      >
        {completedItems.map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center gap-3 px-4 py-3 ${
              i < completedItems.length - 1 ? 'border-b border-white/5' : ''
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                item.done ? 'bg-emerald-500' : 'border border-white/15'
              }`}
            >
              {item.done && <Check size={11} className="text-white" />}
            </div>
            <span
              className={`text-sm font-medium ${item.done ? 'text-white' : 'text-white/40'}`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-white/30 text-center">
        Clicking "Go Live" will activate your AI and begin accepting leads via WhatsApp.
      </p>
    </div>
  );
}

// Main wizard

interface OnboardingWizardProps {
  onClose?: () => void;
}

function WizardOverlay({ onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);

  const stepMeta = STEP_META[step - 1];
  const StepIcon = stepMeta.icon;
  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  function handleNext() {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  function handleFinish() {
    // In production this would submit. For now, close.
    onClose?.();
  }

  function renderStep() {
    switch (step) {
      case 1: return <Step1 state={state} setState={setState} />;
      case 2: return <Step2 state={state} setState={setState} />;
      case 3: return <Step3 state={state} setState={setState} />;
      case 4: return <Step4 state={state} setState={setState} />;
      case 5: return <Step5 state={state} setState={setState} />;
      case 6: return <Step6 state={state} setState={setState} />;
      case 7: return <Step7 state={state} setState={setState} />;
      case 8: return <Step8 state={state} setState={setState} />;
      case 9: return <Step9 state={state} setState={setState} />;
      case 10: return <Step10 state={state} />;
      default: return null;
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0b1220 0%, #0f1d3a 100%)' }}
    >
      {/* Top bar: progress + close */}
      <div
        className="flex-shrink-0 px-4 md:px-8 py-4 flex items-center gap-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 28, height: 28, background: '#2060e8', borderRadius: 7 }}
          >
            <img
              src="/logo-icon.png"
              alt="Wakeeli"
              className="object-contain"
              style={{ width: 14, height: 14 }}
            />
          </div>
          <span
            className="text-white font-bold uppercase"
            style={{ fontSize: 11, letterSpacing: '0.18em' }}
          >
            Wakeeli
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex-1 mx-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-white/40">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="text-xs font-semibold text-white/40">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: '#2060e8' }}
            />
          </div>
        </div>

        {/* Step dots (desktop) */}
        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i + 1 === step ? 20 : 6,
                height: 6,
                background:
                  i + 1 < step
                    ? '#2060e8'
                    : i + 1 === step
                    ? '#2060e8'
                    : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>

        {/* Close */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 md:px-0 py-8 md:py-12">
          {/* Step header */}
          <div className="flex items-center gap-3 mb-7">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(32,96,232,0.18)' }}
            >
              <StepIcon size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white leading-tight">{stepMeta.title}</h2>
              <p className="text-sm text-white/40 mt-0.5">{stepMeta.subtitle}</p>
            </div>
          </div>

          {/* Step content */}
          {renderStep()}
        </div>
      </div>

      {/* Bottom nav */}
      <div
        className="flex-shrink-0 px-4 md:px-8 py-4 flex items-center justify-between gap-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
          style={{
            color: step === 1 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
            background: step === 1 ? 'transparent' : 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-2">
          {step < TOTAL_STEPS ? (
            <>
              {step !== TOTAL_STEPS && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-xs font-semibold transition-colors px-3 py-2.5"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)';
                  }}
                >
                  Skip
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: '#2060e8' }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #2060e8 0%, #7c3aed 100%)' }}
            >
              <Rocket size={16} />
              Go Live
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Exported page: renders wizard as full-screen overlay via portal

export default function OnboardingWizard() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <Check size={24} className="text-emerald-600" />
          </div>
          <p className="font-bold text-slate-900 text-base">Setup complete</p>
          <p className="text-sm text-slate-500 mt-1">Your agency is configured and ready.</p>
        </div>
      </div>
    );
  }

  return createPortal(
    <WizardOverlay onClose={() => setDismissed(true)} />,
    document.body,
  );
}
