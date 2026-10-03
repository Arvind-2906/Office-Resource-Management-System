import React from 'react';

const statusStyles = {
  // Resource & General statuses
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ALLOCATED: 'bg-blue-50 text-blue-700 border-blue-200',
  BOOKED: 'bg-purple-50 text-purple-700 border-purple-200',
  UNDER_MAINTENANCE: 'bg-amber-50 text-amber-700 border-amber-200',
  INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200',

  // Request statuses
  PENDING: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',

  // Allocation statuses
  ACTIVE: 'bg-blue-50 text-blue-700 border-blue-200',
  RETURN_REQUESTED: 'bg-orange-50 text-orange-700 border-orange-200',
  RETURNED: 'bg-slate-100 text-slate-700 border-slate-200',

  // Booking statuses
  UPCOMING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ONGOING: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-slate-100 text-slate-600 border-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',

  // Maintenance priorities
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-rose-50 text-rose-700 border-rose-200',

  // Maintenance status
  IN_PROGRESS: 'bg-sky-50 text-sky-700 border-sky-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function Badge({ status, text }) {
  const normalized = (status || '').toUpperCase();
  const style = statusStyles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = text || normalized.replace('_', ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {label}
    </span>
  );
}
