import { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';
import { getTours } from '../api';
import { Plus, MapPin, User, Loader2 } from 'lucide-react';

const TOURS = [
  {
    id: 1,
    client: 'Rami Khoury',
    phone: '+961 71 234 567',
    property: '3BR Apartment in Achrafieh',
    address: 'Rue Sursock, Achrafieh, Beirut',
    date: 'Apr 2, 2026',
    time: '9:00 AM',
    agent: 'Joelle Rizk',
    status: 'Scheduled',
  },
  {
    id: 2,
    client: 'Nadia Saade',
    phone: '+961 76 891 234',
    property: '4BR Villa in Broummana',
    address: 'Main Road, Broummana, Metn',
    date: 'Apr 3, 2026',
    time: '11:00 AM',
    agent: 'Elie Khoury',
    status: 'Scheduled',
  },
  {
    id: 3,
    client: 'Tony Frem',
    phone: '+961 70 345 678',
    property: 'Studio in Mar Mikhael',
    address: 'Armenia Street, Mar Mikhael, Beirut',
    date: 'Apr 4, 2026',
    time: '10:00 AM',
    agent: 'Roula Bou Jawde',
    status: 'Completed',
  },
  {
    id: 4,
    client: 'Maya Nassar',
    phone: '+961 03 567 890',
    property: '2BR Apartment in Hamra',
    address: 'Bliss Street, Hamra, Beirut',
    date: 'Apr 5, 2026',
    time: '2:00 PM',
    agent: 'Joelle Rizk',
    status: 'Scheduled',
  },
  {
    id: 5,
    client: 'Hassan Mourad',
    phone: '+961 71 123 456',
    property: 'Sea View Apt in Kaslik',
    address: "Rue de l'Eglise, Kaslik, Jounieh",
    date: 'Apr 6, 2026',
    time: '3:30 PM',
    agent: 'Elie Khoury',
    status: 'Cancelled',
  },
  {
    id: 6,
    client: 'Lara Bou Jawde',
    phone: '+961 76 234 567',
    property: '5BR Villa in Beit Mery',
    address: 'Old Village Road, Beit Mery, Metn',
    date: 'Apr 7, 2026',
    time: '10:30 AM',
    agent: 'Joelle Rizk',
    status: 'Completed',
  },
  {
    id: 7,
    client: 'Georges Karam',
    phone: '+961 70 456 789',
    property: '3BR Duplex in Verdun',
    address: 'Verdun Street, Ras Beirut',
    date: 'Apr 9, 2026',
    time: '11:00 AM',
    agent: 'Roula Bou Jawde',
    status: 'Scheduled',
  },
  {
    id: 8,
    client: 'Rita Haddad',
    phone: '+961 03 678 901',
    property: '2BR Apartment in Dbayeh',
    address: 'Highway Road, Dbayeh, Metn',
    date: 'Apr 10, 2026',
    time: '4:00 PM',
    agent: 'Elie Khoury',
    status: 'Scheduled',
  },
  {
    id: 9,
    client: 'Marwan Khalil',
    phone: '+961 71 345 678',
    property: '1BR Apartment in Badaro',
    address: 'Badaro Street, Beirut',
    date: 'Apr 12, 2026',
    time: '9:30 AM',
    agent: 'Joelle Rizk',
    status: 'Scheduled',
  },
  {
    id: 10,
    client: 'Celine Abi Zeid',
    phone: '+961 76 567 890',
    property: '4BR Penthouse in Raouche',
    address: 'Corniche Al Manara, Raouche, Beirut',
    date: 'Apr 14, 2026',
    time: '1:00 PM',
    agent: 'Roula Bou Jawde',
    status: 'Scheduled',
  },
];

const STATUS_COLORS: Record<string, string> = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
};

type Tour = typeof TOURS[0];
type StatusFilter = 'All' | 'Scheduled' | 'Completed' | 'Cancelled';

export default function Tours() {
  const { role } = useRole();
  const [filter, setFilter] = useState<StatusFilter>('All');
  const [tours, setTours] = useState<Tour[]>(TOURS);
  const [loading, setLoading] = useState(true);
  const title = role === 'agent' ? 'Property Visits' : 'Property Tours';

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await getTours();
        const data: Tour[] = res.data || [];
        if (data.length > 0) {
          setTours(data);
        }
        // No tours endpoint in backend yet. Falls back to mock data silently.
      } catch {
        // Tours API not available. Using mock data.
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  const filtered = filter === 'All' ? tours : tours.filter((t) => t.status === filter);

  const counts = {
    Scheduled: tours.filter((t) => t.status === 'Scheduled').length,
    Completed: tours.filter((t) => t.status === 'Completed').length,
    Cancelled: tours.filter((t) => t.status === 'Cancelled').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage and schedule property tours with leads</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          <Plus size={18} />
          Schedule Tour
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-blue-600">{counts.Scheduled}</p>
          <p className="text-sm text-slate-500 mt-1">Scheduled</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-emerald-600">{counts.Completed}</p>
          <p className="text-sm text-slate-500 mt-1">Completed</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-center">
          <p className="text-2xl font-bold text-red-600">{counts.Cancelled}</p>
          <p className="text-sm text-slate-500 mt-1">Cancelled</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex gap-1 px-4 pt-4 border-b border-slate-100">
          {(['All', 'Scheduled', 'Completed', 'Cancelled'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                filter === tab
                  ? 'bg-brand-50 text-brand-600 border-b-2 border-brand-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Client</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Property</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date & Time</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Agent</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tour) => (
                <tr key={tour.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {tour.client.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{tour.client}</p>
                        <p className="text-xs text-slate-400">{tour.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800 text-sm">{tour.property}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={11} className="text-slate-400 flex-shrink-0" />
                      <p className="text-xs text-slate-400 truncate max-w-[220px]">{tour.address}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800 text-sm">{tour.date}</p>
                    <p className="text-xs text-slate-400">{tour.time}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <User size={13} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{tour.agent}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[tour.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {tour.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
