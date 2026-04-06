import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Phone, Calendar, MessageSquare, ChevronRight } from 'lucide-react';
import { getConversation, getAgents, assignAgentToConversation } from '../api';
import { useRole } from '../context/RoleContext';

interface LeadDetailPanelProps {
  conversationId: number;
  onClose: () => void;
  onUpdate?: () => void;
}

interface ConversationDetail {
  id: number;
  user_phone: string;
  status: string;
  user_requirements: Record<string, unknown> | null;
  agent_id: number | null;
  agent: { id: number; name: string; phone: string; email?: string } | null;
  created_at: string;
  updated_at: string | null;
  messages: { id: number; role: string; content: string; timestamp: string }[];
}

interface Agent {
  id: number;
  name: string;
  phone: string;
  email?: string;
}

const STATUS_BADGE: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  qualifying: 'bg-amber-100 text-amber-800',
  qualified: 'bg-emerald-100 text-emerald-800',
  tour_booked: 'bg-purple-100 text-purple-800',
  handed_to_agent: 'bg-slate-100 text-slate-600',
  handed_off: 'bg-slate-100 text-slate-600',
};

const STATUS_LABEL: Record<string, string> = {
  new: 'New',
  qualifying: 'Qualifying',
  qualified: 'Qualified',
  tour_booked: 'Tour Booked',
  handed_to_agent: 'Handed to Agent',
  handed_off: 'Handed to Agent',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPrice(price: unknown): string {
  if (!price || typeof price !== 'number') return 'Not specified';
  return `$${price.toLocaleString('en-US')}`;
}

export default function LeadDetailPanel({ conversationId, onClose, onUpdate }: LeadDetailPanelProps) {
  const navigate = useNavigate();
  const { role } = useRole();

  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');

  // Trigger slide-in animation after mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [convRes, agentsRes] = await Promise.all([
          getConversation(conversationId),
          getAgents(),
        ]);
        setConversation(convRes.data);
        setAgents(agentsRes.data || []);
      } catch (err) {
        console.error('Failed to load lead details:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [conversationId]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  };

  const handleAssign = async () => {
    if (!selectedAgent) return;
    setAssignLoading(true);
    try {
      await assignAgentToConversation(conversationId, parseInt(selectedAgent, 10));
      const convRes = await getConversation(conversationId);
      setConversation(convRes.data);
      onUpdate?.();
    } catch (err) {
      console.error('Failed to assign agent:', err);
    } finally {
      setAssignLoading(false);
    }
  };

  const reqs = (conversation?.user_requirements || {}) as Record<string, unknown>;
  const messages = conversation?.messages || [];
  const lastFive = messages.slice(-5);
  const initials = conversation?.user_phone.slice(-2).toUpperCase() || '';
  const statusLabel = conversation ? (STATUS_LABEL[conversation.status] || conversation.status) : '';
  const statusClass = conversation ? (STATUS_BADGE[conversation.status] || 'bg-slate-100 text-slate-600') : '';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-[500px] bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {loading || !conversation ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-start gap-4 flex-shrink-0">
              <div className="w-11 h-11 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-base font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-slate-900 truncate">
                  {conversation.user_phone}
                </h2>
                <span className={`inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                  {statusLabel}
                </span>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">

              {/* Contact Info */}
              <section className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Contact Info
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <Phone size={15} className="text-slate-400 flex-shrink-0" />
                    {conversation.user_phone}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-700">
                    <Calendar size={15} className="text-slate-400 flex-shrink-0" />
                    Created {formatDate(conversation.created_at)}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-500">
                    <MessageSquare size={15} className="text-slate-400 flex-shrink-0" />
                    Via WhatsApp
                  </div>
                </div>
              </section>

              {/* Property Requirements */}
              <section className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Property Requirements
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Type</p>
                    <p className="text-sm font-medium text-slate-900 capitalize">
                      {typeof reqs.listing_type === 'string' ? reqs.listing_type : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Property Type</p>
                    <p className="text-sm font-medium text-slate-900 capitalize">
                      {typeof reqs.property_type === 'string' ? reqs.property_type : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Budget</p>
                    <p className="text-sm font-medium text-slate-900">
                      {reqs.budget_min || reqs.budget_max
                        ? `${formatPrice(reqs.budget_min)} to ${formatPrice(reqs.budget_max)}`
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Location</p>
                    <p className="text-sm font-medium text-slate-900">
                      {typeof reqs.location === 'string' ? reqs.location : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Bedrooms</p>
                    <p className="text-sm font-medium text-slate-900">
                      {reqs.bedrooms ? `${reqs.bedrooms} beds` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Bathrooms</p>
                    <p className="text-sm font-medium text-slate-900">
                      {reqs.bathrooms ? `${reqs.bathrooms} baths` : 'Not specified'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Conversation History */}
              <section className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Conversation History
                  {messages.length > 0 && (
                    <span className="ml-2 text-slate-400 normal-case font-normal">
                      (last {lastFive.length} of {messages.length})
                    </span>
                  )}
                </h3>
                {lastFive.length === 0 ? (
                  <p className="text-sm text-slate-400">No messages yet.</p>
                ) : (
                  <div className="space-y-3">
                    {lastFive.map((msg, i) => {
                      const isAgent = msg.role === 'agent' || msg.role === 'assistant';
                      return (
                        <div
                          key={msg.id ?? i}
                          className={`flex gap-2.5 ${isAgent ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                            isAgent
                              ? 'bg-brand-100 text-brand-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {isAgent ? 'AI' : 'U'}
                          </div>
                          <div className={`max-w-[75%] px-3 py-2 rounded-lg text-xs text-slate-700 ${
                            isAgent
                              ? 'bg-brand-50 border border-brand-100'
                              : 'bg-slate-100'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Agent Assignment */}
              <section className="px-6 py-5">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Agent Assignment
                </h3>
                {conversation.agent ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600">
                      {conversation.agent.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{conversation.agent.name}</p>
                      <p className="text-xs text-slate-400">Assigned agent</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500 italic">
                      No agent assigned. Currently handled by AI routing.
                    </p>
                    {role === 'admin' && agents.length > 0 && (
                      <div className="flex gap-2">
                        <select
                          value={selectedAgent}
                          onChange={(e) => setSelectedAgent(e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="">Select agent...</option>
                          {agents.map((a) => (
                            <option key={a.id} value={String(a.id)}>{a.name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!selectedAgent || assignLoading}
                          onClick={handleAssign}
                          className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {assignLoading ? 'Assigning...' : 'Assign'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex-shrink-0">
              <button
                type="button"
                onClick={() => navigate(`/conversations?id=${conversationId}`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-brand-300 text-brand-700 text-sm font-medium rounded-lg hover:bg-brand-50 transition-colors"
              >
                <MessageSquare size={15} />
                View Full Conversation
                <ChevronRight size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
