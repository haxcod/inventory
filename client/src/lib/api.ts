import axios, { type AxiosResponse, type AxiosError } from 'axios';
import { handleApiError } from './errorHandler';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.timeout = 30000; // Increased timeout for better UX
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Request interceptor to add auth token and logging
axios.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth-token='))
      ?.split('=')[1];
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
        headers: config.headers
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const duration = new Date().getTime() - (response.config.metadata?.startTime?.getTime() || 0);
    
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data
      });
    }

    return response;
  },
  (error: AxiosError) => {
    // Calculate request duration
    const duration = new Date().getTime() - (error.config?.metadata?.startTime?.getTime() || 0);
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        duration: `${duration}ms`,
        error: error.response?.data || error.message
      });
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      const errorMessage = (error.response?.data as { message?: string })?.message || '';
      
      // Only clear auth if it's actually an auth error
      if (errorMessage.includes('token') || 
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('expired') ||
          errorMessage.includes('Authentication required')) {
        
        // Clear authentication data
        localStorage.removeItem('user');
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Redirect to login after a short delay to allow error handling
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Enhanced API Service with better error handling
export const apiService = {
  // Auth endpoints
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const response = await axios.post('/auth/login', credentials);
      return response;
    },
    
    register: async (userData: { name: string; email: string; password: string; role?: string }) => {
      const response = await axios.post('/auth/register', userData);
      return response;
    },
    
    logout: async () => {
      try {
        const response = await axios.post('/auth/logout');
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    me: async () => {
      try {
        const response = await axios.get('/auth/me');
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    updateProfile: async (userData: Partial<{ name: string; email: string }>) => {
      try {
        const response = await axios.put('/auth/profile', userData);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
  },

  // Products endpoints
  products: {
    getAll: async (params?: { page?: number; limit?: number; search?: string; category?: string }) => {
      try {
        const response = await axios.get('/products', { params });
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    getById: async (id: string) => {
      try {
        const response = await axios.get(`/products/${id}`);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    create: async (productData: Record<string, unknown>) => {
      try {
        const response = await axios.post('/products', productData);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    update: async (id: string, productData: Record<string, unknown>) => {
      try {
        const response = await axios.put(`/products/${id}`, productData);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    delete: async (id: string) => {
      try {
        const response = await axios.delete(`/products/${id}`);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
  },

  // Invoices endpoints
  invoices: {
    getAll: async (params?: { page?: number; limit?: number; status?: string; dateFrom?: string; dateTo?: string }) => {
      try {
        const response = await axios.get('/billing/invoices', { params });
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    getById: async (id: string) => {
      try {
        const response = await axios.get(`/billing/invoices/${id}`);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    create: async (invoiceData: Record<string, unknown>) => {
      try {
        const response = await axios.post('/billing/invoices', invoiceData);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    update: async (id: string, invoiceData: Record<string, unknown>) => {
      try {
        const response = await axios.put(`/billing/invoices/${id}`, invoiceData);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    delete: async (id: string) => {
      try {
        const response = await axios.delete(`/billing/invoices/${id}`);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    generatePDF: async (id: string) => {
      try {
        const response = await axios.get(`/billing/invoices/${id}/pdf`, { responseType: 'blob' });
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
  },


  // Branches endpoints
  branches: {
    getAll: async () => {
      try {
        const response = await axios.get('/branches');
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    getById: async (id: string) => {
      try {
        const response = await axios.get(`/branches/${id}`);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    create: async (branchData: Record<string, unknown>) => {
      try {
        const response = await axios.post('/branches', branchData);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    update: async (id: string, branchData: Record<string, unknown>) => {
      try {
        const response = await axios.put(`/branches/${id}`, branchData);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    delete: async (id: string) => {
      try {
        const response = await axios.delete(`/branches/${id}`);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
  },

  // Users endpoints
  users: {
    getAll: async (params?: { page?: number; limit?: number; role?: string }) => {
      try {
        const response = await axios.get('/users', { params });
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    getById: async (id: string) => {
      try {
        const response = await axios.get(`/users/${id}`);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    create: async (userData: Record<string, unknown>) => {
      try {
        const response = await axios.post('/users', userData);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    update: async (id: string, userData: Record<string, unknown>) => {
      try {
        const response = await axios.put(`/users/${id}`, userData);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    delete: async (id: string) => {
      try {
        const response = await axios.delete(`/users/${id}`);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
  },

  // Payments endpoints
  payments: {
    getAll: async (params?: { page?: number; limit?: number; type?: string; method?: string }) => {
      try {
        const response = await axios.get('/payments', { params });
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    getById: async (id: string) => {
      try {
        const response = await axios.get(`/payments/${id}`);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    create: async (paymentData: Record<string, unknown>) => {
      try {
        const response = await axios.post('/payments', paymentData);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    update: async (id: string, paymentData: Record<string, unknown>) => {
      try {
        const response = await axios.put(`/payments/${id}`, paymentData);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    delete: async (id: string) => {
      try {
        const response = await axios.delete(`/payments/${id}`);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
  },

  // Product Transfer endpoints
  transfers: {
    create: async (transferData: {
      productId: string;
      fromBranch: string;
      toBranch: string;
      quantity: number;
      reason: string;
      notes?: string;
    }) => {
      try {
        const response = await axios.post('/transfers', transferData);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    getAll: async (params?: { page?: number; limit?: number; productId?: string; branch?: string }) => {
      try {
        const response = await axios.get('/transfers', { params });
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    getById: async (id: string) => {
      try {
        const response = await axios.get(`/transfers/${id}`);
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
  },

  // Dashboard endpoints
  dashboard: {
    getData: async (params?: { period?: string }) => {
      const response = await axios.get('/dashboard', { params });
      return response;
    },
  },

  // Report endpoints
  reports: {
    sales: async (params?: { dateFrom?: string; dateTo?: string; branch?: string }) => {
      try {
        const response = await axios.get('/reports/sales', { params });
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    stock: async (params?: { branch?: string; category?: string }) => {
      try {
        const response = await axios.get('/reports/stock', { params });
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    payments: async (params?: { dateFrom?: string; dateTo?: string; branch?: string }) => {
      try {
        const response = await axios.get('/reports/payments', { params });
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
    
    profitLoss: async (params?: { startDate?: string; endDate?: string; branch?: string }) => {
      try {
        const response = await axios.get('/reports/profit-loss', { params });
        return response;
      } catch (error) {
        throw handleApiError(error, false);
      }
    },
  },
};

export default apiService;

