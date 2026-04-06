import { useState } from 'react';
import { useRole } from '../context/RoleContext';
import { toast } from '../utils/toast';
import { Plus, MapPin, User, X, Calendar, Clock, Phone, ChevronDown } from 'lucide-react';

const INITIAL_TOURS = [
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

const MOCK_AGENTS = ['Joelle Rizk', 'Elie Khoury', 'Roula Bou Jawde', 'Michel Boutros', 'Karim Haddad'];

const STATUS_COLORS: Record<string, string> = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
};

type TourStatus = 'Scheduled' | 'Completed' | 'Cancelled';
type StatusFilter = 'All' | TourStatus;
type Tour = (typeof INITIAL_TOURS)[0];

const EMPTY_FORM = {
  client: '',
  phone: '',
  property: '',
  address: '',
  date: '',
  time: '',
  agent: '',
};

function ScheduleTourModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (t: Tour) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    const dateObj = form.date ? new Date(form.date) : null;
    const displayDate = dateObj
      ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : form.date;
    const [h, m] = (form.time || '00:00').split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    const displayTime = `${displayHour}:${String(m).padStart(2, '0')} ${ampm}`;
    onSave({
      id: Date.now(),
      client: form.client,
      phone: form.phone,
      property: form.property,
      address: form.address,
      date: displayDate,
      time: displayTime,
      agent: form.agent,
      status: 'Scheduled',
    });
    setSaving(false);
    toast.success('Tour scheduled.');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-brand-600" />
              <h3 className="text-base font-semibold text-slate-900">Schedule Tour</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Client Name *
                </label>
                <input
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. Rami Khoury"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                <div className="relative">
                  <Phone
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="+961 71 000 000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Property *
                </label>
                <input
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. 3BR Apartment in Achrafieh"
                  value={form.property}
                  onChange={(e) => setForm({ ...form, property: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
                <div className="relative">
                  <MapPin
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Street, Area, City"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date *</label>
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    required
                    type="date"
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Time *</label>
                <div className="relative">
                  <Clock
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    required
                    type="time"
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Assign Agent *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.agent}
                  onChange={(e) => setForm({ ...form, agent: e.target.value })}
                >
                  <option value="">Select agent</option>
                  {MOCK_AGENTS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
              >
                {saving ? 'Scheduling...' : 'Schedule Tour'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function StatusDropdown({
  tour,
  onUpdate,
}: {
  tour: Tour;
  onUpdate: (id: number, status: TourStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const statuses: TourStatus[] = ['Scheduled', 'Completed', 'Cancelled'];

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
          STATUS_COLORS[tour.status] ?? 'bg-slate-100 text-slate-600'
        }`}
      >
        {tour.status}
        <ChevronDown size={11} />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full mt-1.5 w-36 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(tour.id, s);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                  tour.status === s ? 'text-brand-600' : 'text-slate-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    s === 'Scheduled'
                      ? 'bg-blue-400'
                      : s === 'Completed'
                        ? 'bg-emerald-400'
                        : 'bg-red-400'
                  }`}
                />
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Tours() {
  const { role } = useRole();
  const [filter, setFilter] = useState<StatusFilter>('All');
  const [tours, setTours] = useState<Tour[]>(INITIAL_TOURS);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const title = role === 'agent' ? 'Property Visits' : 'Property Tours';

  const handleAddTour = (tour: Tour) => {
    setTours((prev) => [tour, ...prev]);
  };

  const handleUpdateStatus = (id: number, status: TourStatus) => {
    setTours((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    toast.success(`Tour marked as ${status}.`);
  };

  const handleDeleteTour = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Remove this tour?')) return;
    setTours((prev) => prev.filter((t) => t.id !== id));
    toast.success('Tour removed.');
  };

  const filtered = filter === 'All' ? tours : tours.filter((t) => t.status === filter);

  const counts = {
    Scheduled: tours.filter((t) => t.status === 'Scheduled').length,
    Completed: tours.filter((t) => t.status === 'Completed').length,
    Cancelled: tours.filter((t) => t.status === 'Cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage and schedule property tours with leads
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowScheduleModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
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
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Client
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Property
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Date &amp; Time
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Agent
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">
                    No tours in this category.
                  </td>
                </tr>
              ) : (
                filtered.map((tour) => (
                  <tr key={tour.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {tour.client
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
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
                        <p className="text-xs text-slate-400 truncate max-w-[220px]">
                          {tour.address}
                        </p>
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
                      <StatusDropdown tour={tour} onUpdate={handleUpdateStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteTour(tour.id, e)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors px-2 py-1 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showScheduleModal && (
        <ScheduleTourModal onClose={() => setShowScheduleModal(false)} onSave={handleAddTour} />
      )}
    </div>
  );
}
