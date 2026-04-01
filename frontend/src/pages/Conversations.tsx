import { useState, useEffect, useRef } from 'react';
import {
  getConversations,
  getConversation,
  getAgents,
  assignAgentToConversation,
  updateConversationStatus,
} from '../api';
import type { Agent } from '../api';
import { useRole } from '../context/RoleContext';
import {
  MessageSquare,
  Loader2,
  UserPlus,
  Info,
  X,
  ChevronDown,
  Bot,
} from 'lucide-react';

type Message = {
  id: number;
  role: string;
  content: string;
  timestamp: string;
};

type Conversation = {
  id: number;
  user_phone: string;
  user_name?: string;
  status: string;
  user_requirements: Record<string, unknown> | null;
  agent_id: number | null;
  agent?: { name: string } | null;
  created_at: string;
  updated_at: string | null;
  messages?: Message[];
};

const AVATAR_COLORS = [
  'bg-brand-100 text-brand-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
  'bg-cyan-100 text-cyan-700',
];

function avatarColor(id: number): string {
  return AVATAR_COLORS[(id - 101) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  const p = name.trim().split(' ');
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : p[0].slice(0, 2).toUpperCase();
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  new:        { label: 'New',     cls: 'bg-emerald-100 text-emerald-700' },
  qualified:  { label: 'Hot',     cls: 'bg-rose-100 text-rose-700' },
  handed_off: { label: 'Waiting', cls: 'bg-blue-100 text-blue-700' },
  closed:     { label: 'Cold',    cls: 'bg-slate-100 text-slate-500' },
  urgent:     { label: 'Urgent',  cls: 'bg-red-100 text-red-700' },
};

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 101,
    user_phone: 'Rami Khoury',
    status: 'urgent',
    user_requirements: null,
    agent_id: null,
    created_at: '2026-03-31T06:00:00.000Z',
    updated_at: '2026-04-01T07:55:00.000Z',
    messages: [
      { id: 1001, role: 'user', content: 'Hi, I saw your listing on OLX. 2BR in Achrafieh still available?', timestamp: '2026-04-01T07:30:00.000Z' },
      { id: 1002, role: 'assistant', content: 'Hey Rami! Yes still available. 2BR, 120m\u00b2, $1,200/mo. Want to book a viewing?', timestamp: '2026-04-01T07:31:00.000Z' },
      { id: 1003, role: 'user', content: 'fi parking w generator?', timestamp: '2026-04-01T07:33:00.000Z' },
      { id: 1004, role: 'assistant', content: 'Yes to both. Covered parking included and the building has a 150KVA generator with full coverage.', timestamp: '2026-04-01T07:34:00.000Z' },
      { id: 1005, role: 'user', content: 'keef el se3er? negotiable shi?', timestamp: '2026-04-01T07:50:00.000Z' },
      { id: 1006, role: 'assistant', content: 'The owner has some flexibility. What budget did you have in mind? I can check with them today.', timestamp: '2026-04-01T07:51:00.000Z' },
      { id: 1007, role: 'user', content: 'baddi 1000 max. 3andi 2 eyyel w el parking lazem ykon fi', timestamp: '2026-04-01T07:54:00.000Z' },
      { id: 1008, role: 'assistant', content: 'Got it. Let me reach out to the owner now. Can you do a viewing this week?', timestamp: '2026-04-01T07:55:00.000Z' },
    ],
  },
  {
    id: 102,
    user_phone: 'Nadia Saade',
    status: 'new',
    user_requirements: null,
    agent_id: null,
    created_at: '2026-04-01T06:30:00.000Z',
    updated_at: '2026-04-01T07:45:00.000Z',
    messages: [
      { id: 1009, role: 'user', content: 'Good morning! Looking for a 2BR in Achrafieh or Gemmayzeh. Budget $900/mo.', timestamp: '2026-04-01T06:30:00.000Z' },
      { id: 1010, role: 'assistant', content: 'Good morning Nadia! Great area. I have 3 options matching your budget. Furnished or unfurnished?', timestamp: '2026-04-01T06:31:00.000Z' },
      { id: 1011, role: 'user', content: 'semi furnished w lazem ykon fi elevator. ma baddi ground floor', timestamp: '2026-04-01T06:45:00.000Z' },
      { id: 1012, role: 'assistant', content: 'Perfect. Two options have elevators. One on Rue Sursock, the other near Sassine Square. Want me to send details?', timestamp: '2026-04-01T06:46:00.000Z' },
      { id: 1013, role: 'user', content: 'yes please send them', timestamp: '2026-04-01T07:44:00.000Z' },
      { id: 1014, role: 'assistant', content: 'Sent! The Sassine one has a balcony with a great view. Which interests you more?', timestamp: '2026-04-01T07:45:00.000Z' },
    ],
  },
  {
    id: 103,
    user_phone: 'Tony Frem',
    status: 'qualified',
    user_requirements: null,
    agent_id: 1,
    agent: { name: 'Joelle Rizk' },
    created_at: '2026-03-30T10:00:00.000Z',
    updated_at: '2026-04-01T07:20:00.000Z',
    messages: [
      { id: 1015, role: 'user', content: 'Hi, I want to buy a 3BR in Dbayeh. What do you have?', timestamp: '2026-03-30T10:00:00.000Z' },
      { id: 1016, role: 'assistant', content: 'Hey Tony! I have a great 3BR in Dbayeh near the highway. 180m\u00b2, $380,000. Sea view from the master bedroom.', timestamp: '2026-03-30T10:02:00.000Z' },
      { id: 1017, role: 'user', content: 'shu el advance lazem?', timestamp: '2026-03-30T10:15:00.000Z' },
      { id: 1018, role: 'assistant', content: 'Standard is 3 months advance. Owner is open to 2 months if you sign a 2-year contract.', timestamp: '2026-03-30T10:16:00.000Z' },
      { id: 1019, role: 'user', content: 'ana baddi 350k max. fi room for negotiation?', timestamp: '2026-04-01T07:15:00.000Z' },
      { id: 1020, role: 'assistant', content: 'I passed your offer. They came back at $365k, that is their final number. Strong deal for the size and view.', timestamp: '2026-04-01T07:18:00.000Z' },
      { id: 1021, role: 'user', content: 'ok let me think and call you tomorrow', timestamp: '2026-04-01T07:20:00.000Z' },
    ],
  },
  {
    id: 104,
    user_phone: 'Maya Nassar',
    status: 'handed_off',
    user_requirements: null,
    agent_id: 2,
    agent: { name: 'Elie Khoury' },
    created_at: '2026-03-28T09:00:00.000Z',
    updated_at: '2026-03-31T16:30:00.000Z',
    messages: [
      { id: 1022, role: 'user', content: 'Hello, I toured the apartment in Kaslik yesterday with Elie. I want to proceed.', timestamp: '2026-03-31T14:00:00.000Z' },
      { id: 1023, role: 'assistant', content: 'Amazing Maya! I will let Elie know. He will prepare the contract today.', timestamp: '2026-03-31T14:01:00.000Z' },
      { id: 1024, role: 'user', content: 'when can I sign?', timestamp: '2026-03-31T14:10:00.000Z' },
      { id: 1025, role: 'assistant', content: 'Elie can meet you Thursday at 3 PM at the office. Does that work?', timestamp: '2026-03-31T14:11:00.000Z' },
      { id: 1026, role: 'user', content: 'Thursday works. See you then', timestamp: '2026-03-31T16:30:00.000Z' },
    ],
  },
  {
    id: 105,
    user_phone: 'Hassan Mourad',
    status: 'new',
    user_requirements: null,
    agent_id: null,
    created_at: '2026-04-01T05:00:00.000Z',
    updated_at: '2026-04-01T06:50:00.000Z',
    messages: [
      { id: 1027, role: 'user', content: 'Marhaba, baddi villa fi Broummana aw Beit Mery. 4 ghorf w pool if possible', timestamp: '2026-04-01T05:00:00.000Z' },
      { id: 1028, role: 'assistant', content: 'Ahla Hassan! I have a stunning 4BR villa in Beit Mery with a pool and mountain views. $2,800/mo. Want the full details?', timestamp: '2026-04-01T05:01:00.000Z' },
      { id: 1029, role: 'user', content: 'yes send. w fi garage?', timestamp: '2026-04-01T05:10:00.000Z' },
      { id: 1030, role: 'assistant', content: 'Double garage included. 350m\u00b2 built up, 600m\u00b2 land. Garden with BBQ area. Sending full photos now.', timestamp: '2026-04-01T05:11:00.000Z' },
      { id: 1031, role: 'user', content: 'wow looks amazing. when can I visit?', timestamp: '2026-04-01T06:45:00.000Z' },
      { id: 1032, role: 'assistant', content: 'I have Saturday 11 AM or Sunday 2 PM. Which works for you?', timestamp: '2026-04-01T06:50:00.000Z' },
    ],
  },
  {
    id: 106,
    user_phone: 'Lara Bou Jawde',
    status: 'urgent',
    user_requirements: null,
    agent_id: null,
    created_at: '2026-04-01T08:00:00.000Z',
    updated_at: '2026-04-01T09:40:00.000Z',
    messages: [
      { id: 1033, role: 'user', content: 'URGENT. I need an apartment before end of this week. Hamra or Ras Beirut. Max $800/mo', timestamp: '2026-04-01T08:00:00.000Z' },
      { id: 1034, role: 'assistant', content: 'Lara I am on it. 1BR in Hamra near AUB at $750/mo, available immediately. Also a studio on Bliss St for $650. Want to see both today?', timestamp: '2026-04-01T08:02:00.000Z' },
      { id: 1035, role: 'user', content: 'yes both please. fi washing machine?', timestamp: '2026-04-01T08:05:00.000Z' },
      { id: 1036, role: 'assistant', content: 'The Hamra 1BR has washer and dryer. Studio has hookup only. Both have generator and water tank.', timestamp: '2026-04-01T08:06:00.000Z' },
      { id: 1037, role: 'user', content: 'ok I prefer the 1BR. can I see it at 5pm today?', timestamp: '2026-04-01T09:35:00.000Z' },
      { id: 1038, role: 'assistant', content: 'Confirmed. 5 PM today at the Hamra apartment. Sending the exact address now. The owner will be there.', timestamp: '2026-04-01T09:40:00.000Z' },
    ],
  },
  {
    id: 107,
    user_phone: 'Karim Abi Saab',
    status: 'closed',
    user_requirements: null,
    agent_id: 1,
    agent: { name: 'Joelle Rizk' },
    created_at: '2026-03-20T10:00:00.000Z',
    updated_at: '2026-03-25T15:00:00.000Z',
    messages: [
      { id: 1039, role: 'user', content: 'Hi I was interested in the Batroun apartment but I found something else. Thanks anyway.', timestamp: '2026-03-25T14:55:00.000Z' },
      { id: 1040, role: 'assistant', content: 'No worries Karim! If anything changes or you need help in the future, we are always here. Good luck with the new place!', timestamp: '2026-03-25T15:00:00.000Z' },
    ],
  },
  {
    id: 108,
    user_phone: 'Rita Haddad',
    status: 'new',
    user_requirements: null,
    agent_id: null,
    created_at: '2026-04-01T09:00:00.000Z',
    updated_at: '2026-04-01T09:30:00.000Z',
    messages: [
      { id: 1041, role: 'user', content: 'Hi! Looking for a 2BR in Jounieh or Kaslik. Budget $1,000/mo', timestamp: '2026-04-01T09:00:00.000Z' },
      { id: 1042, role: 'assistant', content: 'Hi Rita! I have 4 options in that area. All 2BR, all within budget. Sea view preference? It adds about $100-150 to the price.', timestamp: '2026-04-01T09:01:00.000Z' },
      { id: 1043, role: 'user', content: 'sea view would be amazing. wlw w generator a must', timestamp: '2026-04-01T09:20:00.000Z' },
      { id: 1044, role: 'assistant', content: 'I have one that ticks all boxes. 5th floor in Kaslik, sea view, full generator, water tank. $1,050/mo. Slightly over but worth it. Want to see it?', timestamp: '2026-04-01T09:22:00.000Z' },
      { id: 1045, role: 'user', content: '3andi appointment bukra at 10am. can we schedule a tour after?', timestamp: '2026-04-01T09:29:00.000Z' },
      { id: 1046, role: 'assistant', content: 'Booked for 11:30 AM tomorrow at the Kaslik apartment. I will confirm with the owner and send the address.', timestamp: '2026-04-01T09:30:00.000Z' },
    ],
  },
  {
    id: 109,
    user_phone: 'Fadi Gemayel',
    status: 'qualified',
    user_requirements: null,
    agent_id: null,
    created_at: '2026-03-31T11:00:00.000Z',
    updated_at: '2026-04-01T08:10:00.000Z',
    messages: [
      { id: 1047, role: 'user', content: 'I visited the Mar Mikhael studio yesterday. I want to rent it.', timestamp: '2026-04-01T07:50:00.000Z' },
      { id: 1048, role: 'assistant', content: 'Excellent Fadi! The owner is very interested. Shall I proceed with the contract paperwork?', timestamp: '2026-04-01T07:51:00.000Z' },
      { id: 1049, role: 'user', content: 'yes. shu el documents needed?', timestamp: '2026-04-01T07:55:00.000Z' },
      { id: 1050, role: 'assistant', content: 'You need: ID copy, 3 months bank statement, and 2 guarantor letters. Once ready I can schedule signing within 48 hours.', timestamp: '2026-04-01T07:56:00.000Z' },
      { id: 1051, role: 'user', content: 'ok will prepare them today', timestamp: '2026-04-01T08:00:00.000Z' },
      { id: 1052, role: 'assistant', content: 'Perfect. Send them over on WhatsApp when ready. I will have the contract drafted by then.', timestamp: '2026-04-01T08:10:00.000Z' },
    ],
  },
];

