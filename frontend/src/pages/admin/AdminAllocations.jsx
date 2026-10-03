import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { CheckCircle2, RotateCcw, AlertTriangle, Plus, Search } from 'lucide-react';

export default function AdminAllocations() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Confirm Return Modal
  const [returnModal, setReturnModal] = useState({ open: false, alloc: null });
  const [conditionNotes, setConditionNotes] = useState('');

  // Direct Allocation Modal
  const [directModal, setDirectModal] = useState(false);
  const [resources, setResources] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [directData, setDirectData] = useState({
    resourceId: '',
    employeeId: '',
    expectedReturnDate: '',
    notes: ''
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAllocations();
  }, [statusFilter]);

  const loadAllocations = async () => {
    try {
      setLoading(true);
      const query = statusFilter ? `status=${statusFilter}` : '';
      const res = await api.getAllocations(query);
      setAllocations(res.data?.allocations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDirectModal = async () => {
    try {
      setError('');
      // Fetch available resources & active employees
      const [resData, empData] = await Promise.all([
        api.getResources('status=AVAILABLE'),
        api.getUsers('role=EMPLOYEE')
      ]);
      setResources(resData.data?.resources || []);
      setEmployees(empData.data?.users || []);
      setDirectData({
        resourceId: resData.data?.resources?.[0]?._id || '',
        employeeId: empData.data?.users?.[0]?._id || '',
        expectedReturnDate: '',
        notes: ''
      });
      setDirectModal(true);
    } catch (err) {
      alert(err.message || 'Failed to prepare direct allocation form');
    }
  };

  const handleDirectAllocate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.createAllocation(directData);
      setDirectModal(false);
      loadAllocations();
    } catch (err) {
      setError(err.message || 'Direct allocation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.confirmReturn(returnModal.alloc._id, conditionNotes);
      setReturnModal({ open: false, alloc: null });
      setConditionNotes('');
      loadAllocations();
    } catch (err) {
      setError(err.message || 'Failed to confirm return');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Resource Allocations & Returns</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track currently allocated assets, return requests, and check-in equipment</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Allocations</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="RETURN_REQUESTED">RETURN REQUESTED</option>
            <option value="RETURNED">RETURNED</option>
          </select>

          <button
            onClick={openDirectModal}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Direct Allocate</span>
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading allocations...</div>
        ) : allocations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No allocation records found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Allocated To</th>
                  <th className="py-3 px-4">Allocated Date</th>
                  <th className="py-3 px-4">Expected Return</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Notes / History</th>
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
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{alloc.employee?.name}</p>
                      <p className="text-[11px] text-slate-400">{alloc.employee?.department}</p>
                    </td>
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
                      {alloc.status !== 'RETURNED' && (
                        <button
                          onClick={() => {
                            setError('');
                            setReturnModal({ open: true, alloc });
                          }}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold border transition ${
                            alloc.status === 'RETURN_REQUESTED'
                              ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 animate-pulse'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Confirm Return</span>
                        </button>
                      )}
                      {alloc.status === 'RETURNED' && (
                        <span className="text-[11px] text-emerald-600 font-medium">
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

      {/* Confirm Return Modal */}
      <Modal
        isOpen={returnModal.open}
        onClose={() => setReturnModal({ open: false, alloc: null })}
        title={`Confirm Asset Return: ${returnModal.alloc?.resource?.name}`}
      >
        <form onSubmit={handleConfirmReturn} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <p className="text-xs text-slate-600">
            Confirming return will release this asset from <strong>{returnModal.alloc?.employee?.name}</strong> and update the resource status back to <strong>AVAILABLE</strong> for other employees.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment Condition / Verification Notes</label>
            <textarea
              rows={3}
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              placeholder="e.g. Asset returned in clean physical condition with charger, no damage."
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
              {submitting ? 'Confirming...' : 'Confirm Return & Make Available'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Direct Allocation Modal */}
      <Modal
        isOpen={directModal}
        onClose={() => setDirectModal(false)}
        title="Direct Resource Allocation"
      >
        <form onSubmit={handleDirectAllocate} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Available Resource</label>
            <select
              required
              value={directData.resourceId}
              onChange={(e) => setDirectData({ ...directData, resourceId: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {resources.length === 0 ? (
                <option value="">No available resources found</option>
              ) : (
                resources.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.resourceId} - {r.name} ({r.category})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Employee</label>
            <select
              required
              value={directData.employeeId}
              onChange={(e) => setDirectData({ ...directData, employeeId: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {employees.length === 0 ? (
                <option value="">No employees found</option>
              ) : (
                employees.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.department} - {u.email})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Return Date (Optional)</label>
            <input
              type="date"
              value={directData.expectedReturnDate}
              onChange={(e) => setDirectData({ ...directData, expectedReturnDate: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={directData.notes}
              onChange={(e) => setDirectData({ ...directData, notes: e.target.value })}
              placeholder="e.g. Directly assigned by IT manager"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDirectModal(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || resources.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Allocating...' : 'Allocate Asset'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
