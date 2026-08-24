import { useState } from 'react';
import {
  Globe,
  ListOrdered,
  Clock,
  UserCheck,
  Sparkles,
  CheckCircle,
  Save,
  ChevronUp,
  ChevronDown,
  Info,
} from 'lucide-react';
import { toast } from '../utils/toast';

// Toggle switch

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 ${
        checked ? 'bg-brand-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// Section card

function SectionCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={15} className={iconColor} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// Toggle row

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-50 last:border-0">
      <div className={disabled ? 'opacity-50' : ''}>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={disabled ? () => {} : onChange} />
    </div>
  );
}

// Qualification question row

function QualQuestion({
  index,
  question,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onChange,
}: {
  index: number;
  question: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0 mt-0.5">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-0.5 text-slate-300 hover:text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronUp size={14} />
        </button>
        <span className="text-[10px] font-bold text-slate-400 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
          {index + 1}
        </span>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="p-0.5 text-slate-300 hover:text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronDown size={14} />
        </button>
      </div>
      <input
        type="text"
        value={question}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition"
      />
    </div>
  );
}

// Defaults

const DEFAULT_QUAL_QUESTIONS = [
  'What type of property are you looking for? (apartment, villa, duplex, studio)',
  'Are you looking to buy or rent?',
  'What is your budget range in USD?',
  'Which area do you prefer? (Achrafieh, Metn, Kesrouan, Jounieh, Beirut)',
  'How many bedrooms do you need?',
];

const DEFAULT_GREETING = `Marhaba! Welcome to [Agency Name]. I'm here to help you find your perfect property in Lebanon.

Are you looking to buy or rent today?`;

const DEFAULT_CLOSING = `Thank you for reaching out! Our team will follow up with you shortly to confirm the details.

Looking forward to helping you find your dream property.`;

const DEFAULT_OUT_OF_HOURS =
  'Thank you for your message! Our office is currently closed. We will get back to you during business hours (9 AM to 9 PM Beirut time).';

// Input/label classes (reused throughout)

const inputCls =
  'w-full px-3 h-11 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition';
const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5';
const selectCls = inputCls + ' cursor-pointer';

// Main component

