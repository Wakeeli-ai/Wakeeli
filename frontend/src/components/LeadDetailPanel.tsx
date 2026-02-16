import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Home,
  DollarSign,
  Bed,
  Bath,
  User,
  MessageSquare,
  UserPlus,
  XCircle,
  Bot,
  ChevronRight,
} from 'lucide-react';
import {
  getConversation,
  getAgents,
  matchListings,
  assignAgentToConversation,
  updateConversationStatus,
  extractRequirements,
  MatchedListing,
} from '../api';
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
  user_requirements: Record<string, any> | null;
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPrice(price: number | null | undefined): string {
  if (!price) return '—';
  return price.toLocaleString('en-US');
}

export default function LeadDetailPanel({ conversationId, onClose, onUpdate }: LeadDetailPanelProps) {
  const navigate = useNavigate();
  const { role } = useRole();
  const [activeTab, setActiveTab] = useState<'profile' | 'notes'>('profile');
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [requirements, setRequirements] = useState<Record<string, any>>({});
  const [matchedListings, setMatchedListings] = useState<MatchedListing[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [conversationId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load conversation details
      const convRes = await getConversation(conversationId);
      setConversation(convRes.data);

      // Load or extract requirements
      let reqs = convRes.data.user_requirements || {};
      if (!reqs.listing_type) {
        try {
          const extractRes = await extractRequirements(conversationId);
          reqs = extractRes.data.requirements || {};
        } catch {
          // Ignore extraction errors
        }
      }
      setRequirements(reqs);

      // Load matched listings if we have requirements
      if (Object.keys(reqs).length > 0) {
        try {
          const matchRes = await matchListings(reqs);
          setMatchedListings(matchRes.data.listings || []);
        } catch {
          // Ignore match errors
        }
      }

      // Load agents for reassignment
      const agentsRes = await getAgents();
      setAgents(agentsRes.data || []);
    } catch (err) {
      console.error('Failed to load lead details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAgent = async (agentId: number) => {
    setActionLoading('assign');
    try {
      await assignAgentToConversation(conversationId, agentId);
      await loadData();
      onUpdate?.();
    } catch (err) {
      console.error('Failed to assign agent:', err);
    } finally {
      setActionLoading(null);
      setShowAgentDropdown(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    setActionLoading('status');
    try {
      await updateConversationStatus(conversationId, status);
      await loadData();
      onUpdate?.();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendMessage = () => {
    navigate('/conversations');
  };

  // Compute AI confidence scores (simplified)
  const computeConfidenceScores = () => {
    if (matchedListings.length === 0) {
      return { overall: 0, budget: 0, location: 0, propertyType: 0, engagement: 50 };
    }
    const topMatch = matchedListings[0]?.match_scores;
    return {
      overall: topMatch?.overall_match || 0,
      budget: topMatch?.budget_match || 0,
      location: topMatch?.location_match || 0,
      propertyType: topMatch?.property_type_match || 0,
      engagement: Math.min(100, (conversation?.messages?.length || 0) * 10 + 30),
    };
  };

  const scores = computeConfidenceScores();

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-[800px] bg-white shadow-2xl z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="fixed inset-y-0 right-0 w-[800px] bg-white shadow-2xl z-50 flex items-center justify-center">
        <p className="text-slate-500">Lead not found</p>
      </div>
    );
  }

  const initials = conversation.user_phone.slice(-2);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-[850px] bg-slate-50 shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-lg font-semibold">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">{conversation.user_phone}</h2>
            <p className="text-sm text-slate-500 capitalize">
              {conversation.status.replace('_', ' ')} Lead
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-slate-200 px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'notes'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Notes
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="flex h-full">
            {/* Left Column - Profile */}
            <div className="flex-1 p-6 overflow-auto">
              {activeTab === 'profile' ? (
                <>
                  {/* Lead Information */}
                  <section className="mb-6">
                    <h3 className="text-sm font-semibold text-brand-600 mb-3">Lead Information</h3>
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Contact Information</p>
                          <div className="flex items-center gap-2 text-sm text-slate-900">
                            <Phone size={14} className="text-slate-400" />
                            {conversation.user_phone}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Connected via WhatsApp</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Lead Details</p>
                          <div className="flex items-center gap-2 text-sm text-slate-900">
                            <Calendar size={14} className="text-slate-400" />
                            Created: {formatDate(conversation.created_at)}
                          </div>
                          {conversation.agent && (
                            <div className="flex items-center gap-2 text-sm text-slate-900 mt-1">
                              <User size={14} className="text-slate-400" />
                              Assigned: {conversation.agent.name}
                            </div>
                          )}
                          <p className="text-xs text-slate-500 mt-1">Source: WhatsApp</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Property Preferences */}
                  <section className="mb-6">
                    <h3 className="text-sm font-semibold text-brand-600 mb-3">Property Preferences</h3>
                    <div className="bg-white rounded-lg border border-slate-200 p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Budget Range</p>
                          <p className="text-sm font-medium text-slate-900">
                            {requirements.budget_min || requirements.budget_max
                              ? `$${formatPrice(requirements.budget_min)} - $${formatPrice(requirements.budget_max)}`
                              : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Preferred Locations</p>
                          <p className="text-sm font-medium text-slate-900">
                            {requirements.location || '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Property Type</p>
                          <p className="text-sm font-medium text-slate-900">
                            {requirements.property_type || '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Bathrooms</p>
                          <p className="text-sm font-medium text-slate-900">
                            {requirements.bathrooms ? `${requirements.bathrooms}+ Bathrooms` : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Bedrooms</p>
                          <p className="text-sm font-medium text-slate-900">
                            {requirements.bedrooms ? `${requirements.bedrooms} Bedrooms` : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Type</p>
                          <p className="text-sm font-medium text-slate-900 capitalize">
                            {requirements.listing_type || '—'}
                          </p>
                        </div>
                      </div>
                      {requirements.additional_requirements?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <p className="text-xs text-slate-500 mb-2">Additional Requirements</p>
                          <div className="flex flex-wrap gap-2">
                            {requirements.additional_requirements.map((req: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                              >
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Matched Listings */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-brand-600">Matched Listings</h3>
                      {matchedListings.length > 0 && (
                        <button className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                          View All ({matchedListings.length})
                        </button>
                      )}
                    </div>
                    {matchedListings.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {matchedListings.slice(0, 4).map((listing) => (
                          <div
                            key={listing.id}
                            className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div className="h-24 bg-slate-200 relative">
                              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                <Home size={24} />
                              </div>
                              <div className="absolute top-2 right-2 px-2 py-0.5 bg-brand-600 text-white text-xs font-medium rounded">
                                {listing.match_scores.overall_match}% Match
                              </div>
                            </div>
                            <div className="p-3">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {listing.title}
                              </p>
                              <p className="text-xs text-slate-500 capitalize">
                                {listing.listing_type}
                              </p>
                              <p className="text-sm font-semibold text-brand-600 mt-1">
                                ${formatPrice(listing.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
                        <Home size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm text-slate-500">
                          No matching listings found. Add more requirements to find matches.
                        </p>
                      </div>
                    )}
                  </section>
                </>
              ) : (
                /* Notes Tab */
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <p className="text-sm text-slate-500">
                    Notes feature coming soon. You can add notes about this lead here.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - AI Insights & Actions */}
            <div className="w-72 border-l border-slate-200 bg-white p-4 overflow-auto">
              {/* AI Confidence Score */}
              <section className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">AI Confidence Score</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Overall Match Score</span>
                      <span className="font-semibold text-brand-600">{scores.overall}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all"
                        style={{ width: `${scores.overall}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Budget Match</span>
                      <span className="text-slate-700">{scores.budget}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${scores.budget}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Location Match</span>
                      <span className="text-slate-700">{scores.location}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${scores.location}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Property Type Match</span>
                      <span className="text-slate-700">{scores.propertyType}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${scores.propertyType}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Engagement Score</span>
                      <span className="text-slate-700">{scores.engagement}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${scores.engagement}%` }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* AI Insights */}
              <section className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">AI Insights</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Bot size={16} className="text-brand-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600">
                      {requirements.listing_type
                        ? `Lead is looking to ${requirements.listing_type} ${requirements.property_type || 'property'} in ${requirements.location || 'Lebanon'}.`
                        : 'Gathering requirements from conversation...'}
                    </p>
                  </div>
                  {matchedListings.length > 0 && (
                    <div className="flex gap-2">
                      <ChevronRight size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600">
                        Recommended: Schedule a tour for {matchedListings[0].title} which matches{' '}
                        {matchedListings[0].match_scores.overall_match}% of criteria.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Actions */}
              <section>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Actions</h3>
                <div className="space-y-2">
                  {!conversation.agent && role === 'admin' && (
                    <button
                      onClick={() => {
                        // Auto-assign to first available agent
                        if (agents.length > 0) {
                          handleAssignAgent(agents[0].id);
                        }
                      }}
                      disabled={actionLoading === 'assign'}
                      className="w-full py-2.5 px-4 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <UserPlus size={16} />
                      {actionLoading === 'assign' ? 'Assigning...' : 'Take Over Chat'}
                    </button>
                  )}

                  <button
                    onClick={() => navigate('/tours')}
                    className="w-full py-2.5 px-4 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2"
                  >
                    <Calendar size={16} />
                    Book Tour
                  </button>

                  <button
                    onClick={handleSendMessage}
                    className="w-full py-2.5 px-4 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={16} />
                    Send Message
                  </button>

                  {role === 'admin' && (
                    <div className="relative">
                      <button
                        onClick={() => setShowAgentDropdown(!showAgentDropdown)}
                        className="w-full py-2.5 px-4 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2"
                      >
                        <User size={16} />
                        Reassign Lead
                      </button>
                      {showAgentDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-48 overflow-auto">
                          {agents.map((agent) => (
                            <button
                              key={agent.id}
                              onClick={() => handleAssignAgent(agent.id)}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                            >
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">
                                {agent.name.slice(0, 2).toUpperCase()}
                              </div>
                              {agent.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {conversation.status !== 'closed' && (
                    <button
                      onClick={() => handleUpdateStatus('closed')}
                      disabled={actionLoading === 'status'}
                      className="w-full py-2.5 px-4 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
                    >
                      <XCircle size={16} />
                      {actionLoading === 'status' ? 'Updating...' : 'Mark as Closed/Lost'}
                    </button>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
