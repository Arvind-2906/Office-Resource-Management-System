import api from './api';

export const orderService = {
  createOrder: async ({ shippingAddress, paymentMethod, discountAmount }) => {
    const res = await api.post('/orders', {
      shippingAddress,
      paymentMethod,
      discountAmount
    });
    return res.data.order;
  },

  getMyOrders: async () => {
    const res = await api.get('/orders');
    return res.data.orders;
  },

  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data.order;
  },

  cancelOrder: async (id) => {
    const res = await api.patch(`/orders/${id}/cancel`, {});
    return res.data.order;
  },

  // Admin APIs
  getAdminOrders: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);

    const qs = searchParams.toString();
    const res = await api.get(`/admin/orders${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  updateOrderStatus: async (id, status, message) => {
    const res = await api.patch(`/admin/orders/${id}/status`, { status, message });
    return res.data.order;
  },

  getAdminStats: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  getAdminUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data.users;
  }
};

export default orderService;
