const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include', // Support HttpOnly cookies
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMessage = data.message || (data.errors && data.errors.join(', ')) || `HTTP error ${res.status}`;
      const error = new Error(errorMessage);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Auth
  signup: (userData) => request('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),

  // Users (Admin)
  getUsers: (params = '') => request(`/users${params ? `?${params}` : ''}`),
  createUser: (userData) => request('/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateUser: (id, userData) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  updateUserStatus: (id, isActive) => request(`/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),

  // Resources
  getResources: (params = '') => request(`/resources${params ? `?${params}` : ''}`),
  getResourceById: (id) => request(`/resources/${id}`),
  createResource: (resData) => request('/resources', { method: 'POST', body: JSON.stringify(resData) }),
  updateResource: (id, resData) => request(`/resources/${id}`, { method: 'PUT', body: JSON.stringify(resData) }),
  updateResourceStatus: (id, status) => request(`/resources/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteResource: (id) => request(`/resources/${id}`, { method: 'DELETE' }),

  // Requests
  getRequests: (params = '') => request(`/requests${params ? `?${params}` : ''}`),
  createRequest: (reqData) => request('/requests', { method: 'POST', body: JSON.stringify(reqData) }),
  approveRequest: (id, approveData) => request(`/requests/${id}/approve`, { method: 'PATCH', body: JSON.stringify(approveData) }),
  rejectRequest: (id, rejectionReason) => request(`/requests/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ rejectionReason }) }),

  // Allocations
  getAllocations: (params = '') => request(`/allocations${params ? `?${params}` : ''}`),
  createAllocation: (allocData) => request('/allocations', { method: 'POST', body: JSON.stringify(allocData) }),
  requestReturn: (id, returnNotes) => request(`/allocations/${id}/return-request`, { method: 'PATCH', body: JSON.stringify({ returnNotes }) }),
  confirmReturn: (id, conditionNotes) => request(`/allocations/${id}/confirm-return`, { method: 'PATCH', body: JSON.stringify({ conditionNotes }) }),

  // Bookings
  getBookings: (params = '') => request(`/bookings${params ? `?${params}` : ''}`),
  createBooking: (bookingData) => request('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
  cancelBooking: (id) => request(`/bookings/${id}/cancel`, { method: 'PATCH' }),

  // Maintenance
  getMaintenance: (params = '') => request(`/maintenance${params ? `?${params}` : ''}`),
  reportMaintenance: (data) => request('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
  updateMaintenanceStatus: (id, status, resolutionNote) => request(`/maintenance/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, resolutionNote }) }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  // Activity
  getActivityLogs: (limit = 100) => request(`/activity?limit=${limit}`),

  // Dashboards
  getAdminDashboard: () => request('/dashboard/admin'),
  getEmployeeDashboard: () => request('/dashboard/employee'),
};
