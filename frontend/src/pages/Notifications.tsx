import { useState } from 'react';
import { Users, Calendar, UserCog, Settings, Bell, CheckCheck } from 'lucide-react';

type NotifType = 'lead' | 'tour' | 'agent' | 'system';

type Notification = {
  id: number;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: NotifType;
};

const ALL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'New lead from WhatsApp',
    body: 'Charbel Khoury is asking about a 2BR in Achrafieh',
    time: '2 min ago',
    read: false,
    type: 'lead',
  },
  {
    id: 2,
    title: 'Tour booked',
    body: 'Nadia Haddad scheduled a visit for the Beit Mery villa on Saturday 11 AM',
    time: '18 min ago',
    read: false,
    type: 'tour',
  },
  {
    id: 3,
    title: 'Agent handoff requested',
    body: 'Omar Fakih qualified and is ready for an agent in Dbayeh',
    time: '45 min ago',
    read: false,
    type: 'agent',
  },
  {
    id: 4,
    title: 'New lead from Instagram',
    body: 'Karim Mouawad is interested in a villa in Broummana, budget $600k',
    time: '1h ago',
    read: true,
    type: 'lead',
  },
  {
    id: 5,
    title: 'Tour completed',
    body: 'Tony Frem completed the tour for the Mar Mikhael studio. Feedback: positive',
    time: '2h ago',
    read: true,
    type: 'tour',
  },
  {
    id: 6,
    title: 'AI routing update',
    body: '3 conversations waiting for agent review',
    time: '3h ago',
    read: true,
    type: 'system',
  },
  {
    id: 7,
    title: 'New lead from WhatsApp',
    body: 'Maya Rizk is asking about a penthouse in Rawche, budget $1.2M',
    time: '4h ago',
    read: true,
    type: 'lead',
  },
  {
    id: 8,
    title: 'Agent assigned',
    body: 'George Karam was assigned to the Dbayeh lead from this morning',
    time: '5h ago',
    read: true,
    type: 'agent',
  },
  {
    id: 9,
    title: 'Tour rescheduled',
    body: 'Rami Saab moved his Baabda apartment tour from Thursday to Friday 3 PM',
    time: '6h ago',
    read: true,
    type: 'tour',
  },
  {
    id: 10,
    title: 'New lead from website',
    body: 'Layla Hanna submitted a form asking about 3BR apartments in Jdeideh',
    time: '8h ago',
    read: true,
    type: 'lead',
  },
  {
    id: 11,
    title: 'System alert',
    body: 'WhatsApp message queue was delayed by 4 minutes due to Meta API latency',
    time: '10h ago',
    read: true,
    type: 'system',
  },
  {
    id: 12,
    title: 'New lead from Facebook',
    body: 'Elie Najem inquired about a warehouse in Zouk Mosbeh for commercial use',
    time: 'Yesterday',
    read: true,
    type: 'lead',
  },
  {
    id: 13,
    title: 'Tour booked',
    body: 'Sandra Abou Jaoude booked a tour for the Antelias duplex next Tuesday at 2 PM',
    time: 'Yesterday',
    read: true,
    type: 'tour',
  },
  {
    id: 14,
    title: 'Agent handoff requested',
    body: 'Dany Abi Nader is qualified and ready to speak with an agent for the Metn villa',
    time: 'Yesterday',
    read: true,
    type: 'agent',
  },
  {
    id: 15,
    title: 'System alert',
    body: 'AI conversation engine processed 47 leads in the last 24 hours',
    time: '2 days ago',
    read: true,
    type: 'system',
  },
];

type Filter = 'all' | NotifType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'lead', label: 'New Lead' },
  { key: 'tour', label: 'Tour Booked' },
  { key: 'agent', label: 'Agent Assignment' },
  { key: 'system', label: 'System' },
];

const TYPE_CONFIG: Record<
  NotifType,
  { Icon: React.ComponentType<{ size?: number; className?: string }>; bg: string; text: string }
> = {
  lead: { Icon: Users, bg: 'bg-brand-100', text: 'text-brand-600' },
  tour: { Icon: Calendar, bg: 'bg-emerald-100', text: 'text-emerald-600' },
  agent: { Icon: UserCog, bg: 'bg-amber-100', text: 'text-amber-600' },
  system: { Icon: Settings, bg: 'bg-slate-100', text: 'text-slate-600' },
};

export default function Notifications() {
  const [filter, setFilter] = useState<Filter>('all');
  const [notifications, setNotifications] = useState<Notification[]>(ALL_NOTIFICATIONS);

  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
            <Bell size={18} className="text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const count =
            f.key === 'all'
              ? notifications.length
              : notifications.filter((n) => n.type === f.key).length;
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <Bell size={32} className="opacity-40" />
            <p className="text-sm font-medium">No notifications here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((n) => {
              const { Icon, bg, text } = TYPE_CONFIG[n.type];
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markRead(n.id)}
                  className={`w-full text-left px-5 py-4 flex gap-4 items-start hover:bg-slate-50 transition-colors ${
                    !n.read ? 'bg-brand-50/30' : ''
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${bg}`}
                  >
                    <Icon size={16} className={text} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={`text-sm font-semibold leading-snug ${
                          !n.read ? 'text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {n.title}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-slate-400 whitespace-nowrap">{n.time}</span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{n.body}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
