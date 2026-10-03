import api from './api';

export const cartService = {
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data.cart;
  },

  addToCart: async (productId, quantity = 1) => {
    const res = await api.post('/cart', { productId, quantity });
    return res.data.cart;
  },

  updateQuantity: async (productId, quantity) => {
    const res = await api.patch(`/cart/${productId}`, { quantity });
    return res.data.cart;
  },

  removeItem: async (productId) => {
    const res = await api.delete(`/cart/${productId}`);
    return res.data.cart;
  },

  clearCart: async () => {
    const res = await api.delete('/cart');
    return res.data.cart;
  }
};

export default cartService;
