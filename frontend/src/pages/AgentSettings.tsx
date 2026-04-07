import { useState } from 'react';
import { Bell, Globe, MessageSquare, Check, Wifi } from 'lucide-react';
import { toast } from '../utils/toast';

type AvailabilityStatus = 'online' | 'away' | 'offline';

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 flex-shrink-0"
      style={{ background: enabled ? '#2060e8' : '#e2e8f0' }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: enabled ? 'translateX(22px)' : 'translateX(4px)' }}
      />
    </button>
  );
}

const availabilityOptions: {
  value: AvailabilityStatus;
  label: string;
  description: string;
  dot: string;
  bg: string;
  text: string;
  border: string;
}[] = [
  {
    value: 'online',
    label: 'Online',
    description: 'Receiving new leads',
    dot: '#16a34a',
    bg: '#f0fdf4',
    text: '#16a34a',
    border: '#16a34a',
  },
  {
    value: 'away',
    label: 'Away',
    description: 'Auto-reply active',
    dot: '#f59e0b',
    bg: '#fffbeb',
    text: '#b45309',
    border: '#f59e0b',
  },
  {
    value: 'offline',
    label: 'Offline',
    description: 'Not receiving leads',
    dot: '#94a3b8',
    bg: '#f8fafc',
    text: '#475569',
    border: '#cbd5e1',
  },
];

export default function AgentSettings() {
  const [notifications, setNotifications] = useState({
    newLeadAlert: true,
    tourReminder: true,
    dailySummary: false,
    missedConversation: true,
    dealClosed: true,
  });

  const [availability, setAvailability] = useState<AvailabilityStatus>('online');
  const [language, setLanguage] = useState('en');
  const [autoReply, setAutoReply] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success('Settings saved.');
  };

  const notifItems: {
    key: keyof typeof notifications;
    label: string;
    description: string;
  }[] = [
    {
      key: 'newLeadAlert',
      label: 'New Lead Alerts',
      description: 'Notify when a new lead is assigned to you',
    },
    {
      key: 'tourReminder',
      label: 'Tour Reminders',
      description: 'Get reminders 1 hour before scheduled tours',
    },
    {
      key: 'dailySummary',
      label: 'Daily Summary',
      description: 'Receive a morning recap of your open leads',
    },
    {
      key: 'missedConversation',
      label: 'Missed Conversations',
      description: 'Alert when a lead message goes unanswered for 30 min',
    },
    {
      key: 'dealClosed',
      label: 'Deal Closed',
      description: 'Notification when a deal is marked closed',
    },
  ];

  return (
    <div className="space-y-5 pb-24 md:pb-5 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-0.5 text-sm">Manage your preferences and availability</p>
      </div>

      {/* Availability Status */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Wifi size={15} className="text-slate-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Availability</h2>
            <p className="text-xs text-slate-400">Controls how new leads are routed to you</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {availabilityOptions.map((opt) => {
            const isSelected = availability === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setAvailability(opt.value)}
                className="flex items-center gap-2.5 px-4 py-2.5 min-h-[44px] rounded-lg border text-sm font-semibold transition-all"
                style={
                  isSelected
                    ? { background: opt.bg, color: opt.text, borderColor: opt.border }
                    : { background: '#fff', color: '#475569', borderColor: '#e2e8f0' }
                }
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: isSelected ? opt.dot : '#94a3b8' }}
                />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
        {availability !== 'online' && (
          <p className="mt-3 text-xs text-slate-400">
            {availability === 'away'
              ? 'AI will handle new conversations until you come back online.'
              : 'You will not receive new leads while offline. AI handles all conversations.'}
          </p>
        )}
      </div>

      {/* Auto-reply */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={15} className="text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">Auto-Reply</p>
              <p className="text-xs text-slate-400">
                AI handles leads when you are away or offline
              </p>
            </div>
          </div>
          <Toggle enabled={autoReply} onChange={() => setAutoReply((v) => !v)} />
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Bell size={15} className="text-slate-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
            <p className="text-xs text-slate-400">Choose what alerts you receive</p>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {notifItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between px-5 py-4 gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
              </div>
              <Toggle
                enabled={notifications[item.key]}
                onChange={() => toggleNotif(item.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Language Preference */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Globe size={15} className="text-slate-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Language</h2>
            <p className="text-xs text-slate-400">Display language for the dashboard</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'en', label: 'English' },
            { value: 'ar', label: 'Arabic' },
            { value: 'fr', label: 'French' },
          ].map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => setLanguage(lang.value)}
              className={`px-4 py-2 min-h-[44px] rounded-lg border text-sm font-semibold transition-colors ${
                language === lang.value
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 shadow-sm"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check size={15} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
