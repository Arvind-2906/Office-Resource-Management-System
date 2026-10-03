import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Wrench, CheckCircle, Clock, AlertTriangle, Edit3 } from 'lucide-react';

export default function AdminMaintenance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Status update modal
  const [updateModal, setUpdateModal] = useState({ open: false, record: null });
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [resolutionNote, setResolutionNote] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMaintenance();
  }, [statusFilter, priorityFilter]);

  const loadMaintenance = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (statusFilter) query.append('status', statusFilter);
      if (priorityFilter) query.append('priority', priorityFilter);

      const res = await api.getMaintenance(query.toString());
      setRecords(res.data?.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (rec) => {
    setUpdateModal({ open: true, record: rec });
    setNewStatus(rec.status === 'PENDING' ? 'IN_PROGRESS' : 'RESOLVED');
    setResolutionNote(rec.resolutionNote || '');
    setError('');
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.updateMaintenanceStatus(updateModal.record._id, newStatus, resolutionNote);
      setUpdateModal({ open: false, record: null });
      loadMaintenance();
    } catch (err) {
      setError(err.message || 'Failed to update maintenance status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Resource Maintenance & Repairs</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage tickets for broken or malfunctioning office hardware and facilities</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">HIGH Priority</option>
            <option value="MEDIUM">MEDIUM Priority</option>
            <option value="LOW">LOW Priority</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading maintenance records...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No maintenance tickets found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Reported</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Reported By</th>
                  <th className="py-3 px-4">Issue Description</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Resolution Note</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(rec.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{rec.resource?.name}</p>
                      <span className="font-mono text-[10px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                        {rec.resource?.resourceId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{rec.reportedBy?.name}</p>
                      <p className="text-[11px] text-slate-400">{rec.reportedBy?.department}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs">{rec.issue}</td>
                    <td className="py-3 px-4">
                      <Badge status={rec.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={rec.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {rec.resolutionNote || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {rec.status !== 'RESOLVED' ? (
                        <button
                          onClick={() => openUpdateModal(rec)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-md transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Update</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={updateModal.open}
        onClose={() => setUpdateModal({ open: false, record: null })}
        title={`Update Maintenance: ${updateModal.record?.resource?.name}`}
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Maintenance Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            >
              <option value="IN_PROGRESS">IN PROGRESS (Under Repair)</option>
              <option value="RESOLVED">RESOLVED (Restores resource to AVAILABLE)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Resolution / Action Note</label>
            <textarea
              rows={3}
              required={newStatus === 'RESOLVED'}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Replaced display cable, ran diagnostic test, working normally."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUpdateModal({ open: false, record: null })}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save & Update Resource'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
