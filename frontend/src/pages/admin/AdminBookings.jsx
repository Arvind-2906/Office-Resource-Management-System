import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Badge from '../../components/common/Badge';
import { Calendar, Clock, MapPin, XCircle, Search } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    loadBookings();
  }, [statusFilter, dateFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (statusFilter) query.append('status', statusFilter);
      if (dateFilter) query.append('date', dateFilter);

      const res = await api.getBookings(query.toString());
      setBookings(res.data?.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id, title) => {
    if (!window.confirm(`Are you sure you want to cancel the booking "${title}"?`)) return;
    try {
      await api.cancelBooking(id);
      loadBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Shared Resource Bookings</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage schedule reservations for conference rooms and shared equipment</p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="UPCOMING">UPCOMING</option>
            <option value="ONGOING">ONGOING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No bookings found for the selected filters</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Meeting Purpose</th>
                  <th className="py-3 px-4">Booked By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5 text-slate-800 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.date}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px] text-brand-600 mt-0.5">
                        <Clock className="w-3 h-3 text-brand-500" />
                        <span>{b.startTime} - {b.endTime}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{b.resource?.name}</p>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{b.resource?.location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{b.title}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{b.bookedBy?.name}</p>
                      <p className="text-[11px] text-slate-400">{b.bookedBy?.department}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={b.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCancelBooking(b._id, b.title)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
