import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Search, Calendar, Send, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function EmployeeResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Request Asset Modal
  const [requestModal, setRequestModal] = useState({ open: false, resource: null });
  const [requestReason, setRequestReason] = useState('');

  // Booking Modal
  const [bookingModal, setBookingModal] = useState({ open: false, resource: null });
  const [bookingData, setBookingData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00'
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadResources();
  }, [categoryFilter, typeFilter]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (categoryFilter) query.append('category', categoryFilter);
      if (typeFilter === 'bookable') query.append('isBookable', 'true');
      if (typeFilter === 'physical') query.append('isBookable', 'false');

      const res = await api.getResources(query.toString());
      setResources(res.data?.resources || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadResources();
  };

  const handleOpenRequest = (res) => {
    setRequestModal({ open: true, resource: res });
    setRequestReason('');
    setError('');
    setSuccessMsg('');
  };

  const handleOpenBooking = (res) => {
    setBookingModal({ open: true, resource: res });
    setBookingData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00'
    });
    setError('');
    setSuccessMsg('');
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.createRequest({
        resourceId: requestModal.resource._id,
        reason: requestReason
      });
      setRequestModal({ open: false, resource: null });
      setSuccessMsg(`Request submitted successfully for ${requestModal.resource.name}! An administrator will review it.`);
      loadResources();
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.createBooking({
        resourceId: bookingModal.resource._id,
        ...bookingData
      });
      setBookingModal({ open: false, resource: null });
      setSuccessMsg(`Booking confirmed for ${bookingModal.resource.name} on ${bookingData.date} (${bookingData.startTime}-${bookingData.endTime})!`);
      loadResources();
    } catch (err) {
      setError(err.message || 'Failed to book resource');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Available Office Resources</h2>
        <p className="text-xs text-slate-500 mt-0.5">Explore available laptops, monitors, meeting rooms, and projectors</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-semibold hover:underline">Dismiss</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200/80 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, description, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Types</option>
          <option value="physical">Individual Equipment (Laptops/Monitors)</option>
          <option value="bookable">Shared Bookable (Rooms/Projectors)</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Categories</option>
          <option value="Laptop">Laptop</option>
          <option value="Monitor">Monitor</option>
          <option value="Projector">Projector</option>
          <option value="Meeting Room">Meeting Room</option>
          <option value="Printer">Printer</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Resource Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400">No resources match your search</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((item) => (
            <div
              key={item._id}
              className="rounded-xl bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    {item.resourceId}
                  </span>
                  <Badge status={item.status} />
                </div>

                <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                  {item.description || 'No description provided.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-medium text-slate-700">{item.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Location:</span>
                    <div className="flex items-center space-x-1 font-medium text-slate-700 truncate max-w-[150px]">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                {item.isBookable ? (
                  <button
                    disabled={item.status === 'UNDER_MAINTENANCE' || item.status === 'INACTIVE'}
                    onClick={() => handleOpenBooking(item)}
                    className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center space-x-1.5 transition"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Shared Schedule</span>
                  </button>
                ) : (
                  <button
                    disabled={item.status !== 'AVAILABLE'}
                    onClick={() => handleOpenRequest(item)}
                    className="w-full py-2 px-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center space-x-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{item.status === 'AVAILABLE' ? 'Request Allocation' : `Unavailable (${item.status})`}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      <Modal
        isOpen={requestModal.open}
        onClose={() => setRequestModal({ open: false, resource: null })}
        title={`Request Resource: ${requestModal.resource?.name}`}
      >
        <form onSubmit={submitRequest} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Request</label>
            <textarea
              rows={3}
              required
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              placeholder="e.g. Needed for development sprint testing and client demo."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRequestModal({ open: false, resource: null })}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request to Admin'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Book Shared Resource Modal */}
      <Modal
        isOpen={bookingModal.open}
        onClose={() => setBookingModal({ open: false, resource: null })}
        title={`Book Shared Resource: ${bookingModal.resource?.name}`}
      >
        <form onSubmit={submitBooking} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting / Booking Purpose</label>
            <input
              type="text"
              required
              value={bookingData.title}
              onChange={(e) => setBookingData({ ...bookingData, title: e.target.value })}
              placeholder="e.g. Sprint Retrospective & Architecture Review"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={bookingData.date}
              onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time (24h)</label>
              <input
                type="time"
                required
                value={bookingData.startTime}
                onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time (24h)</label>
              <input
                type="time"
                required
                value={bookingData.endTime}
                onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 border border-amber-200">
            <strong>Conflict Prevention:</strong> Bookings overlapping existing reservations on the same date will be automatically rejected.
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setBookingModal({ open: false, resource: null })}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Confirming...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
