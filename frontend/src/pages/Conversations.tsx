import { useState, useEffect } from 'react';
import { getConversations, getConversation } from '../api';
import { useRole } from '../context/RoleContext';
import { MessageSquare, User, Loader2 } from 'lucide-react';

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

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  qualified: 'bg-emerald-100 text-emerald-800',
  handed_off: 'bg-purple-100 text-purple-800',
  closed: 'bg-slate-100 text-slate-700',
};

export default function Conversations() {
  const { role } = useRole();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [detail, setDetail] = useState<Conversation | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [filter, setFilter] = useState<'all' | 'ai' | 'agent' | 'waiting'>('all');
  const [error, setError] = useState<string | null>(null);

  const loadList = async () => {
    try {
      setError(null);
      const res = await getConversations();
      setConversations(res.data || []);
      if (!selected && res.data?.length > 0) {
        setSelected(res.data[0]);
      }
    } catch (err: unknown) {
      setError('Failed to load conversations.');
      setConversations([]);
    }
  };

  useEffect(() => {
    loadList();
    const interval = setInterval(loadList, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selected) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoadingDetail(true);
    setDetail(null);
    getConversation(selected.id)
      .then((res) => {
        if (!cancelled) {
          setDetail(res.data);
          setLoadingDetail(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadingDetail(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selected?.id]);

  const filtered = conversations.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'agent') return c.agent_id != null;
    if (filter === 'ai') return c.agent_id == null && c.status !== 'closed';
    if (filter === 'waiting') return c.status === 'qualified' || c.status === 'handed_off';
    return true;
  });

  const title = role === 'agent' ? 'Inbox' : 'Conversations';
  const subtitle = role === 'agent' ? 'Leads and conversations that need your attention' : 'Real-time leads from WhatsApp';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500">{subtitle}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
        {/* Left: list */}
        <div className="lg:w-96 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col">
          <div className="p-2 flex gap-1 flex-wrap border-b border-slate-100">
            {[
              { key: 'all' as const, label: `All (${conversations.length})` },
              { key: 'ai' as const, label: 'AI Only' },
              { key: 'agent' as const, label: 'Agent' },
              { key: 'waiting' as const, label: 'Waiting' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  filter === key ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {key === 'all' ? label : key}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                <MessageSquare className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                No conversations yet
              </div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelected(c)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-slate-100 hover:bg-slate-50 ${
                    selected?.id === c.id ? 'bg-slate-100' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-700 flex-shrink-0">
                    {c.user_phone.slice(-2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-900 truncate">{c.user_phone}</span>
                      <span className="text-xs text-slate-500 flex-shrink-0">
                        {c.updated_at
                          ? new Date(c.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          : new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${statusColors[c.status] || 'bg-slate-100 text-slate-600'}`}>
                      {c.agent_id ? `Agent: ${c.agent?.name || '—'}` : 'AI Active'}
                    </span>
                    {c.messages?.length
                      ? (
                          <p className="text-sm text-slate-500 truncate mt-1">
                            {(c.messages[c.messages.length - 1]?.content || '').slice(0, 50)}
                            {(c.messages[c.messages.length - 1]?.content?.length || 0) > 50 ? '…' : ''}
                          </p>
                        )
                      : null}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: chat */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <p>Select a conversation</p>
            </div>
          ) : loadingDetail ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            </div>
          ) : detail ? (
            <>
              <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-medium text-slate-900">{detail.user_phone}</p>
                  <p className="text-xs text-slate-500">
                    Last active: {detail.updated_at
                      ? new Date(detail.updated_at).toLocaleString()
                      : new Date(detail.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${statusColors[detail.status] || 'bg-slate-100'}`}>
                  {detail.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(detail.messages || []).map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        m.role === 'user'
                          ? 'rounded-br-md bg-brand-600 text-white'
                          : 'rounded-bl-md bg-white border border-slate-200 text-slate-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                      <p className={`text-xs mt-1 ${m.role === 'user' ? 'text-white/80' : 'text-slate-500'}`}>
                        {new Date(m.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        {m.role === 'assistant' ? ' · AI' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Failed to load messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
