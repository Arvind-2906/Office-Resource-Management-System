import api from './api';

export const paymentService = {
  processPayment: async ({ orderId, method, simulateFailure = false, details = {} }) => {
    const res = await api.post('/payments', {
      orderId,
      method,
      simulateFailure,
      details
    });
    return res.data.payment;
  },

  getPaymentByOrderId: async (orderId) => {
    const res = await api.get(`/payments/${orderId}`);
    return res.data.payments;
  }
};

export default paymentService;
