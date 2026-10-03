import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Wrench, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function EmployeeMaintenance() {
  const [records, setRecords] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Report Issue Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    resourceId: '',
    issue: '',
    priority: 'MEDIUM'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadMaintenance();
    loadResources();
  }, []);

  const loadMaintenance = async () => {
    try {
      setLoading(true);
      const res = await api.getMaintenance();
      setRecords(res.data?.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      const res = await api.getResources();
      setResources(res.data?.resources || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openReportModal = () => {
    setFormData({
      resourceId: resources[0]?._id || '',
      issue: '',
      priority: 'MEDIUM'
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.reportMaintenance(formData);
      setIsModalOpen(false);
      setSuccessMsg('Maintenance ticket reported successfully. The IT admin team has been notified.');
      loadMaintenance();
    } catch (err) {
      setError(err.message || 'Failed to submit maintenance report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Report Equipment Maintenance</h2>
          <p className="text-xs text-slate-500 mt-0.5">Submit repair and maintenance requests for damaged or malfunctioning office resources</p>
        </div>

        <button
          onClick={openReportModal}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Report Maintenance Issue</span>
        </button>
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

      <div className="rounded-xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading maintenance records...</div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">You haven't reported any equipment maintenance tickets.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Reported On</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Issue Description</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Resolution Note</th>
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
                    <td className="py-3 px-4 text-slate-700 max-w-xs">{rec.issue}</td>
                    <td className="py-3 px-4">
                      <Badge status={rec.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={rec.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {rec.resolutionNote ? (
                        <span className="text-emerald-700 font-medium">{rec.resolutionNote}</span>
                      ) : (
                        <span className="text-slate-400 italic">Pending technician action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Report Resource Maintenance Problem"
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Resource</label>
            <select
              required
              value={formData.resourceId}
              onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {resources.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.resourceId} - {r.name} ({r.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="LOW">LOW - Minor wear or non-blocking defect</option>
              <option value="MEDIUM">MEDIUM - Impairs usage or software problem</option>
              <option value="HIGH">HIGH - Critical failure, completely non-functional</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Describe Malfunction / Defect</label>
            <textarea
              rows={3}
              required
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
              placeholder="e.g. Screen flickering when moved, battery draining rapidly in 30 minutes."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Ticket to Admin'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
