import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getConversations,
  getConversation,
  getAgents,
  assignAgentToConversation,
  updateConversationStatus,
} from '../api';
import type { Agent } from '../api';
import { useRole } from '../context/RoleContext';
import { toast } from '../utils/toast';
import {
  MessageSquare,
  Loader2,
  UserPlus,
  X,
  ChevronDown,
  ChevronLeft,
  Bot,
  Search,
  Send,
  Activity,
} from 'lucide-react';

type Message = {
  id: number;
  role: string;
  content: string;
  timestamp: string;
};

type StepEvent = {
  id: string;
  timestamp: string;
  label: string;
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

// Solid avatar background colors matching the mockup palette
const AVATAR_BG_COLORS = [
  '#2060e8', '#7c3aed', '#0891b2', '#be185d',
  '#0f766e', '#c2410c', '#dc2626', '#16a34a', '#d97706', '#64748b',
];

function avatarBg(id: number): string {
  return AVATAR_BG_COLORS[Math.abs(id) % AVATAR_BG_COLORS.length];
}

function initials(name: string): string {
  const p = name.trim().split(' ');
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : p[0].slice(0, 2).toUpperCase();
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  new:        { label: 'New',     cls: 'bg-emerald-100 text-emerald-700' },
  qualified:  { label: 'Hot',     cls: 'bg-amber-100 text-amber-700' },
  handed_off: { label: 'Waiting', cls: 'bg-blue-100 text-blue-700' },
  closed:     { label: 'Closed',  cls: 'bg-slate-100 text-slate-500' },
  urgent:     { label: 'Urgent',  cls: 'bg-red-100 text-red-700' },
};

// Conversations with simulated unread messages
const UNREAD_IDS = new Set([102, 104]);

// Matching listings per conversation id
const CONV_LISTINGS: Record<number, Array<{ title: string; details: string; tags: string[] }>> = {
  101: [
    { title: '2BR Apt, Rue Sursock', details: '120m2 · 4th floor · $1,200/mo', tags: ['Parking', 'Generator'] },
    { title: '2BR Apt, Sassine Square', details: '105m2 · 3rd floor · $980/mo', tags: [] },
  ],
  102: [
    { title: '4BR Villa with Pool, Beit Mery', details: '500m2 garden · Sea view · $4,500/mo', tags: ['Pool', 'Furnished'] },
    { title: '3BR Villa, Beit Mery', details: 'Fully furnished · $2,800/mo', tags: ['Furnished'] },
  ],
  105: [
    { title: '3BR Chalet, Broummana', details: '180m2 · Mountain view · $3,500/mo', tags: ['Parking', 'Fiber'] },
  ],
  107: [
    { title: '180m2, 8th Floor, Jounieh', details: 'Sea and mountain view · $380,000', tags: ['Parking', 'Rooftop'] },
  ],
  108: [
    { title: '350m2 Villa, Dbayeh', details: '4BR · 600m2 garden · Pool · $950,000', tags: ['Pool', 'Garden', 'Gated'] },
  ],
};

// Lead score by status
const LEAD_SCORE: Record<string, number> = {
  urgent: 95,
  qualified: 82,
  handed_off: 73,
  new: 61,
  closed: 100,
};

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 101,
    user_name: 'Charbel Khoury',
    user_phone: '+961 3 712 456',
    status: 'urgent',
    user_requirements: { area: 'Achrafieh', type: 'rent', bedrooms: 2, budget: 1000 },
    agent_id: null,
    created_at: '2026-04-01T06:00:00.000Z',
    updated_at: '2026-04-01T07:55:00.000Z',
    messages: [
      { id: 1001, role: 'user', content: 'Hi, saw your listing 3a Achrafieh, 2BR near Sursoq. Still available?', timestamp: '2026-04-01T07:30:00.000Z' },
      { id: 1002, role: 'assistant', content: 'Hey Charbel! Yes still available.|||120m2, $1,200/mo, 4th floor with covered parking.|||Want to book a viewing?', timestamp: '2026-04-01T07:31:00.000Z' },
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
      { id: 1040, role: 'assistant', content: 'Marhaba Tarek! Best right now.|||180m2 on the 8th floor in Jounieh, panoramic sea and mountain view, $380,000.|||2021 building, 2 parking, rooftop access.', timestamp: '2026-03-30T11:02:00.000Z' },
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

// Mock conversation step events keyed by conversation id
const CONV_STEP_EVENTS: Record<number, StepEvent[]> = {
  101: [
    { id: 'se-101-1', timestamp: '2026-04-01T07:32:00.000Z', label: 'Moving to Qualification stage' },
    { id: 'se-101-2', timestamp: '2026-04-01T07:51:30.000Z', label: 'Lead flagged as Urgent' },
    { id: 'se-101-3', timestamp: '2026-04-01T07:55:30.000Z', label: 'Tour booked · Saturday 10 AM' },
  ],
  102: [
    { id: 'se-102-1', timestamp: '2026-04-01T06:32:00.000Z', label: 'Moving to Qualification stage' },
    { id: 'se-102-2', timestamp: '2026-04-01T07:45:30.000Z', label: 'Tour booked · Saturday 11 AM' },
  ],
  103: [
    { id: 'se-103-1', timestamp: '2026-03-31T10:03:00.000Z', label: 'Moving to Qualification stage' },
    { id: 'se-103-2', timestamp: '2026-04-01T07:16:00.000Z', label: 'Lead assigned to Maya Nasr' },
    { id: 'se-103-3', timestamp: '2026-04-01T07:19:00.000Z', label: 'Lead reassigned to Joelle Rizk' },
    { id: 'se-103-4', timestamp: '2026-04-01T07:19:30.000Z', label: 'Moving to Handoff stage' },
  ],
  104: [
    { id: 'se-104-1', timestamp: '2026-03-31T09:02:00.000Z', label: 'Moving to Qualification stage' },
    { id: 'se-104-2', timestamp: '2026-03-31T09:30:30.000Z', label: 'Tour requested · Wednesday or Thursday' },
  ],
  105: [
    { id: 'se-105-1', timestamp: '2026-04-01T05:02:00.000Z', label: 'Moving to Qualification stage' },
    { id: 'se-105-2', timestamp: '2026-04-01T06:51:00.000Z', label: 'Tour booked · Saturday 10 AM' },
  ],
  106: [
    { id: 'se-106-1', timestamp: '2026-04-01T08:03:00.000Z', label: 'Moving to Qualification stage' },
  ],
  107: [
    { id: 'se-107-1', timestamp: '2026-03-30T11:03:00.000Z', label: 'Moving to Qualification stage' },
    { id: 'se-107-2', timestamp: '2026-04-01T08:11:00.000Z', label: 'Tour booked · Tomorrow 3 PM' },
  ],
  108: [
    { id: 'se-108-1', timestamp: '2026-04-01T09:02:00.000Z', label: 'Moving to Qualification stage' },
  ],
  109: [
    { id: 'se-109-1', timestamp: '2026-03-31T11:03:00.000Z', label: 'Moving to Qualification stage' },
    { id: 'se-109-2', timestamp: '2026-04-01T08:11:00.000Z', label: 'Tour booked · Tomorrow 11 AM' },
  ],
  110: [
    { id: 'se-110-1', timestamp: '2026-03-20T10:02:00.000Z', label: 'Moving to Qualification stage' },
    { id: 'se-110-2', timestamp: '2026-03-25T15:01:00.000Z', label: 'Lead assigned to Joelle Rizk' },
    { id: 'se-110-3', timestamp: '2026-03-25T15:02:00.000Z', label: 'Conversation closed' },
  ],
};

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

function formatMsgTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }) + ', ' + new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Tag keys shown as pills in requirements section
const TAG_KEYS = ['area', 'bedrooms', 'type', 'duration', 'property_type', 'view', 'size'];

