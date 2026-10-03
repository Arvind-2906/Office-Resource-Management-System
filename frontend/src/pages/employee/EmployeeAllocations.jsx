import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { RotateCcw, Box, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function EmployeeAllocations() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Return Request Modal
  const [returnModal, setReturnModal] = useState({ open: false, alloc: null });
  const [returnNotes, setReturnNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadMyAllocations();
  }, []);

  const loadMyAllocations = async () => {
    try {
      setLoading(true);
      const res = await api.getAllocations();
      setAllocations(res.data?.allocations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.requestReturn(returnModal.alloc._id, returnNotes);
      setReturnModal({ open: false, alloc: null });
      setReturnNotes('');
      setSuccessMsg(`Return request submitted for ${returnModal.alloc.resource?.name}. Please deposit equipment with IT admin.`);
      loadMyAllocations();
    } catch (err) {
      setError(err.message || 'Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">My Allocated Assets</h2>
        <p className="text-xs text-slate-500 mt-0.5">Hardware and physical equipment currently assigned to your custody</p>
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
          <div className="p-8 text-center text-xs text-slate-400">Loading your allocations...</div>
        ) : allocations.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">You currently have no allocated office equipment.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Allocated Asset</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Assigned Date</th>
                  <th className="py-3 px-4">Expected Return</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.map((alloc) => (
                  <tr key={alloc._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{alloc.resource?.name}</p>
                      <span className="font-mono text-[10px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                        {alloc.resource?.resourceId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{alloc.resource?.category}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(alloc.allocatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {alloc.expectedReturnDate
                        ? new Date(alloc.expectedReturnDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Permanent / Open'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={alloc.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {alloc.notes || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {alloc.status === 'ACTIVE' && (
                        <button
                          onClick={() => {
                            setError('');
                            setReturnModal({ open: true, alloc });
                          }}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-md transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Initiate Return</span>
                        </button>
                      )}
                      {alloc.status === 'RETURN_REQUESTED' && (
                        <span className="text-[11px] text-amber-600 font-medium italic">
                          Awaiting Admin Check-in
                        </span>
                      )}
                      {alloc.status === 'RETURNED' && (
                        <span className="text-[11px] text-slate-400">
                          Returned {alloc.returnedAt ? new Date(alloc.returnedAt).toLocaleDateString() : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Return Request Modal */}
      <Modal
        isOpen={returnModal.open}
        onClose={() => setReturnModal({ open: false, alloc: null })}
        title={`Initiate Equipment Return: ${returnModal.alloc?.resource?.name}`}
      >
        <form onSubmit={handleReturnRequest} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-slate-600">
            Submit a return request when you no longer need this resource. An administrator will verify the physical condition of <strong>{returnModal.alloc?.resource?.name} ({returnModal.alloc?.resource?.resourceId})</strong> and confirm the return.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Return Comments / Physical Condition</label>
            <textarea
              rows={3}
              required
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="e.g. Project completed, returning laptop with original charger and mouse in good condition."
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReturnModal({ open: false, alloc: null })}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
