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
  status: string;
  user_requirements: Record<string, unknown> | null;
  agent_id: number | null;
  agent?: { name: string } | null;
  created_at: string;
  updated_at: string | null;
  messages?: Message[];
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  new:        { label: 'New',     cls: 'bg-emerald-100 text-emerald-700' },
  qualified:  { label: 'Hot',     cls: 'bg-rose-100 text-rose-700' },
  handed_off: { label: 'Waiting', cls: 'bg-blue-100 text-blue-700' },
  closed:     { label: 'Cold',    cls: 'bg-slate-100 text-slate-500' },
  urgent:     { label: 'Urgent',  cls: 'bg-red-100 text-red-700' },
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

export default function Conversations() {
  useRole();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [detail, setDetail] = useState<Conversation | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [assigningAgent, setAssigningAgent] = useState(false);
  const [endingChat, setEndingChat] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiActiveCount = conversations.filter(isAiActive).length;

  const loadList = async () => {
    try {
      setError(null);
      const res = await getConversations();
      const list: Conversation[] = res.data || [];
      setConversations(list);
      setSelected((prev) => {
        if (!prev && list.length > 0) return list[0];
        return prev;
      });
    } catch {
      setError('Failed to load conversations.');
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
      .catch(() => { if (!cancelled) setLoadingDetail(false); });
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

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                <MessageSquare className="mx-auto h-10 w-10 text-slate-200 mb-2" />
                No conversations yet
              </div>
            ) : (
              conversations.map((c) => {
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
