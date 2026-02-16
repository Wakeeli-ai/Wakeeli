import { useState } from 'react';
import { useRole } from '../context/RoleContext';
import { Calendar, Plus } from 'lucide-react';

const weekDays = ['Mon 18', 'Tue 19', 'Wed 20', 'Thu 21', 'Fri 22', 'Sat 23', 'Sun 24'];
const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'];

const mockTours = [
  { day: 1, start: 0, end: 1, lead: 'Marcus Rodriguez', property: 'Sunset Villa', color: 'bg-emerald-500' },
  { day: 1, start: 3, end: 4, lead: 'Latoya Washington', property: 'Harbor View Condos', color: 'bg-amber-500' },
  { day: 2, start: 1, end: 2, lead: 'Patricia O\'Brien', property: 'Riverside Luxury Lofts', color: 'bg-emerald-500' },
  { day: 2, start: 2, end: 3, lead: 'Gregory', property: '', color: 'bg-red-500' },
  { day: 2, start: 4, end: 5, lead: 'Amanda Foster', property: 'Parkside Townhomes', color: 'bg-emerald-500' },
  { day: 3, start: 2, end: 3, lead: 'Robert Jackson', property: 'Mountain View Estates', color: 'bg-amber-500' },
  { day: 4, start: 1, end: 2, lead: 'Christine Anderson', property: 'Lakefront', color: 'bg-emerald-500' },
];

const upcomingTours = [
  { property: 'Sunset Villa Estates', lead: 'Marcus Rodriguez', date: 'Mar 19', time: '9:00 AM' },
  { property: 'Riverside Luxury Lofts', lead: 'Patricia O\'Brien', date: 'Mar 20', time: '10:00 AM' },
  { property: 'Parkside Townhomes', lead: 'Amanda Foster', date: 'Mar 20', time: '3:00 PM' },
  { property: 'Mountain View Estates', lead: 'Robert Jackson', date: 'Mar 21', time: '11:00 AM' },
];

export default function Tours() {
  const { role } = useRole();
  const [view, setView] = useState<'week' | 'day' | 'month'>('week');
  const title = role === 'agent' ? 'Property Visits' : 'Property Tours';
  const subtitle = 'Manage and schedule property tours with leads';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <Calendar size={18} className="text-slate-500" />
            <span>March 18-24, 2024</span>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-slate-300">
            {(['week', 'day', 'month'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-medium capitalize ${view === v ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                {v}
              </button>
            ))}
          </div>
          {role === 'agent' && (
            <button
              type="button"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              Edit Availability
            </button>
          )}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
          >
            <Plus size={18} />
            Schedule Tour
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-500 w-24">Time</th>
                  {weekDays.map((d) => (
                    <th key={d} className="px-2 py-3 text-center text-sm font-medium text-slate-600 min-w-[100px]">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((_, slotIndex) => (
                  <tr key={slotIndex} className="border-b border-slate-100">
                    <td className="px-4 py-2 text-sm text-slate-500 align-top">{timeSlots[slotIndex]}</td>
                    {weekDays.map((_, dayIndex) => {
                      const tour = mockTours.find(
                        (t) => t.day === dayIndex && t.start === slotIndex
                      );
                      const isContinuation = mockTours.some(
                        (t) => t.day === dayIndex && t.start < slotIndex && t.end > slotIndex
                      );
                      if (isContinuation) {
                        return <td key={dayIndex} className="p-1 align-top w-[100px]" />;
                      }
                      if (tour) {
                        return (
                          <td key={dayIndex} className="p-1 align-top">
                            <div className={`${tour.color} text-white text-xs p-2 rounded-lg min-h-[52px]`}>
                              <p className="font-medium">{tour.lead}</p>
                              {tour.property && <p className="opacity-90">{tour.property}</p>}
                            </div>
                          </td>
                        );
                      }
                      return <td key={dayIndex} className="p-1 align-top" />;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Upcoming Tours</h2>
            <ul className="space-y-3">
              {upcomingTours.map((t, i) => (
                <li key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <div className="w-12 h-12 rounded-lg bg-slate-200 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{t.property}</p>
                    <p className="text-xs text-slate-500">{t.lead} · {t.date}, {t.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Tour Statistics</h2>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-600">This Week</span>
              <select className="text-sm border-0 bg-transparent text-slate-600">
                <option>This Week</option>
              </select>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-emerald-600 font-medium">Completed</span>
                <span>24 <span className="text-emerald-600">+12%</span></span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-amber-600 font-medium">Pending</span>
                <span>8</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-red-600 font-medium">No-show</span>
                <span>3 <span className="text-red-600">+1</span></span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Canceled</span>
                <span>5 <span className="text-slate-500">-2</span></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