function getBadge(status: string) {
  return STATUS_BADGE[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' };
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function isAiActive(c: Conversation): boolean {
  return c.agent_id == null && c.status !== 'closed';
}

export default function Conversations() {
  useRole();
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selected, setSelected] = useState<Conversation | null>(MOCK_CONVERSATIONS[0]);
  const [detail, setDetail] = useState<Conversation | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [assigningAgent, setAssigningAgent] = useState(false);
  const [endingChat, setEndingChat] = useState(false);
  const [listFilter, setListFilter] = useState<'All' | 'AI Active' | 'Agent' | 'Waiting'>('All');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiActiveCount = conversations.filter(isAiActive).length;

  const filteredConversations = conversations.filter((c) => {
    if (listFilter === 'All') return true;
    if (listFilter === 'AI Active') return isAiActive(c);
    if (listFilter === 'Agent') return c.agent_id != null;
    if (listFilter === 'Waiting') return c.status === 'handed_off' || c.status === 'waiting';
    return true;
  });

  const loadList = async () => {
    try {
      setError(null);
      const res = await getConversations();
      const list: Conversation[] = res.data || [];
      if (list.length > 0) {
        setConversations(list);
        setSelected((prev) => {
          if (!prev && list.length > 0) return list[0];
          return prev;
        });
      }
    } catch {
      // keep mock data on error
    }
  };

  useEffect(() => {
    loadList();
    const interval = setInterval(loadList, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    let cancelled = false;
    setLoadingDetail(true);
    setDetail(null);
    getConversation(selected.id)
      .then((res) => { if (!cancelled) { setDetail(res.data); setLoadingDetail(false); } })
      .catch(() => { if (!cancelled) { setDetail(selected); setLoadingDetail(false); } });
    return () => { cancelled = true; };
  }, [selected?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [detail?.messages?.length]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowAgentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAssignAgentOpen = async () => {
    if (agents.length === 0) {
      try {
        const res = await getAgents();
        setAgents(res.data || []);
      } catch { /* ignore */ }
    }
    setShowAgentDropdown((v) => !v);
  };

  const handleAssignAgent = async (agentId: number) => {
    if (!selected) return;
    setAssigningAgent(true);
    try {
      await assignAgentToConversation(selected.id, agentId);
      setShowAgentDropdown(false);
      await loadList();
    } catch { /* ignore */ }
    finally { setAssigningAgent(false); }
  };

  const handleEndChat = async () => {
    if (!selected) return;
    setEndingChat(true);
    try {
      await updateConversationStatus(selected.id, 'closed');
      await loadList();
    } catch { /* ignore */ }
    finally { setEndingChat(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] min-h-[560px]">
      {error && (
        <div className="mb-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex-shrink-0">
          {error}
        </div>
      )}

      <div className="flex flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-80 flex-shrink-0 border-r border-slate-200 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <h2 className="font-semibold text-slate-900 text-base">Conversations</h2>
            {aiActiveCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2.5 py-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                AI Active ({aiActiveCount})
              </span>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex border-b border-slate-100 flex-shrink-0">
            {(['All', 'AI Active', 'Agent', 'Waiting'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setListFilter(tab)}
                className={`flex-1 px-1 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  listFilter === tab
                    ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/40'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                <MessageSquare className="mx-auto h-10 w-10 text-slate-200 mb-2" />
                No conversations yet
              </div>
            ) : (
              filteredConversations.map((c) => {
                const lastMsg = c.messages?.[c.messages.length - 1];
                const b = getBadge(c.status);
                const isSelected = selected?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelected(c)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-brand-50' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-sm font-semibold text-brand-700 flex-shrink-0">
                      {c.user_phone.slice(-2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-medium text-slate-900 text-sm truncate">
                          {c.user_phone}
                        </span>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {timeAgo(c.updated_at ?? c.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${b.cls}`}>
                          {b.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          {c.agent_id
                            ? `Agent: ${c.agent?.name ?? 'Assigned'}`
                            : 'AI Active'}
                        </span>
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {lastMsg.content.length > 50
                            ? lastMsg.content.slice(0, 50) + '...'
                            : lastMsg.content}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
              <MessageSquare className="w-12 h-12 text-slate-200" />
              <p className="text-sm">Select a conversation</p>
            </div>
          ) : loadingDetail ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            </div>
          ) : detail ? (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-slate-200 bg-white flex-shrink-0">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {/* Contact info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-sm font-semibold text-brand-700 flex-shrink-0">
                      {detail.user_phone.slice(-2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{detail.user_phone}</span>
                        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          Online
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getBadge(detail.status).cls}`}>
                          {getBadge(detail.status).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={handleAssignAgentOpen}
                        disabled={assigningAgent}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                      >
                        {assigningAgent
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <UserPlus className="w-3.5 h-3.5" />}
                        Assign Agent
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      {showAgentDropdown && (
                        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-1 overflow-hidden">
                          {agents.length === 0 ? (
                            <p className="px-3 py-2 text-xs text-slate-400">No agents available</p>
                          ) : (
                            agents.map((a) => (
                              <button
                                key={a.id}
                                type="button"
                                onClick={() => handleAssignAgent(a.id)}
                                className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                {a.name}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={handleEndChat}
                      disabled={endingChat || detail.status === 'closed'}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-40 transition-colors"
                    >
                      {endingChat
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <X className="w-3.5 h-3.5" />}
                      End Chat
                    </button>
                  </div>
                </div>
              </div>

              {/* Message thread */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {(detail.messages ?? []).map((m) => {
                  const isUser = m.role === 'user';
                  return (
                    <div key={m.id} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                      <div
                        className={`max-w-[72%] rounded-2xl px-4 py-2.5 ${
                          isUser
                            ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                            : 'bg-brand-600 text-white rounded-tr-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
                        <p className={`text-xs mt-1 ${isUser ? 'text-slate-400' : 'text-white/60'}`}>
                          {new Date(m.timestamp).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {!isUser && ' · AI'}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* AI typing indicator */}
                {isAiActive(detail) && (
                  <div className="flex justify-end">
                    <div className="bg-brand-600 rounded-2xl rounded-tr-sm px-4 py-2.5 flex items-center gap-1.5">
                      <span className="text-xs text-white/70 mr-1">AI is typing</span>
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-white/70 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="px-4 py-3 border-t border-slate-200 bg-white flex-shrink-0">
                {isAiActive(detail) ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <Bot className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <span className="text-sm text-slate-500">AI is handling this conversation</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Failed to load messages
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
