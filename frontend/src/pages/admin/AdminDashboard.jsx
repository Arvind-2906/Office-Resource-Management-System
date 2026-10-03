import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Box, CheckCircle2, Clock, Calendar, Wrench, Activity, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics');
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

  const { metrics, recentActivity } = data || { metrics: {}, recentActivity: [] };

  const cards = [
    { title: 'Total Resources', value: metrics.totalResources || 0, icon: Box, color: 'text-blue-600', bg: 'bg-blue-50', link: '/admin/resources' },
    { title: 'Available Resources', value: metrics.availableResources || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/resources' },
    { title: 'Allocated Resources', value: metrics.allocatedResources || 0, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/allocations' },
    { title: 'Pending Requests', value: metrics.pendingRequests || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/requests', alert: metrics.pendingRequests > 0 },
    { title: 'Active Bookings', value: metrics.activeBookings || 0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', link: '/admin/bookings' },
    { title: 'Open Maintenance', value: metrics.openMaintenance || 0, icon: Wrench, color: 'text-rose-600', bg: 'bg-rose-50', link: '/admin/maintenance', alert: metrics.openMaintenance > 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Admin Operations Dashboard</h2>
        <p className="text-xs text-slate-500 mt-0.5">Real-time overview of office resources, allocations, and requests</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              to={card.link}
              className="relative overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow group"
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
              {card.alert && (
                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-xl bg-white shadow-sm border border-slate-200/80 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-semibold text-slate-800">Recent System Activity</h3>
          </div>
          <Link to="/admin/activity" className="text-xs font-medium text-brand-600 hover:underline">
            View All Logs
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No recent activity recorded</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentActivity.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {log.user?.name || 'System'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{log.description}</td>
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
