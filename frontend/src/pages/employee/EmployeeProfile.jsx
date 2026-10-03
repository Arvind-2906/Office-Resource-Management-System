import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Briefcase, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function EmployeeProfile() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">My Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">Your employee identity, department assignment, and permissions</p>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200/80 p-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-brand-500/10 text-brand-600 font-bold text-xl flex items-center justify-center border-2 border-brand-500/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.department}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {user?.role}
              </span>
              <span className="inline-flex items-center text-[11px] text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Active Account
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>Email Address</span>
            </span>
            <p className="font-semibold text-slate-800">{user?.email}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Department</span>
            </span>
            <p className="font-semibold text-slate-800">{user?.department || 'General'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>Contact Phone</span>
            </span>
            <p className="font-semibold text-slate-800">{user?.phone || 'Not specified'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Access Level</span>
            </span>
            <p className="font-semibold text-slate-800">Standard Employee (RBAC Protected)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
