import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Badge from '../../components/common/Badge';
import { Calendar, Clock, MapPin, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmployeeBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyBookings();
  }, []);

  const loadMyBookings = async () => {
    try {
      setLoading(true);
      const res = await api.getBookings();
      setBookings(res.data?.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id, title) => {
    if (!window.confirm(`Are you sure you want to cancel booking "${title}"?`)) return;
    try {
      await api.cancelBooking(id);
      loadMyBookings();
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Room & Equipment Bookings</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage your upcoming and past reservations for conference rooms and shared equipment</p>
        </div>

        <Link
          to="/employee/resources"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <span>Book Resource</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading your bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <p>You have not made any room or equipment reservations.</p>
            <Link to="/employee/resources" className="text-brand-600 font-semibold mt-2 inline-block hover:underline">
              Browse Shared Bookable Resources
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Meeting Purpose</th>
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
                      <Badge status={b.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {b.status === 'UPCOMING' && (
                        <button
                          onClick={() => handleCancel(b._id, b.title)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Booking</span>
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
