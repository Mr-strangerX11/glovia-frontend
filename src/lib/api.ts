import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        const userId = Cookies.get('user_id');

        if (refreshToken && userId) {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken, userId }
          );

          Cookies.set('access_token', data.accessToken);
          Cookies.set('refresh_token', data.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch (err) {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('user_id');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
};

// Products API
export const productsAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
  getFeatured: (limit?: number) => api.get('/products/featured', { params: { limit } }),
  getBestSellers: (limit?: number) => api.get('/products/best-sellers', { params: { limit } }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug: string) => api.get(`/categories/${slug}`),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data: { productId: string; quantity?: number }) => api.post('/cart/items', data),
  update: (itemId: string, quantity: number) => api.put(`/cart/items/${itemId}`, { quantity }),
  remove: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart'),
};

// Wishlist API
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId: string) => api.post('/wishlist', { productId }),
  remove: (itemId: string) => api.delete(`/wishlist/${itemId}`),
};

// Orders API
export const ordersAPI = {
  create: (data: any) => api.post('/orders', data),
  getAll: (status?: string) => api.get('/orders', { params: { status } }),
  getById: (id: string) => api.get(`/orders/${id}`),
  cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  // Products
  createProduct: (data: any) => api.post('/admin/products', data),
  updateProduct: (id: string, data: any) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),
  // Orders
  getAllOrders: (status?: string) => api.get('/admin/orders', { params: { status } }),
  updateOrder: (id: string, data: any) => api.put(`/admin/orders/${id}`, data),
  // Users
  getAllCustomers: () => api.get('/admin/customers'),
  createUser: (data: any) => api.post('/admin/users', data),
  updateUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
};

// Vendor API
export const vendorAPI = {
  getProducts: (params?: any) => api.get('/vendor/products', { params }),
  getProduct: (id: string) => api.get(`/vendor/products/${id}`),
  createProduct: (data: any) => api.post('/vendor/products', data),
  updateProduct: (id: string, data: any) => api.put(`/vendor/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/vendor/products/${id}`),
};

// Payments API
export const paymentsAPI = {
  initiateEsewa: (orderId: string) => api.post(`/payments/esewa/initiate/${orderId}`),
  verifyEsewa: (data: any) => api.post('/payments/esewa/verify', data),
  initiateKhalti: (orderId: string) => api.post(`/payments/khalti/initiate/${orderId}`),
  verifyKhalti: (data: any) => api.post('/payments/khalti/verify', data),
  initiateIME: (orderId: string) => api.post(`/payments/imepay/initiate/${orderId}`),
  verifyIME: (data: any) => api.post('/payments/imepay/verify', data),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  createAddress: (data: any) => api.post('/users/addresses', data),
  updateAddress: (id: string, data: any) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),
  getOrders: () => api.get('/users/orders'),
};

// Reviews API
export const reviewsAPI = {
  create: (data: any) => api.post('/reviews', data),
  getByProduct: (productId: string) => api.get(`/reviews/product/${productId}`),
};

// Banners API
export const bannersAPI = {
  getAll: () => api.get('/banners'),
};

// Blogs API
export const blogsAPI = {
  getAll: (params?: any) => api.get('/blogs', { params }),
  getBySlug: (slug: string) => api.get(`/blogs/${slug}`),
};
