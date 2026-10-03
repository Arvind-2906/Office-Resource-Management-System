import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  ClipboardList,
  CheckCircle2,
  Calendar,
  Wrench,
  Users,
  Activity,
  UserCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/resources', icon: Box, label: 'Resource Inventory' },
    { to: '/admin/requests', icon: ClipboardList, label: 'Resource Requests' },
    { to: '/admin/allocations', icon: CheckCircle2, label: 'Allocations & Returns' },
    { to: '/admin/bookings', icon: Calendar, label: 'Room & Equipment Bookings' },
    { to: '/admin/maintenance', icon: Wrench, label: 'Maintenance Issues' },
    { to: '/admin/employees', icon: Users, label: 'Employee Management' },
    { to: '/admin/activity', icon: Activity, label: 'System Activity Logs' },
  ];

  const employeeLinks = [
    { to: '/employee/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
    { to: '/employee/resources', icon: Box, label: 'Available Resources' },
    { to: '/employee/requests', icon: ClipboardList, label: 'My Requests' },
    { to: '/employee/allocations', icon: CheckCircle2, label: 'My Allocated Items' },
    { to: '/employee/bookings', icon: Calendar, label: 'My Bookings' },
    { to: '/employee/maintenance', icon: Wrench, label: 'Report Maintenance' },
    { to: '/employee/profile', icon: UserCheck, label: 'My Profile' },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="flex items-center space-x-3 px-6 h-16 border-b border-slate-200">
          <div className="p-2 bg-brand-600 rounded-lg text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-tight">Office Resource</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Management System</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {isAdmin ? 'Administration' : 'Employee Portal'}
          </p>
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Agile + DevOps Lab</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Mini-Project demonstration</p>
        </div>
      </div>
    </aside>
  );
}
