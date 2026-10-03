import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import Badge from '../../components/common/Badge';
import { Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmployeeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyRequests();
  }, []);

  const loadMyRequests = async () => {
    try {
      setLoading(true);
      const res = await api.getRequests();
      setRequests(res.data?.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Resource Requests</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track the status of your equipment and hardware allocation requests</p>
        </div>

        <Link
          to="/employee/resources"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <span>New Request</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading your requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <p>You haven't submitted any resource requests yet.</p>
            <Link to="/employee/resources" className="text-brand-600 font-semibold mt-2 inline-block hover:underline">
              Browse Available Assets
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Requested On</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Reason Given</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Admin Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(req.requestedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{req.resource?.name}</p>
                      <span className="font-mono text-[10px] text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                        {req.resource?.resourceId}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{req.resource?.category}</td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs">{req.reason}</td>
                    <td className="py-3 px-4">
                      <Badge status={req.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {req.status === 'REJECTED' && req.rejectionReason && (
                        <p className="text-rose-600 font-medium text-xs">Reason: {req.rejectionReason}</p>
                      )}
                      {req.status === 'APPROVED' && (
                        <p className="text-emerald-600 font-medium text-xs">Approved & Allocated</p>
                      )}
                      {req.status === 'PENDING' && (
                        <p className="text-amber-600 font-medium text-xs">Under admin review</p>
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
