import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Box, CheckCircle2, Clock, Calendar, Wrench, ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../../components/common/Badge';

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getEmployeeDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load employee dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
        {error}
      </div>
    );
  }

  const { counts, myAllocations, myPendingRequests, myActiveBookings, myMaintenanceReports } = data || {
    counts: {},
    myAllocations: [],
    myPendingRequests: [],
    myActiveBookings: [],
    myMaintenanceReports: []
  };

  const statCards = [
    { title: 'Allocated Equipment', value: counts.allocatedCount || 0, icon: Box, color: 'text-blue-600', bg: 'bg-blue-50', link: '/employee/allocations' },
    { title: 'Pending Requests', value: counts.pendingRequestsCount || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', link: '/employee/requests' },
    { title: 'Upcoming Bookings', value: counts.activeBookingsCount || 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', link: '/employee/bookings' },
    { title: 'Maintenance Tickets', value: counts.maintenanceCount || 0, icon: Wrench, color: 'text-rose-600', bg: 'bg-rose-50', link: '/employee/maintenance' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Employee Workspace</h2>
          <p className="text-xs text-slate-500 mt-0.5">Quick access to your allocated assets, room bookings, and requests</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/employee/resources"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Browse & Request Assets</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              to={card.link}
              className="rounded-xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-brand-600 group-hover:translate-x-1 transition-transform">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Currently Allocated Assets */}
        <div className="rounded-xl bg-white shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">My Allocated Assets</h3>
            <Link to="/employee/allocations" className="text-xs font-medium text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          {myAllocations.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">You currently have no allocated equipment</p>
          ) : (
            <div className="space-y-3">
              {myAllocations.map((alloc) => (
                <div key={alloc._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{alloc.resource?.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{alloc.resource?.resourceId} ({alloc.resource?.category})</p>
                  </div>
                  <Badge status={alloc.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Upcoming Bookings */}
        <div className="rounded-xl bg-white shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">My Active Bookings</h3>
            <Link to="/employee/bookings" className="text-xs font-medium text-brand-600 hover:underline">
              View All
            </Link>
          </div>

          {myActiveBookings.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No upcoming bookings scheduled</p>
          ) : (
            <div className="space-y-3">
              {myActiveBookings.map((b) => (
                <div key={b._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{b.title}</p>
                    <p className="text-[11px] text-brand-600 font-medium">{b.resource?.name} • {b.date} ({b.startTime} - {b.endTime})</p>
                  </div>
                  <Badge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
