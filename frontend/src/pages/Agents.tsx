import { useState, useEffect } from 'react';
import { getAgents, createAgent, deleteAgent } from '../api';
import { Plus, Trash2, Phone, Mail, Map, User, Briefcase, Award } from 'lucide-react';

export default function Agents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    territories: '',
    specialties: 'rent',
    priority: 1
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const res = await getAgents();
      setAgents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        territories: form.territories.split(',').map(s => s.trim()),
        specialties: [form.specialties] // Simplification for MVP
      };
      await createAgent(payload);
      setForm({
        name: '',
        phone: '',
        email: '',
        territories: '',
        specialties: 'rent',
        priority: 1
      });
      setIsFormOpen(false);
      loadAgents();
    } catch (err) {
      console.error(err);
      alert('Error creating agent');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteAgent(id);
      loadAgents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Real Estate Agents</h1>
          <p className="text-slate-500">Manage your team and territory assignments.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Add Agent
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">New Agent Profile</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})} 
                required 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Territories (comma separated)</label>
              <input 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. Downtown, Beirut, Hamra"
                value={form.territories} 
                onChange={e => setForm({...form, territories: e.target.value})} 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                value={form.specialties} 
                onChange={e => setForm({...form, specialties: e.target.value})}
              >
                <option value="rent">Rent Only</option>
                <option value="buy">Buy Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority (1-10)</label>
              <input 
                type="number" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.priority} 
                onChange={e => setForm({...form, priority: Number(e.target.value)})} 
                required 
              />
            </div>
            
            <div className="col-span-2 flex justify-end gap-3 mt-2">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg"
              >
                Save Agent
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid Layout for Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map(a => (
          <div key={a.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                   <User size={24} />
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900">{a.name}</h3>
                   <div className="flex items-center gap-1 text-xs text-brand-600 font-medium bg-brand-50 px-2 py-0.5 rounded-full w-fit">
                     <Award size={12} />
                     Priority: {a.priority}
                   </div>
                 </div>
               </div>
               <button 
                  onClick={() => handleDelete(a.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
             </div>

             <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  {a.phone}
                </div>
                {a.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail size={16} className="text-slate-400" />
                    {a.email}
                  </div>
                )}
                
                <div className="pt-3 border-t border-slate-100 mt-3">
                  <div className="flex items-start gap-2 mb-2">
                    <Map size={16} className="text-slate-400 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {a.territories?.map((t: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-slate-400" />
                    <div className="flex gap-1">
                       {a.specialties?.map((s: string, i: number) => (
                        <span key={i} className="uppercase text-xs font-semibold text-slate-500">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
             </div>
          </div>
        ))}
      </div>
      
      {agents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <User className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-medium text-slate-900">No agents found</h3>
          <p className="text-slate-500">Add your first agent to start routing leads.</p>
        </div>
      )}
    </div>
  );
}
