import api from './api';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token);
    }
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {});
    } finally {
      localStorage.removeItem('token');
    }
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.user;
  },

  addAddress: async (addressData) => {
    const res = await api.post('/auth/address', addressData);
    return res.data;
  }
};

export default authService;
