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
    user_name: 'Charbel Khoury',
    user_phone: '+961 3 712 456',
    status: 'urgent',
    user_requirements: { area: 'Achrafieh', type: 'rent', bedrooms: 2 },
    agent_id: null,
    created_at: '2026-04-01T06:00:00.000Z',
    updated_at: '2026-04-01T07:55:00.000Z',
    messages: [
      { id: 1001, role: 'user', content: 'Hi, saw your listing 3a Achrafieh, 2BR near Sursoq. Still available?', timestamp: '2026-04-01T07:30:00.000Z' },
      { id: 1002, role: 'assistant', content: 'Hey Charbel! Yes still available. 120m2, $1,200/mo, 4th floor. Want to book a viewing?', timestamp: '2026-04-01T07:31:00.000Z' },
      { id: 1003, role: 'user', content: 'fi parking w generator? 3ande 2 kids so parking lazem', timestamp: '2026-04-01T07:33:00.000Z' },
      { id: 1004, role: 'assistant', content: 'Yes to both. Covered parking included and the building has a full generator, 24/7 coverage.', timestamp: '2026-04-01T07:34:00.000Z' },
      { id: 1005, role: 'user', content: 'keef el se3er? negotiable shi? budget 3ande $1,000 max', timestamp: '2026-04-01T07:50:00.000Z' },
      { id: 1006, role: 'assistant', content: 'Owner has some flexibility. I can push for $1,050 if you sign a 2-year contract. Want me to check today?', timestamp: '2026-04-01T07:51:00.000Z' },
      { id: 1007, role: 'user', content: 'yes please do that. iza $1,050 I am in. can we visit Saturday morning?', timestamp: '2026-04-01T07:54:00.000Z' },
      { id: 1008, role: 'assistant', content: 'Saturday 10 AM confirmed. Sending the address now. Owner will be there to meet you.', timestamp: '2026-04-01T07:55:00.000Z' },
    ],
  },
  {
    id: 102,
    user_name: 'Nadia Haddad',
    user_phone: '+961 70 987 234',
    status: 'qualified',
    user_requirements: { area: 'Beit Mery', type: 'rent', duration: 'summer' },
    agent_id: null,
    created_at: '2026-04-01T06:30:00.000Z',
    updated_at: '2026-04-01T07:45:00.000Z',
    messages: [
      { id: 1009, role: 'user', content: 'Marhaba, looking for a furnished villa in Beit Mery for summer. July to end of September. Shu 3andkon?', timestamp: '2026-04-01T06:30:00.000Z' },
      { id: 1010, role: 'assistant', content: 'Ahla Nadia! Two great options right now. First a 4BR villa with pool at $4,500/mo, second a 3BR semi-detached at $2,800/mo. Both fully furnished. Which suits you?', timestamp: '2026-04-01T06:31:00.000Z' },
      { id: 1011, role: 'user', content: 'The pool one sounds perfect. Keef el view? W fi 7adeke kbire?', timestamp: '2026-04-01T06:45:00.000Z' },
      { id: 1012, role: 'assistant', content: 'Panoramic Beirut sea view from the terrace and 500m2 private garden. Very quiet road off the main Beit Mery street, 5 min from the souk.', timestamp: '2026-04-01T06:46:00.000Z' },
      { id: 1013, role: 'user', content: 'Exactly what we need! Can you send photos? W iza possible a visit next Saturday?', timestamp: '2026-04-01T07:44:00.000Z' },
      { id: 1014, role: 'assistant', content: 'Sending the full gallery now. Saturday 11 AM works perfectly, I can meet you there directly.', timestamp: '2026-04-01T07:45:00.000Z' },
    ],
  },
  {
    id: 103,
    user_name: 'Omar Fakih',
    user_phone: '+961 76 543 210',
    status: 'handed_off',
    user_requirements: { area: 'Dbayeh', type: 'rent', bedrooms: 3 },
    agent_id: 1,
    agent: { name: 'Joelle Rizk' },
    created_at: '2026-03-31T10:00:00.000Z',
    updated_at: '2026-04-01T07:20:00.000Z',
    messages: [
      { id: 1015, role: 'user', content: 'Salam, badde apartment 3 ghorfet in Dbayeh or Antelias. Budget around $1,200/month. Fi shi?', timestamp: '2026-03-31T10:00:00.000Z' },
      { id: 1016, role: 'assistant', content: 'Salam Omar! Two options in Dbayeh. 3BR near Dbayeh gate, 130m2, $1,200/mo. Another on the highway side, 150m2, $1,100/mo water included. Furnished or unfurnished?', timestamp: '2026-03-31T10:02:00.000Z' },
      { id: 1017, role: 'user', content: 'Unfurnished, badde e7mel 7ali 3leha. Close to schools? 3ande 2 kids.', timestamp: '2026-03-31T10:15:00.000Z' },
      { id: 1018, role: 'assistant', content: 'The Dbayeh gate apartment is 700m from International College. Very family-friendly building, ground floor parking included.', timestamp: '2026-03-31T10:16:00.000Z' },
      { id: 1019, role: 'user', content: 'W shu el contract terms? Min lease keef?', timestamp: '2026-04-01T07:15:00.000Z' },
      { id: 1020, role: 'assistant', content: 'Standard 1-year minimum, renewable. Owner open to 2 years with a small discount. Passing you now to our agent Joelle to finalize the details.', timestamp: '2026-04-01T07:18:00.000Z' },
      { id: 1021, role: 'user', content: 'ok perfect, shukran ktir', timestamp: '2026-04-01T07:20:00.000Z' },
    ],
  },
  {
    id: 104,
    user_name: 'Rita Sassine',
    user_phone: '+961 3 654 321',
    status: 'new',
    user_requirements: { area: 'Kaslik', type: 'commercial', size: '65m2' },
    agent_id: null,
    created_at: '2026-03-31T09:00:00.000Z',
    updated_at: '2026-03-31T09:30:00.000Z',
    messages: [
      { id: 1022, role: 'user', content: 'Hello, I need a commercial space in Kaslik for a fashion boutique. Around 60-80m2, ground floor preferred. Anything?', timestamp: '2026-03-31T09:00:00.000Z' },
      { id: 1023, role: 'assistant', content: 'Hello Rita! Two ground floor retail spaces right now. One is 70m2 on the main Jounieh road at $1,800/mo. Another is 65m2 in the Kaslik strip at $2,200/mo, much better visibility for fashion.', timestamp: '2026-03-31T09:01:00.000Z' },
      { id: 1024, role: 'user', content: 'Visibility is everything for a boutique. The Kaslik one sounds better. Shu el contract terms?', timestamp: '2026-03-31T09:15:00.000Z' },
      { id: 1025, role: 'assistant', content: '2-year minimum commercial lease. Owner open to a fit-out contribution if you sign 3 years. Large display window, street parking in front. Want to schedule a viewing?', timestamp: '2026-03-31T09:16:00.000Z' },
      { id: 1026, role: 'user', content: 'Yes please! Wednesday or Thursday this week work for me.', timestamp: '2026-03-31T09:30:00.000Z' },
    ],
  },
  {
    id: 105,
    user_name: 'Georges Raad',
    user_phone: '+961 71 123 987',
    status: 'qualified',
    user_requirements: { area: 'Broummana', type: 'rent', duration: 'summer', budget: 4000 },
    agent_id: null,
    created_at: '2026-04-01T05:00:00.000Z',
    updated_at: '2026-04-01T06:50:00.000Z',
    messages: [
      { id: 1027, role: 'user', content: 'Marhaba, looking for a chalet in Broummana for the full summer. Ma3 family, 2 kids. Budget $3,000 to $4,000/month.', timestamp: '2026-04-01T05:00:00.000Z' },
      { id: 1028, role: 'assistant', content: 'Marhaba Georges! Perfect timing. Just listed: 3BR chalet in Broummana, 180m2, fully furnished, mountain view, outdoor BBQ area. $3,500/mo, available June 1.', timestamp: '2026-04-01T05:01:00.000Z' },
      { id: 1029, role: 'user', content: 'Sounds great! Fi parking? W shu 3an internet, super important li 3amle min el bayt.', timestamp: '2026-04-01T05:10:00.000Z' },
      { id: 1030, role: 'assistant', content: 'Covered parking for 2 cars. Fiber at 200Mbps installed. Quiet compound with shared garden, owner is Beirut-based so the place is all yours all summer.', timestamp: '2026-04-01T05:11:00.000Z' },
      { id: 1031, role: 'user', content: 'Excellent! Possible to visit this Saturday? Badde ji ma3 my wife.', timestamp: '2026-04-01T06:45:00.000Z' },
      { id: 1032, role: 'assistant', content: 'Saturday works. 10 AM or 2 PM, which suits you better? I will send the location on Google Maps.', timestamp: '2026-04-01T06:50:00.000Z' },
    ],
  },
  {
    id: 106,
    user_name: 'Maya Khalil',
    user_phone: '+961 78 456 321',
    status: 'new',
    user_requirements: { area: 'Kaslik', type: 'buy', budget: 230000 },
    agent_id: null,
    created_at: '2026-04-01T08:00:00.000Z',
    updated_at: '2026-04-01T09:40:00.000Z',
    messages: [
      { id: 1033, role: 'user', content: 'Hi! Me and my husband are looking to buy our first apartment near Kaslik. Budget $200-230k. Shu 3andkon?', timestamp: '2026-04-01T08:00:00.000Z' },
      { id: 1034, role: 'assistant', content: 'Hello Maya! Congrats on the search! I have a 100m2 duplex in Kaslik, 2BR plus mezzanine, $215,000. Sea view from the upper level, built 2018, excellent condition.', timestamp: '2026-04-01T08:02:00.000Z' },
      { id: 1035, role: 'user', content: 'That sounds beautiful. How is the building managed? Fi generator full time?', timestamp: '2026-04-01T08:05:00.000Z' },
      { id: 1036, role: 'assistant', content: 'Very well managed, generator covers 24/7. Rooftop terrace with sea view. Building fees are $150/month, one parking spot included.', timestamp: '2026-04-01T08:06:00.000Z' },
      { id: 1037, role: 'user', content: 'Is there structural space to add a second bathroom? Badde eji shoofa this week iza possible.', timestamp: '2026-04-01T09:35:00.000Z' },
      { id: 1038, role: 'assistant', content: 'Yes there is room on the lower level for a second bathroom, architect confirmed it. Thursday or Friday this week work for a visit?', timestamp: '2026-04-01T09:40:00.000Z' },
    ],
  },
  {
    id: 107,
    user_name: 'Tarek Mansour',
    user_phone: '+961 76 234 897',
    status: 'qualified',
    user_requirements: { area: 'Jounieh', type: 'buy', view: 'sea', budget: 400000 },
    agent_id: null,
    created_at: '2026-03-30T11:00:00.000Z',
    updated_at: '2026-04-01T08:10:00.000Z',
    messages: [
      { id: 1039, role: 'user', content: 'Marhaba, I have been looking at sea view apartments in Jounieh for a while. Serious buyer, budget up to $400k. Shu 3andkon?', timestamp: '2026-03-30T11:00:00.000Z' },
      { id: 1040, role: 'assistant', content: 'Marhaba Tarek! Best right now: 180m2 on the 8th floor in Jounieh, panoramic sea and mountain view, $380,000. 2021 building, 2 parking, rooftop access.', timestamp: '2026-03-30T11:02:00.000Z' },
      { id: 1041, role: 'user', content: 'Very promising. Keef el building? Shu 3amaro w how many floors?', timestamp: '2026-03-30T11:15:00.000Z' },
      { id: 1042, role: 'assistant', content: 'Completed 2021, 12 floors total. 24/7 security and concierge. High-end finishes, kitchen appliances included. Owner invested heavily in the fit-out.', timestamp: '2026-03-30T11:16:00.000Z' },
      { id: 1043, role: 'user', content: 'I want to move fast on this. Can we visit tomorrow or the day after?', timestamp: '2026-04-01T08:00:00.000Z' },
      { id: 1044, role: 'assistant', content: 'Tomorrow at 3 PM or Thursday at 10 AM, both work for the owner. Which do you prefer? I will confirm the appointment right away.', timestamp: '2026-04-01T08:10:00.000Z' },
    ],
  },
  {
    id: 108,
    user_name: 'Carla Abi Saab',
    user_phone: '+961 71 567 890',
    status: 'new',
    user_requirements: { area: 'Dbayeh', type: 'buy', property_type: 'villa', budget: 950000 },
    agent_id: null,
    created_at: '2026-04-01T09:00:00.000Z',
    updated_at: '2026-04-01T09:30:00.000Z',
    messages: [
      { id: 1045, role: 'user', content: 'Hello, my family is looking to buy a standalone villa in Dbayeh. 4+ bedrooms, garden. Budget $800k to $1M. Fi shi?', timestamp: '2026-04-01T09:00:00.000Z' },
      { id: 1046, role: 'assistant', content: 'Hello Carla! Great budget for Dbayeh. I have a 350m2 villa, 4BR, 3 bathrooms, 600m2 garden with pool. Listed at $950,000, ready to move in.', timestamp: '2026-04-01T09:01:00.000Z' },
      { id: 1047, role: 'user', content: 'Very interesting! Shu 3amaro? W keef el neighborhood, fi security?', timestamp: '2026-04-01T09:20:00.000Z' },
      { id: 1048, role: 'assistant', content: 'Built 2010, fully renovated 2022, excellent condition. Gated community in one of Dbayeh\'s most established areas, 24/7 guard, mostly family neighbors.', timestamp: '2026-04-01T09:22:00.000Z' },
      { id: 1049, role: 'user', content: 'Is the price negotiable? W how long has it been on the market?', timestamp: '2026-04-01T09:29:00.000Z' },
      { id: 1050, role: 'assistant', content: 'On the market 3 weeks. Owner is open to $920,000 for a serious buyer who moves quickly. Worth a visit to see for yourself, the garden alone is stunning.', timestamp: '2026-04-01T09:30:00.000Z' },
    ],
  },
  {
    id: 109,
    user_name: 'Fadi Gemayel',
    user_phone: '+961 3 321 654',
    status: 'qualified',
    user_requirements: { area: 'Antelias', type: 'commercial', size: '60m2' },
    agent_id: null,
    created_at: '2026-03-31T11:00:00.000Z',
    updated_at: '2026-04-01T08:10:00.000Z',
    messages: [
      { id: 1051, role: 'user', content: 'Hi, looking for office space in Antelias, around 50-70m2 for a team of 5-6 people.', timestamp: '2026-03-31T11:00:00.000Z' },
      { id: 1052, role: 'assistant', content: 'Hello Fadi! Two options in Antelias. First is 60m2 on the commercial strip, renovated, $900/mo. Second is 55m2 near the Coca-Cola roundabout in a newer building, $1,100/mo with 24/7 generator.', timestamp: '2026-03-31T11:02:00.000Z' },
      { id: 1053, role: 'user', content: 'The second sounds better for a professional setup. Available now? Badna ne7jezha ASAP.', timestamp: '2026-03-31T11:15:00.000Z' },
      { id: 1054, role: 'assistant', content: 'Available immediately. Owner can do 6 months to start if you need flexibility. I can arrange a viewing today or tomorrow.', timestamp: '2026-03-31T11:16:00.000Z' },
      { id: 1055, role: 'user', content: 'I visited the Mar Mikhael studio yesterday by accident haha. Meant the Antelias one. Can we go tomorrow at 11am?', timestamp: '2026-04-01T07:55:00.000Z' },
      { id: 1056, role: 'assistant', content: 'Tomorrow 11 AM confirmed at the Antelias office. Sending the address now. Owner will have the keys ready for you.', timestamp: '2026-04-01T08:10:00.000Z' },
    ],
  },
  {
    id: 110,
    user_name: 'Lara Daher',
    user_phone: '+961 70 789 654',
    status: 'closed',
    user_requirements: { area: 'Achrafieh', type: 'rent', size: 'studio' },
    agent_id: 1,
    agent: { name: 'Joelle Rizk' },
    created_at: '2026-03-20T10:00:00.000Z',
    updated_at: '2026-03-25T15:00:00.000Z',
    messages: [
      { id: 1057, role: 'user', content: 'Hi I am a student looking for a furnished studio in Achrafieh. Budget $600-750/mo. Anything?', timestamp: '2026-03-20T10:00:00.000Z' },
      { id: 1058, role: 'assistant', content: 'Hello Lara! A 45m2 furnished studio on rue Monot, $700/mo. 2nd floor, great natural light, updated kitchen. Generator covered in the rent.', timestamp: '2026-03-20T10:01:00.000Z' },
      { id: 1059, role: 'user', content: 'Sounds perfect. Visited yesterday ma3 my parents and we loved it.', timestamp: '2026-03-25T14:45:00.000Z' },
      { id: 1060, role: 'assistant', content: 'So happy to hear that! Ready to move forward with the paperwork?', timestamp: '2026-03-25T14:46:00.000Z' },
      { id: 1061, role: 'user', content: 'Yes please. Joelle said she will handle the contract. Shukran ktir for everything!', timestamp: '2026-03-25T14:58:00.000Z' },
      { id: 1062, role: 'assistant', content: 'Congrats on the new studio Lara! Joelle will be in touch shortly. Enjoy Achrafieh!', timestamp: '2026-03-25T15:00:00.000Z' },
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
  const [selected, setSelected] = useState<Conversation | null>(null);
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
      .catch(() => {
        if (!cancelled) {
          const mockConvo = MOCK_CONVERSATIONS.find((c) => c.id === selected.id) ?? selected;
          setDetail(mockConvo);
          setLoadingDetail(false);
        }
      });
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
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${avatarColor(c.id)}`}>
                      {c.user_name ? initials(c.user_name) : c.user_phone.slice(-2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-medium text-slate-900 text-sm truncate">
                          {c.user_name ?? c.user_phone}
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
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${avatarColor(detail.id)}`}>
                      {detail.user_name ? initials(detail.user_name) : detail.user_phone.slice(-2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-sm">
                          {detail.user_name ?? detail.user_phone}
                        </span>
                        {detail.user_name && (
                          <span className="text-xs text-slate-400">{detail.user_phone}</span>
                        )}
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
