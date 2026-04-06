import { useState } from 'react';
import {
  Bot,
  Zap,
  Users,
  Clock,
  MessageSquare,
  ChevronRight,
  Save,
} from 'lucide-react';
import { toast } from '../utils/toast';

const INITIAL_TRIGGERS = [
  { id: 1, label: 'Lead requests to speak with a human', active: true },
  { id: 2, label: 'Lead is ready to book a tour', active: true },
  { id: 3, label: 'Price negotiation required', active: true },
  { id: 4, label: 'Lead has complex contract questions', active: true },
  { id: 5, label: 'Lead viewed 3 or more listings', active: false },
  { id: 6, label: 'Conversation has been active more than 24 hours', active: false },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 ${
        checked ? 'bg-brand-600' : 'bg-slate-200'
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function AiRouting() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [handoffEnabled, setHandoffEnabled] = useState(true);
  const [nightModeEnabled, setNightModeEnabled] = useState(true);
  const [autoQualify, setAutoQualify] = useState(true);
  const [autoBookTours, setAutoBookTours] = useState(false);
  const [handoffThreshold, setHandoffThreshold] = useState('3');
  const [responseTimeout, setResponseTimeout] = useState('5');
  const [aiTone, setAiTone] = useState('professional');
  const [language, setLanguage] = useState('bilingual');
  const [routingMode, setRoutingMode] = useState('availability');
  const [triggers, setTriggers] = useState(INITIAL_TRIGGERS);

  const toggleTrigger = (id: number) => {
    setTriggers((prev) => prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
  };

  const handleSave = () => {
    toast.success('AI routing settings saved.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI &amp; Routing</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Configure how the AI handles leads and routes conversations to agents
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Save size={16} />
          Save Settings
        </button>
      </div>

      {/* AI Status Banner */}
      <div
        className={`rounded-xl border p-4 flex items-center justify-between ${
          aiEnabled
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-slate-100 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              aiEnabled ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          >
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">
              AI Assistant is {aiEnabled ? 'Active' : 'Paused'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {aiEnabled
                ? 'Responding to leads 24/7, qualifying and booking tours automatically'
                : 'All conversations will go directly to agents'}
            </p>
          </div>
        </div>
        <Toggle checked={aiEnabled} onChange={() => setAiEnabled((v) => !v)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversation Handling */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={18} className="text-brand-600" />
            <h2 className="font-semibold text-slate-900">Conversation Handling</h2>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-900">Auto-qualify leads</p>
              <p className="text-xs text-slate-500 mt-0.5">
                AI asks budget, area, and timeline questions automatically
              </p>
            </div>
            <Toggle checked={autoQualify} onChange={() => setAutoQualify((v) => !v)} />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-900">Auto-book tours</p>
              <p className="text-xs text-slate-500 mt-0.5">
                AI books property visits directly in the calendar
              </p>
            </div>
            <Toggle checked={autoBookTours} onChange={() => setAutoBookTours((v) => !v)} />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Night mode</p>
              <p className="text-xs text-slate-500 mt-0.5">
                AI continues responding after business hours (after 8 PM)
              </p>
            </div>
            <Toggle checked={nightModeEnabled} onChange={() => setNightModeEnabled((v) => !v)} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              AI Tone
            </label>
            <div className="flex gap-2 flex-wrap">
              {['professional', 'friendly', 'formal'].map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setAiTone(tone)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border capitalize ${
                    aiTone === tone
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Language mode
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'english', label: 'English only' },
                { value: 'arabic', label: 'Arabic only' },
                { value: 'bilingual', label: 'Bilingual (auto-detect)' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLanguage(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    language === opt.value
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Agent Routing */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Users size={18} className="text-brand-600" />
            <h2 className="font-semibold text-slate-900">Agent Routing</h2>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-medium text-slate-900">AI to agent handoff</p>
              <p className="text-xs text-slate-500 mt-0.5">
                AI passes qualified leads to available agents
              </p>
            </div>
            <Toggle checked={handoffEnabled} onChange={() => setHandoffEnabled((v) => !v)} />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Routing priority
            </label>
            <div className="space-y-2">
              {[
                { value: 'availability', label: 'Availability', desc: 'Route to agent with fewest active leads' },
                { value: 'specialization', label: 'Specialization', desc: 'Match lead type to agent specialty' },
                { value: 'round_robin', label: 'Round robin', desc: 'Distribute evenly across all agents' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRoutingMode(opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    routingMode === opt.value
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          routingMode === opt.value ? 'text-brand-700' : 'text-slate-900'
                        }`}
                      >
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    </div>
                    {routingMode === opt.value && (
                      <div className="w-4 h-4 rounded-full bg-brand-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timing */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={18} className="text-brand-600" />
            <h2 className="font-semibold text-slate-900">Timing</h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Handoff threshold (AI messages before agent takes over)
            </label>
            <select
              value={handoffThreshold}
              onChange={(e) => setHandoffThreshold(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="2">2 exchanges</option>
              <option value="3">3 exchanges</option>
              <option value="5">5 exchanges</option>
              <option value="10">10 exchanges</option>
              <option value="never">Never (AI handles fully)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Agent response timeout (minutes before AI resumes)
            </label>
            <select
              value={responseTimeout}
              onChange={(e) => setResponseTimeout(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="3">3 minutes</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="30">30 minutes</option>
              <option value="never">Never (wait for agent)</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-brand-600" />
            <h2 className="font-semibold text-slate-900">AI Performance (Last 30 Days)</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Conversations handled by AI', value: '1,284', sub: '69.5% of total', color: 'text-brand-700', bg: 'bg-brand-50 border-brand-100' },
              { label: 'Avg first response time', value: '0.8 min', sub: '5x faster than human', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
              { label: 'Tours booked by AI', value: '218', sub: '40.2% of all tours', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
              { label: 'AI qualification rate', value: '72.4%', sub: '+6.2% vs human agents', color: 'text-slate-800', bg: 'bg-slate-50 border-slate-200' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`flex items-center justify-between p-3 rounded-xl border ${stat.bg}`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">{stat.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.sub}</p>
                </div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Handoff Rules */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Handoff Triggers</h2>
          <span className="text-xs text-slate-500">AI hands off to agent when any of these are met</span>
        </div>
        <div className="divide-y divide-slate-100">
          {triggers.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between px-6 py-3.5">
              <div className="flex items-center gap-2.5">
                <ChevronRight size={14} className="text-slate-300" />
                <span className="text-sm text-slate-700">{rule.label}</span>
              </div>
              <Toggle checked={rule.active} onChange={() => toggleTrigger(rule.id)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