export default function Conversations() {
  useRole();
  const location = useLocation();
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
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [overrideAI, setOverrideAI] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [showStepEvents, setShowStepEvents] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiActiveCount = conversations.filter(isAiActive).length;
  const urgentCount = conversations.filter((c) => c.status === 'urgent').length;

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = c.user_name?.toLowerCase().includes(q) ?? false;
      const matchPhone = c.user_phone.toLowerCase().includes(q);
      const matchMsg = c.messages?.some((m) => m.content.toLowerCase().includes(q)) ?? false;
      if (!matchName && !matchPhone && !matchMsg) return false;
    }
    if (listFilter === 'AI Active') return isAiActive(c);
    if (listFilter === 'Agent') return c.agent_id != null;
    if (listFilter === 'Waiting') return c.status === 'handed_off';
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
    const params = new URLSearchParams(location.search);
    const leadName = params.get('lead');
    if (!leadName) return;
    const match =
      conversations.find((c) => c.user_name?.toLowerCase() === leadName.toLowerCase()) ??
      conversations.find((c) =>
        c.user_name?.toLowerCase().includes(leadName.split(' ')[0].toLowerCase())
      );
    if (match) {
      setSelected(match);
      setMobileView('chat');
    }
  }, [location.search]);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    let cancelled = false;
    setLoadingDetail(true);
    setDetail(null);
    getConversation(selected.id)
      .then((res) => {
        if (!cancelled) { setDetail(res.data); setLoadingDetail(false); }
      })
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

  const handleSelectConversation = (c: Conversation) => {
    setSelected(c);
    setOverrideAI(false);
    setMobileView('chat');
  };

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
      toast.success('Agent assigned.');
      await loadList();
    } catch {
      toast.error('Failed to assign agent.');
    } finally { setAssigningAgent(false); }
  };

  const handleEndChat = async () => {
    if (!selected) return;
    setEndingChat(true);
    try {
      await updateConversationStatus(selected.id, 'closed');
      toast.success('Conversation closed.');
      await loadList();
    } catch {
      toast.error('Failed to close conversation.');
    } finally { setEndingChat(false); }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !detail) return;
    const newMsg: Message = {
      id: Date.now(),
      role: 'assistant',
      content: messageInput.trim(),
      timestamp: new Date().toISOString(),
    };
    setDetail((prev) =>
      prev ? { ...prev, messages: [...(prev.messages ?? []), newMsg] } : prev,
    );
    setMessageInput('');
    toast.success('Message sent.');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] md:h-[calc(100vh-7rem)] min-h-[480px]">
      {error && (
        <div className="mb-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex-shrink-0">
          {error}
        </div>
      )}

      <div className="flex flex-1 min-h-0 rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* ===== LEFT: Conversation List ===== */}
        <div className={`flex-shrink-0 bg-white border-r border-slate-200 flex flex-col w-full md:w-[280px] ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>

          {/* Panel header */}
          <div className="px-4 pt-3.5 pb-2.5 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">All Chats</span>
              <div className="flex items-center gap-1.5">
                {aiActiveCount > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    AI: {aiActiveCount}
                  </span>
                )}
                {urgentCount > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                    {urgentCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex border-b border-slate-100 flex-shrink-0">
            {(['All', 'AI Active', 'Agent', 'Waiting'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setListFilter(tab)}
                className={`flex-1 py-2 text-[11px] font-semibold text-center border-b-2 transition-colors ${
                  listFilter === tab
                    ? 'text-brand-600 border-brand-600 bg-brand-50/40'
                    : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="mx-3 my-2 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 flex-shrink-0">
            <Search className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none min-w-0"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="mx-auto w-8 h-8 text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const lastMsg = c.messages?.[c.messages.length - 1];
                const isSelected = selected?.id === c.id;
                const isUnread = UNREAD_IDS.has(c.id);
                const b = getBadge(c.status);
                const isUrgent = c.status === 'urgent';
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectConversation(c)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 border-b border-slate-100 text-left transition-colors relative min-h-[64px] ${
                      isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Urgent left accent bar */}
                    {isUrgent && (
                      <div className="absolute left-0 inset-y-0 w-[3px] bg-red-500 rounded-r" />
                    )}

                    {/* Avatar */}
                    <div
                      className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: avatarBg(c.id) }}
                    >
                      {c.user_name ? initials(c.user_name) : c.user_phone.slice(-2)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-semibold text-[13px] text-slate-900 truncate">
                          {c.user_name ?? c.user_phone}
                        </span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">
                          {timeAgo(c.updated_at ?? c.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${b.cls}`}>
                          {b.label}
                        </span>
                        <span className={`text-[10px] ${c.agent_id ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                          {c.agent_id ? c.agent?.name ?? 'Agent' : 'AI'}
                        </span>
                      </div>
                      {lastMsg && (
                        <p className="text-[11px] text-slate-400 truncate max-w-[168px]">
                          {lastMsg.content}
                        </p>
                      )}
                    </div>

                    {isUnread && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ===== MIDDLE: Chat Panel ===== */}
        <div className={`flex-1 flex flex-col bg-slate-50/60 min-w-0 w-full ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
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
              <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center gap-3 flex-shrink-0">
                {/* Mobile back button */}
                <button
                  type="button"
                  onClick={() => setMobileView('list')}
                  className="md:hidden text-brand-600 -ml-1 mr-1 flex-shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Avatar */}
                <div
                  className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: avatarBg(detail.id) }}
                >
                  {detail.user_name ? initials(detail.user_name) : detail.user_phone.slice(-2)}
                </div>

                {/* Contact info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 text-sm leading-tight">
                    {detail.user_name ?? detail.user_phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block flex-shrink-0" />
                    Online
                    {detail.user_name && <span className="text-slate-400">· {detail.user_phone}</span>}
                    {detail.status === 'urgent' && (
                      <span className="text-red-600 font-bold">· Urgent</span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Step events toggle */}
                  <button
                    type="button"
                    onClick={() => setShowStepEvents((v) => !v)}
                    title={showStepEvents ? 'Hide conversation steps' : 'Show conversation steps'}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      showStepEvents
                        ? 'border-brand-200 bg-brand-50 text-brand-600'
                        : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                  </button>

                  {/* Assign agent dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={handleAssignAgentOpen}
                      disabled={assigningAgent}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                    >
                      {assigningAgent
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <UserPlus className="w-3 h-3" />}
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

                  {/* End chat button */}
                  <button
                    type="button"
                    onClick={handleEndChat}
                    disabled={endingChat || detail.status === 'closed'}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-40 transition-colors"
                  >
                    {endingChat
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <X className="w-3 h-3" />}
                    End Chat
                  </button>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-5 flex flex-col gap-3">
                {/* Day divider */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
                    {new Date(detail.created_at).toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric',
                    })}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {(() => {
                  type TimelineItem =
                    | { kind: 'message'; data: Message }
                    | { kind: 'event'; data: StepEvent };

                  const stepItems: TimelineItem[] = showStepEvents
                    ? (CONV_STEP_EVENTS[detail.id] ?? []).map((e) => ({
                        kind: 'event' as const,
                        data: e,
                      }))
                    : [];

                  const timeline: TimelineItem[] = [
                    ...(detail.messages ?? []).map((m) => ({
                      kind: 'message' as const,
                      data: m,
                    })),
                    ...stepItems,
                  ].sort(
                    (a, b) =>
                      new Date(a.data.timestamp).getTime() -
                      new Date(b.data.timestamp).getTime(),
                  );

                  return timeline.map((item) => {
                    if (item.kind === 'event') {
                      return (
                        <div key={item.data.id} className="flex items-center gap-3 my-0.5">
                          <div className="flex-1 h-px bg-slate-100" />
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap px-1">
                            {item.data.label}
                          </span>
                          <div className="flex-1 h-px bg-slate-100" />
                        </div>
                      );
                    }

                    const m = item.data;
                    const isUser = m.role === 'user';
                    const parts =
                      !isUser && m.content.includes('|||')
                        ? m.content
                            .split('|||')
                            .map((p) => p.trim())
                            .filter(Boolean)
                        : [m.content];

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col gap-1 ${isUser ? 'items-start' : 'items-end'}`}
                      >
                        {parts.map((part, idx) => (
                          <div
                            key={idx}
                            className={`max-w-[70%] rounded-2xl px-3.5 py-2.5 ${
                              isUser
                                ? 'bg-white border border-slate-200 text-slate-700 rounded-bl-[4px]'
                                : 'bg-brand-600 text-white rounded-br-[4px]'
                            }`}
                          >
                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
                              {part}
                            </p>
                            {idx === parts.length - 1 && (
                              <p
                                className={`text-[10px] mt-1 ${
                                  isUser ? 'text-slate-400' : 'text-white/55'
                                }`}
                              >
                                {formatMsgTime(m.timestamp)}
                                {!isUser && (
                                  <span className="opacity-60"> · AI</span>
                                )}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  });
                })()}

                {/* AI typing indicator */}
                {isAiActive(detail) && (
                  <div className="flex justify-end">
                    <div className="bg-brand-600 rounded-2xl rounded-br-[4px] px-4 py-3 flex items-center gap-1">
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
              <div className="bg-white border-t border-slate-200 px-3 md:px-5 py-2.5 md:py-3 flex-shrink-0">
                {isAiActive(detail) && !overrideAI ? (
                  <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
                    <Bot className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    <span className="text-sm text-slate-500">
                      AI is handling this conversation.{' '}
                      <button
                        type="button"
                        onClick={() => setOverrideAI(true)}
                        className="text-brand-600 font-semibold hover:underline"
                      >
                        Override to type manually
                      </button>
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400 transition"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              Failed to load messages
            </div>
          )}
        </div>

        {/* ===== RIGHT: Lead Info Panel ===== */}
        {selected && detail && (
          <div className="hidden xl:flex w-[260px] flex-shrink-0 bg-white border-l border-slate-200 flex-col overflow-y-auto">

            {/* Contact section */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: avatarBg(detail.id) }}
                >
                  {detail.user_name ? initials(detail.user_name) : detail.user_phone.slice(-2)}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-sm leading-tight truncate">
                    {detail.user_name ?? 'Unknown'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{detail.user_phone}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getBadge(detail.status).cls}`}>
                  {getBadge(detail.status).label}
                </span>
                {detail.user_requirements?.type && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">
                    {String(detail.user_requirements.type)}
                  </span>
                )}
                {isAiActive(detail) && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    AI Active
                  </span>
                )}
              </div>
            </div>

            {/* Lead score */}
            <div className="p-4 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Lead Score</p>
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-500"
                    style={{ width: `${LEAD_SCORE[detail.status] ?? 60}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-900 tabular-nums w-6 text-right">
                  {LEAD_SCORE[detail.status] ?? 60}
                </span>
              </div>
            </div>

            {/* Requirements section */}
            {detail.user_requirements && Object.keys(detail.user_requirements).length > 0 && (
              <div className="p-4 border-b border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Requirements</p>
                <div className="flex flex-wrap gap-1 mb-2.5">
                  {TAG_KEYS.map((key) =>
                    detail.user_requirements?.[key] ? (
                      <span
                        key={key}
                        className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md capitalize"
                      >
                        {key === 'bedrooms'
                          ? `${detail.user_requirements[key]} BR`
                          : String(detail.user_requirements[key])}
                      </span>
                    ) : null
                  )}
                </div>
                <div className="space-y-1.5">
                  {detail.user_requirements.budget && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Budget</span>
                      <span className="font-semibold text-slate-700">
                        ${Number(detail.user_requirements.budget).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {detail.agent_id && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Source</span>
                      <span className="font-semibold text-slate-700">WhatsApp</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Matching listings */}
            {CONV_LISTINGS[detail.id] && (
              <div className="p-4 border-b border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Matching Listings</p>
                <div className="space-y-2">
                  {CONV_LISTINGS[detail.id].map((listing, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                      <div className="text-xs font-bold text-slate-900">{listing.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{listing.details}</div>
                      {listing.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {listing.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-1.5">
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                          Available
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="p-4 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Timeline</p>
              <div className="space-y-3">
                {detail.updated_at && detail.updated_at !== detail.created_at && (
                  <div className="flex gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0 mt-1.5" />
                    <div>
                      <div className="text-[11px] text-slate-700 font-medium">Last activity</div>
                      <div className="text-[10px] text-slate-400">{formatDate(detail.updated_at)}</div>
                    </div>
                  </div>
                )}
                {detail.status === 'qualified' && (
                  <div className="flex gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                    <div>
                      <div className="text-[11px] text-slate-700 font-medium">Lead qualified by AI</div>
                      <div className="text-[10px] text-slate-400">{formatDate(detail.updated_at ?? detail.created_at)}</div>
                    </div>
                  </div>
                )}
                <div className="flex gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0 mt-1.5" />
                  <div>
                    <div className="text-[11px] text-slate-700 font-medium">Lead created via WhatsApp</div>
                    <div className="text-[10px] text-slate-400">{formatDate(detail.created_at)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned agent */}
            <div className="p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Assigned Agent</p>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: detail.agent ? '#64748b' : '#94a3b8' }}
                >
                  {detail.agent ? initials(detail.agent.name) : 'AI'}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-700">
                    {detail.agent?.name ?? 'AI Handling'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {detail.agent ? 'Agent assigned' : 'No agent assigned'}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