export default function ConversationRules() {
  // Language
  const [langArabic, setLangArabic] = useState(true);
  const [langEnglish, setLangEnglish] = useState(true);
  const [langFrench, setLangFrench] = useState(false);
  const [tone, setTone] = useState<'formal' | 'semi-formal' | 'casual'>('semi-formal');
  const [mirrorLang, setMirrorLang] = useState(true);
  const [bilingualMode, setBilingualMode] = useState(true);

  // Qualification
  const [qualQuestions, setQualQuestions] = useState(DEFAULT_QUAL_QUESTIONS);

  const moveQuestion = (index: number, dir: 'up' | 'down') => {
    const arr = [...qualQuestions];
    const target = dir === 'up' ? index - 1 : index + 1;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setQualQuestions(arr);
  };

  const updateQuestion = (index: number, val: string) => {
    const arr = [...qualQuestions];
    arr[index] = val;
    setQualQuestions(arr);
  };

  // Response timing
  const [initialDelay, setInitialDelay] = useState('0');
  const [betweenDelay, setBetweenDelay] = useState('2');
  const [timezone] = useState('Asia/Beirut');
  const [businessHoursOnly, setBusinessHoursOnly] = useState(false);
  const [businessStart, setBusinessStart] = useState('09:00');
  const [businessEnd, setBusinessEnd] = useState('21:00');
  const [typingIndicator, setTypingIndicator] = useState(true);

  // Handoff rules
  const [handoffOnTour, setHandoffOnTour] = useState(true);
  const [handoffOnNegotiation, setHandoffOnNegotiation] = useState(true);
  const [handoffOnLuxury, setHandoffOnLuxury] = useState(true);
  const [handoffBudgetThreshold, setHandoffBudgetThreshold] = useState('500000');
  const [handoffAfterCount, setHandoffAfterCount] = useState(false);
  const [handoffMessageCount, setHandoffMessageCount] = useState('10');
  const [notifyAgent, setNotifyAgent] = useState(true);

  // Templates
  const [greeting, setGreeting] = useState(DEFAULT_GREETING);
  const [closing, setClosing] = useState(DEFAULT_CLOSING);
  const [outOfHours, setOutOfHours] = useState(DEFAULT_OUT_OF_HOURS);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success('Conversation rules saved.');
  };

  return (
    <div className="space-y-5 pb-24 md:pb-5">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Conversation Rules</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            Configure how the AI WhatsApp bot behaves with every lead
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
        >
          <Save size={15} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* 1. Language Settings */}
      <SectionCard
        icon={Globe}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        title="Language Settings"
        subtitle="Control which languages the AI responds in"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-0.5">
            <ToggleRow label="Arabic" description="Respond in Arabic when the lead writes in Arabic" checked={langArabic} onChange={setLangArabic} />
            <ToggleRow label="English" description="Respond in English when the lead writes in English" checked={langEnglish} onChange={setLangEnglish} />
            <ToggleRow label="French" description="Respond in French when the lead writes in French" checked={langFrench} onChange={setLangFrench} />
            <ToggleRow label="Mirror lead language" description="Automatically match the language the lead uses" checked={mirrorLang} onChange={setMirrorLang} />
            <ToggleRow label="Bilingual mode" description="Mix Arabic and English naturally (Lebanese texting style)" checked={bilingualMode} onChange={setBilingualMode} />
          </div>
          <div>
            <label className={labelCls}>Conversation tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as typeof tone)}
              className={selectCls}
            >
              <option value="formal">Formal - Professional and respectful</option>
              <option value="semi-formal">Semi-formal - Friendly but professional</option>
              <option value="casual">Casual - Relaxed and conversational</option>
            </select>
            <p className="text-xs text-slate-400 mt-2.5 flex items-start gap-1.5">
              <Info size={12} className="flex-shrink-0 mt-0.5 text-slate-300" />
              Semi-formal works best for Lebanese real estate. Overly formal feels cold; too casual loses trust.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* 2. Qualification Flow */}
      <SectionCard
        icon={ListOrdered}
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
        title="Qualification Flow"
        subtitle="The order of questions the AI asks to qualify each lead"
      >
        <div className="space-y-2">
          {qualQuestions.map((q, i) => (
            <QualQuestion
              key={i}
              index={i}
              question={q}
              onMoveUp={() => moveQuestion(i, 'up')}
              onMoveDown={() => moveQuestion(i, 'down')}
              isFirst={i === 0}
              isLast={i === qualQuestions.length - 1}
              onChange={(val) => updateQuestion(i, val)}
            />
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
          <Info size={12} className="flex-shrink-0 text-slate-300" />
          The AI asks these progressively, one at a time. It does not dump all questions at once.
        </p>
      </SectionCard>

      {/* 3. Response Timing */}
      <SectionCard
        icon={Clock}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        title="Response Timing"
        subtitle="Control how fast the AI responds and when it is active"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Initial reply delay</label>
              <select value={initialDelay} onChange={(e) => setInitialDelay(e.target.value)} className={selectCls}>
                <option value="0">Instant (0 seconds)</option>
                <option value="3">3 seconds - feels natural</option>
                <option value="5">5 seconds</option>
                <option value="10">10 seconds</option>
                <option value="30">30 seconds - simulates reading time</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Delay between messages</label>
              <select value={betweenDelay} onChange={(e) => setBetweenDelay(e.target.value)} className={selectCls}>
                <option value="0">No delay</option>
                <option value="1">1 second</option>
                <option value="2">2 seconds</option>
                <option value="3">3 seconds</option>
                <option value="5">5 seconds</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Timezone</label>
              <select value={timezone} className={selectCls} disabled>
                <option value="Asia/Beirut">Asia/Beirut (Lebanon)</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Locked to Beirut time. All scheduling is relative to Lebanon.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <ToggleRow
              label="Typing simulation"
              description="Show typing indicator before sending (more human-like)"
              checked={typingIndicator}
              onChange={setTypingIndicator}
            />
            <ToggleRow
              label="Business hours only"
              description="AI only responds within set hours. Sends out-of-hours message otherwise."
              checked={businessHoursOnly}
              onChange={setBusinessHoursOnly}
            />
            {businessHoursOnly && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Opens at</label>
                  <input
                    type="time"
                    value={businessStart}
                    onChange={(e) => setBusinessStart(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Closes at</label>
                  <input
                    type="time"
                    value={businessEnd}
                    onChange={(e) => setBusinessEnd(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* 4. Handoff Rules */}
      <SectionCard
        icon={UserCheck}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        title="Handoff Rules"
        subtitle="Define when the AI escalates to a human agent"
      >
        <div className="space-y-0.5 mb-5">
          <ToggleRow
            label="Lead requests to speak to an agent"
            description="Always escalate when the lead explicitly asks. Cannot be disabled."
            checked={true}
            onChange={() => {}}
            disabled
          />
          <ToggleRow
            label="Tour visit confirmed"
            description="Hand off when a property tour is booked"
            checked={handoffOnTour}
            onChange={setHandoffOnTour}
          />
          <ToggleRow
            label="Price negotiation begins"
            description="Escalate when the lead starts negotiating price or contract terms"
            checked={handoffOnNegotiation}
            onChange={setHandoffOnNegotiation}
          />
          <ToggleRow
            label="Luxury property inquiry"
            description="Escalate for properties above the budget threshold below"
            checked={handoffOnLuxury}
            onChange={setHandoffOnLuxury}
          />
          <ToggleRow
            label="Auto-handoff after message count"
            description="Escalate after a set number of exchanges regardless of status"
            checked={handoffAfterCount}
            onChange={setHandoffAfterCount}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          {handoffOnLuxury && (
            <div>
              <label className={labelCls}>Luxury budget threshold (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">$</span>
                <input
                  type="number"
                  value={handoffBudgetThreshold}
                  onChange={(e) => setHandoffBudgetThreshold(e.target.value)}
                  placeholder="500000"
                  className="w-full pl-7 pr-3 h-11 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition"
                />
              </div>
            </div>
          )}
          {handoffAfterCount && (
            <div>
              <label className={labelCls}>Message count trigger</label>
              <select value={handoffMessageCount} onChange={(e) => setHandoffMessageCount(e.target.value)} className={selectCls}>
                <option value="5">After 5 messages</option>
                <option value="10">After 10 messages</option>
                <option value="15">After 15 messages</option>
                <option value="20">After 20 messages</option>
              </select>
            </div>
          )}
          <div>
            <ToggleRow
              label="Notify agent on handoff"
              description="Send a WhatsApp notification to the assigned agent immediately"
              checked={notifyAgent}
              onChange={setNotifyAgent}
            />
          </div>
        </div>
      </SectionCard>

      {/* 5. Greeting Templates */}
      <SectionCard
        icon={Sparkles}
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
        title="Greeting Templates"
        subtitle="Messages sent to new leads and outside business hours"
      >
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Default greeting message</label>
            <textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition resize-none"
              placeholder="Enter your greeting message..."
            />
            <p className="text-xs text-slate-400 mt-1">
              Use [Agency Name] as a placeholder. It is replaced automatically per agency.
            </p>
          </div>
          <div>
            <label className={labelCls}>Out-of-hours message</label>
            <textarea
              value={outOfHours}
              onChange={(e) => setOutOfHours(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition resize-none"
              placeholder="Message sent when a lead contacts outside business hours..."
            />
          </div>
        </div>
      </SectionCard>

      {/* 6. Closing Messages */}
      <SectionCard
        icon={CheckCircle}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        title="Closing Messages"
        subtitle="Final message sent before handing off or closing a conversation"
      >
        <div>
          <label className={labelCls}>Handoff closing message</label>
          <textarea
            value={closing}
            onChange={(e) => setClosing(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition resize-none"
            placeholder="Message sent to the lead immediately before passing to a human agent..."
          />
          <p className="text-xs text-slate-400 mt-1">
            Sent to the lead right before the conversation is transferred to an agent.
          </p>
        </div>
      </SectionCard>

      {/* Mobile save button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-20">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 h-12 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

    </div>
  );
}
