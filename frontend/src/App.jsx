import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Public pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminResources from './pages/admin/AdminResources';
import AdminRequests from './pages/admin/AdminRequests';
import AdminAllocations from './pages/admin/AdminAllocations';
import AdminBookings from './pages/admin/AdminBookings';
import AdminMaintenance from './pages/admin/AdminMaintenance';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminActivity from './pages/admin/AdminActivity';

// Employee pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeResources from './pages/employee/EmployeeResources';
import EmployeeRequests from './pages/employee/EmployeeRequests';
import EmployeeAllocations from './pages/employee/EmployeeAllocations';
import EmployeeBookings from './pages/employee/EmployeeBookings';
import EmployeeMaintenance from './pages/employee/EmployeeMaintenance';
import EmployeeProfile from './pages/employee/EmployeeProfile';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'ADMIN' ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/employee/dashboard" replace />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<AppLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/resources" element={<AdminResources />} />
                <Route path="/admin/requests" element={<AdminRequests />} />
                <Route path="/admin/allocations" element={<AdminAllocations />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
                <Route path="/admin/maintenance" element={<AdminMaintenance />} />
                <Route path="/admin/employees" element={<AdminEmployees />} />
                <Route path="/admin/activity" element={<AdminActivity />} />
              </Route>
            </Route>

            {/* Employee routes */}
            <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE', 'ADMIN']} />}>
              <Route element={<AppLayout />}>
                <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                <Route path="/employee/resources" element={<EmployeeResources />} />
                <Route path="/employee/requests" element={<EmployeeRequests />} />
                <Route path="/employee/allocations" element={<EmployeeAllocations />} />
                <Route path="/employee/bookings" element={<EmployeeBookings />} />
                <Route path="/employee/maintenance" element={<EmployeeMaintenance />} />
                <Route path="/employee/profile" element={<EmployeeProfile />} />
              </Route>
            </Route>

            {/* Index & Fallback */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
