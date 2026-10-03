import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'All') {
        searchParams.append(key, value);
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    const res = await api.get(endpoint);
    return res.data;
  },

  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data.product;
  },

  getCategories: async () => {
    const res = await api.get('/products/categories');
    return res.data.categories;
  },

  getFilters: async () => {
    const res = await api.get('/products/filters');
    return res.data;
  },

  createProduct: async (productData) => {
    const res = await api.post('/products', productData);
    return res.data.product;
  },

  updateProduct: async (id, updateData) => {
    const res = await api.put(`/products/${id}`, updateData);
    return res.data.product;
  },

  deleteProduct: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  }
};

export default productService;
