import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
axios.defaults.timeout = 10000;

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    // Get token from cookies instead of localStorage
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear auth if it's actually an auth error, not a network error
      if (error.response?.data?.message?.includes('token') || 
          error.response?.data?.message?.includes('unauthorized') ||
          error.response?.data?.message?.includes('expired')) {
        // Token expired or invalid - clear both localStorage and cookies
        localStorage.removeItem('user');
        // Clear auth-token cookie
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Service functions
export const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials: { email: string; password: string }) =>
      axios.post('/auth/login', credentials),
    
    register: (userData: { name: string; email: string; password: string; role?: string }) =>
      axios.post('/auth/register', userData),
    
    logout: () =>
      axios.post('/auth/logout'),
    
    me: () =>
      axios.get('/auth/me'),
    
    updateProfile: (userData: Partial<{ name: string; email: string }>) =>
      axios.put('/auth/profile', userData),
  },

  // Products endpoints
  products: {
    getAll: (params?: { page?: number; limit?: number; search?: string; category?: string }) =>
      axios.get('/products', { params }),
    
    getById: (id: string) =>
      axios.get(`/products/${id}`),
    
    create: (productData: any) =>
      axios.post('/products', productData),
    
    update: (id: string, productData: any) =>
      axios.put(`/products/${id}`, productData),
    
    delete: (id: string) =>
      axios.delete(`/products/${id}`),
  },

  // Invoices endpoints
  invoices: {
    getAll: (params?: { page?: number; limit?: number; status?: string; dateFrom?: string; dateTo?: string }) =>
      axios.get('/billing/invoices', { params }),
    
    getById: (id: string) =>
      axios.get(`/billing/invoices/${id}`),
    
    create: (invoiceData: any) =>
      axios.post('/billing/invoices', invoiceData),
    
    update: (id: string, invoiceData: any) =>
      axios.put(`/billing/invoices/${id}`, invoiceData),
    
    delete: (id: string) =>
      axios.delete(`/billing/invoices/${id}`),
    
    generatePDF: (id: string) =>
      axios.get(`/billing/invoices/${id}/pdf`, { responseType: 'blob' }),
  },

  // Reports endpoints
  reports: {
    sales: (params?: { period?: string; startDate?: string; endDate?: string; branch?: string }) =>
      axios.get('/reports/sales', { params }),
    
    stock: (params?: { branch?: string; category?: string }) =>
      axios.get('/reports/stock', { params }),
    
    profitLoss: (params?: { startDate?: string; endDate?: string; branch?: string }) =>
      axios.get('/reports/profit-loss', { params }),
  },

  // Branches endpoints
  branches: {
    getAll: () =>
      axios.get('/branches'),
    
    getById: (id: string) =>
      axios.get(`/branches/${id}`),
    
    create: (branchData: any) =>
      axios.post('/branches', branchData),
    
    update: (id: string, branchData: any) =>
      axios.put(`/branches/${id}`, branchData),
    
    delete: (id: string) =>
      axios.delete(`/branches/${id}`),
  },

  // Users endpoints
  users: {
    getAll: (params?: { page?: number; limit?: number; role?: string }) =>
      axios.get('/users', { params }),
    
    getById: (id: string) =>
      axios.get(`/users/${id}`),
    
    create: (userData: any) =>
      axios.post('/users', userData),
    
    update: (id: string, userData: any) =>
      axios.put(`/users/${id}`, userData),
    
    delete: (id: string) =>
      axios.delete(`/users/${id}`),
  },

  // Payments endpoints
  payments: {
    getAll: (params?: { page?: number; limit?: number; type?: string; method?: string }) =>
      axios.get('/payments', { params }),
    
    getById: (id: string) =>
      axios.get(`/payments/${id}`),
    
    create: (paymentData: any) =>
      axios.post('/payments', paymentData),
    
    update: (id: string, paymentData: any) =>
      axios.put(`/payments/${id}`, paymentData),
    
    delete: (id: string) =>
      axios.delete(`/payments/${id}`),
  },
};

export default apiService;
