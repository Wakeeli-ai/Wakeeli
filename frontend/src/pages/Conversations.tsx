import { useState, useEffect } from 'react';
import { getConversations } from '../api';
import { MessageSquare, Clock, CheckCircle2, User, Phone, MapPin, DollarSign, Home } from 'lucide-react';

export default function Conversations() {
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      const res = await getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'qualified': return 'bg-green-100 text-green-700';
      case 'handed_off': return 'bg-purple-100 text-purple-700';
      case 'closed': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Conversations</h1>
          <p className="text-slate-500">Real-time leads from WhatsApp.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Requirements</th>
                <th className="px-6 py-4">Assigned Agent</th>
                <th className="px-6 py-4">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {conversations.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(c.status)} capitalize`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <User size={16} />
                      </div>
                      <span className="font-medium text-slate-900">{c.user_phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {c.user_requirements ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Home size={12} className="text-slate-400" />
                          <span className="capitalize">{c.user_requirements.listing_type || 'Any'}</span>
                        </div>
                        {c.user_requirements.location && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <MapPin size={12} className="text-slate-400" />
                            <span>{c.user_requirements.location}</span>
                          </div>
                        )}
                        {c.user_requirements.budget_max && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <DollarSign size={12} className="text-slate-400" />
                            <span>Max ${c.user_requirements.budget_max.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">No requirements yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {c.agent ? (
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">
                           {c.agent.name.charAt(0)}
                         </div>
                         <span className="text-slate-700">{c.agent.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {new Date(c.updated_at || c.created_at).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {conversations.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No conversations yet</h3>
            <p className="text-slate-500">Waiting for incoming messages...</p>
          </div>
        )}
      </div>
    </div>
  );
}
