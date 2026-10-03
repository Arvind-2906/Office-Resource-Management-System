import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Check, X, Clock, Calendar, AlertCircle } from 'lucide-react';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Approve modal
  const [approveModal, setApproveModal] = useState({ open: false, req: null });
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');

  // Reject modal
  const [rejectModal, setRejectModal] = useState({ open: false, req: null });
  const [rejectionReason, setRejectionReason] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const query = statusFilter ? `status=${statusFilter}` : '';
      const res = await api.getRequests(query);
      setRequests(res.data?.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.approveRequest(approveModal.req._id, { expectedReturnDate, notes });
      setApproveModal({ open: false, req: null });
      setExpectedReturnDate('');
      setNotes('');
      loadRequests();
    } catch (err) {
      setError(err.message || 'Failed to approve request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.rejectRequest(rejectModal.req._id, rejectionReason);
      setRejectModal({ open: false, req: null });
      setRejectionReason('');
      loadRequests();
    } catch (err) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Resource Requests Approval</h2>
          <p className="text-xs text-slate-500 mt-0.5">Review, approve, or reject employee resource allocation requests</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Requests</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No requests found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Requested Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(req.requestedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{req.employee?.name}</p>
                      <p className="text-[11px] text-slate-400">{req.employee?.department} ({req.employee?.email})</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{req.resource?.name}</p>
                      <span className="font-mono text-[10px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                        {req.resource?.resourceId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{req.reason}</td>
                    <td className="py-3 px-4">
                      <Badge status={req.status} />
                      {req.rejectionReason && (
                        <p className="text-[10px] text-rose-500 mt-1 italic">Reason: {req.rejectionReason}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setError('');
                              setApproveModal({ open: true, req });
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md font-semibold text-xs border border-emerald-200 transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              setError('');
                              setRejectModal({ open: true, req });
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md font-semibold text-xs border border-rose-200 transition"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={approveModal.open}
        onClose={() => setApproveModal({ open: false, req: null })}
        title={`Approve Allocation: ${approveModal.req?.resource?.name}`}
      >
        <form onSubmit={handleApprove} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-slate-600">
            Approving this request will immediately assign the resource to <strong>{approveModal.req?.employee?.name}</strong> and update its status to <strong>ALLOCATED</strong>.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Return Date (Optional)</label>
            <input
              type="date"
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Allocation Notes / Accessories (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Issued with power adapter, HDMI cable and carrying bag"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setApproveModal({ open: false, req: null })}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Allocating...' : 'Confirm & Allocate'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => setRejectModal({ open: false, req: null })}
        title={`Reject Request: ${rejectModal.req?.resource?.name}`}
      >
        <form onSubmit={handleReject} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason</label>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide a clear reason for the employee..."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRejectModal({ open: false, req: null })}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
