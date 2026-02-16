import { Users, CheckCircle, Calendar, Clock } from 'lucide-react';

const kpis = [
  { label: 'Total Leads', value: '1,847', change: '↑ 12.4% vs last period', icon: Users, color: 'text-brand-600' },
  { label: 'Tours → Deals Ratio', value: '5.2%', change: '↑ 5.8% vs last period', icon: CheckCircle, color: 'text-emerald-600' },
  { label: 'Tours Booked', value: '542', change: '↑ 18.3% vs last period', icon: Calendar, color: 'text-amber-600' },
  { label: 'Avg Response Time', value: '4.2m', change: '↓ 22.1% vs last period', icon: Clock, color: 'text-blue-600' },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500 mt-1">Performance metrics and insights for your real estate operations</p>
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
            <option>All Agents</option>
          </select>
          <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
            <option>All Listings</option>
          </select>
          <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
            <option>Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{k.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{k.value}</p>
                  <p className="text-sm text-emerald-600 mt-1">{k.change}</p>
                </div>
                <Icon className={k.color} size={24} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Leads Per Source</h2>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
            <p className="text-slate-400">Pie chart placeholder</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Tours → Deals Ratio</h2>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
            <p className="text-slate-400">Line chart placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}
