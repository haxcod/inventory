import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import type { User, Product, Branch as BranchType, Invoice, Transfer, Payment } from '../types';

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      
      login: (user: User, token: string) => {
        set((state) => {
          state.user = user;
          state.isAuthenticated = true;
          state.isLoading = false;
        });
        
        // Store token in cookie
        document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure=${import.meta.env.PROD}; samesite=strict`;
      },
      
      logout: () => {
        set((state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.isLoading = false;
        });
        
        // Clear token cookie
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      },
      
      setLoading: (loading: boolean) => {
        set((state) => {
          state.isLoading = loading;
        });
      },
      
      // Initialize auth check
      initializeAuth: async () => {
        const { setLoading, login, logout } = get();
        
        console.log('🔐 Initializing auth...');
        
        try {
          // Get token from cookie
          const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='))
            ?.split('=')[1];
          
          console.log('🍪 Token found:', !!token);
          
          if (token) {
            // Import apiService dynamically to avoid circular imports
            const { apiService } = await import('../lib/api');
            
            console.log('🌐 Verifying token with backend...');
            
            // Verify token with backend
            const response = await apiService.auth.me();
            
            console.log('📡 Backend response:', response.data);
            
            if (response.data.success && response.data.data.user) {
              console.log('✅ Auth successful, logging in user:', response.data.data.user.name);
              login(response.data.data.user, token);
            } else {
              console.log('❌ Auth failed, logging out');
              logout();
            }
          } else {
            console.log('🚫 No token found, stopping loading');
            // No token found, set loading to false
            setLoading(false);
          }
        } catch (error) {
          console.error('💥 Auth initialization error:', error);
          // On error, clear auth and stop loading
          logout();
        }
      },
    })),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Dashboard Store
interface DashboardStats {
  totalSales: number;
  totalProducts: number;
  totalInvoices: number;
  totalRevenue: number;
  salesGrowth: number;
  productGrowth: number;
  invoiceGrowth: number;
  revenueGrowth: number;
  lowStockItems: number;
  monthlySales: number;
  pendingTransfers: number;
}

interface ChartData {
  name: string;
  value?: number;
  sales?: number;
  revenue?: number;
  totalProducts?: number;
  month?: string;
  percent?: number;
}

interface DashboardData {
  stats: DashboardStats;
  salesData: ChartData[];
  productData: ChartData[];
}

interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  lastFetched: number;
  error: string | null;
  
  setData: (data: DashboardData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCache: () => void;
  isCacheValid: () => boolean;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useDashboardStore = create<DashboardState>()(
  immer((set, get) => ({
    data: null,
    isLoading: false,
    lastFetched: 0,
    error: null,
    
    setData: (data: DashboardData) => {
      set((state) => {
        state.data = data;
        state.lastFetched = Date.now();
        state.error = null;
      });
    },
    
    setLoading: (loading: boolean) => {
      set((state) => {
        state.isLoading = loading;
      });
    },
    
    setError: (error: string | null) => {
      set((state) => {
        state.error = error;
      });
    },
    
    clearCache: () => {
      set((state) => {
        state.data = null;
        state.lastFetched = 0;
        state.error = null;
      });
    },
    
    isCacheValid: () => {
      const { data, lastFetched } = get();
      return !!(data && lastFetched && (Date.now() - lastFetched) < CACHE_DURATION);
    },
  }))
);

// Products Store
interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    category: string;
    branch: string;
  };
  
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ProductsState['filters']>) => void;
  clearFilters: () => void;
  fetchProducts: (params?: { branch?: string }) => Promise<void>;
}

export const useProductsStore = create<ProductsState>()(
  immer((set) => ({
    products: [],
    isLoading: false,
    error: null,
    filters: {
      search: '',
      category: '',
      branch: 'all',
    },
    
    setProducts: (products: Product[]) => {
      set((state) => {
        state.products = products;
      });
    },
    
    addProduct: (product: Product) => {
      set((state) => {
        state.products.push(product);
      });
    },
    
    updateProduct: (id: string, productData: Partial<Product>) => {
      set((state) => {
        const index = state.products.findIndex(p => p._id === id);
        if (index !== -1) {
          state.products[index] = { ...state.products[index], ...productData };
        }
      });
    },
    
    deleteProduct: (id: string) => {
      set((state) => {
        state.products = state.products.filter(p => p._id !== id);
      });
    },
    
    setLoading: (loading: boolean) => {
      set((state) => {
        state.isLoading = loading;
      });
    },
    
    setError: (error: string | null) => {
      set((state) => {
        state.error = error;
      });
    },
    
    setFilters: (filters: Partial<ProductsState['filters']>) => {
      set((state) => {
        state.filters = { ...state.filters, ...filters };
      });
    },
    
    clearFilters: () => {
      set((state) => {
        state.filters = {
          search: '',
          category: '',
          branch: 'all',
        };
      });
    },
    
    fetchProducts: async (params?: { branch?: string }) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      
      try {
        const { apiService } = await import('../lib/api');
        const response = await apiService.products.getAll(params);
        
        if (response.data.success && response.data.data.products) {
          set((state) => {
            state.products = response.data.data.products;
            state.isLoading = false;
          });
        } else {
          set((state) => {
            state.error = response.data.message || 'Failed to fetch products';
            state.isLoading = false;
          });
        }
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : 'An error occurred while fetching products';
          state.isLoading = false;
        });
      }
    },
  }))
);

// Branches Store

interface BranchesState {
  branches: BranchType[];
  isLoading: boolean;
  error: string | null;
  
  setBranches: (branches: BranchType[]) => void;
  addBranch: (branch: BranchType) => void;
  updateBranch: (id: string, branch: Partial<BranchType>) => void;
  deleteBranch: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchBranches: () => Promise<void>;
  createBranch: (branchData: Partial<BranchType>) => Promise<BranchType>;
  removeBranch: (id: string) => Promise<void>;
}

export const useBranchesStore = create<BranchesState>()(
  devtools(
    immer((set) => ({
      branches: [],
      isLoading: false,
      error: null,
      
      setBranches: (branches) => {
        set((state) => {
          state.branches = branches;
          state.isLoading = false;
          state.error = null;
        });
      },
      
      setLoading: (loading) => {
        set((state) => {
          state.isLoading = loading;
        });
      },
      
      setError: (error) => {
        set((state) => {
          state.error = error;
        });
      },
      
      fetchBranches: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const { apiService } = await import('../lib/api');
          const response = await apiService.branches.getAll();
          
          if (response.data.success && response.data.data.branches) {
            set((state) => {
              state.branches = response.data.data.branches;
              state.isLoading = false;
            });
          } else {
            set((state) => {
              state.error = response.data.message || 'Failed to fetch branches';
              state.isLoading = false;
            });
          }
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'An error occurred while fetching branches';
            state.isLoading = false;
          });
        }
      },
      
      addBranch: (branch) => {
        set((state) => {
          state.branches.push(branch);
        });
      },
      
      updateBranch: (id, branch) => {
        set((state) => {
          const index = state.branches.findIndex(b => b._id === id);
          if (index !== -1) {
            state.branches[index] = { ...state.branches[index], ...branch };
          }
        });
      },
      
      deleteBranch: (id) => {
        set((state) => {
          state.branches = state.branches.filter(b => b._id !== id);
        });
      },
      
      createBranch: async (branchData: Partial<BranchType>) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const { apiService } = await import('../lib/api');
          const response = await apiService.branches.create(branchData);
          
          if (response.data.success) {
            const newBranch = response.data.data;
            set((state) => {
              state.branches.push(newBranch);
              state.isLoading = false;
            });
            return newBranch;
          } else {
            throw new Error(response.data.message || 'Failed to create branch');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating branch';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          throw error;
        }
      },
      
      removeBranch: async (id: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const { apiService } = await import('../lib/api');
          const response = await apiService.branches.delete(id);
          
          if (response.data.success) {
            set((state) => {
              state.branches = state.branches.filter(b => b._id !== id);
              state.isLoading = false;
            });
          } else {
            throw new Error(response.data.message || 'Failed to delete branch');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting branch';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          throw error;
        }
      },
    })),
    { name: 'BranchesStore' }
  )
);

// Invoices Store
interface InvoicesState {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  
  setInvoices: (invoices: Invoice[]) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchInvoices: () => Promise<void>;
  createInvoice: (invoiceData: Partial<Invoice>) => Promise<Invoice>;
  removeInvoice: (id: string) => Promise<void>;
}

export const useInvoicesStore = create<InvoicesState>()(
  devtools(
    immer((set) => ({
      invoices: [],
      isLoading: false,
      error: null,
      
      setInvoices: (invoices) => {
        set((state) => {
          state.invoices = invoices;
        });
      },
      
      addInvoice: (invoice) => {
        set((state) => {
          state.invoices.push(invoice);
        });
      },
      
      updateInvoice: (id, invoice) => {
        set((state) => {
          const index = state.invoices.findIndex(inv => inv._id === id);
          if (index !== -1) {
            state.invoices[index] = { ...state.invoices[index], ...invoice };
          }
        });
      },
      
      deleteInvoice: (id) => {
        set((state) => {
          state.invoices = state.invoices.filter(inv => inv._id !== id);
        });
      },
      
      setLoading: (isLoading) => {
        set((state) => {
          state.isLoading = isLoading;
        });
      },
      
      setError: (error) => {
        set((state) => {
          state.error = error;
        });
      },
      
      fetchInvoices: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const { apiService } = await import('../lib/api');
          const response = await apiService.invoices.getAll();
          
          if (response.data.success && response.data.data) {
            set((state) => {
              state.invoices = response.data.data.invoices || [];
              state.isLoading = false;
            });
          } else {
            set((state) => {
              state.error = response.data.message || 'Failed to fetch invoices';
              state.isLoading = false;
            });
          }
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'An error occurred while fetching invoices';
            state.isLoading = false;
          });
        }
      },
      
      createInvoice: async (invoiceData: Partial<Invoice>) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const { apiService } = await import('../lib/api');
          const response = await apiService.invoices.create(invoiceData);
          
          if (response.data.success) {
            const newInvoice = response.data.data;
            set((state) => {
              state.invoices.push(newInvoice);
              state.isLoading = false;
            });
            return newInvoice;
          } else {
            throw new Error(response.data.message || 'Failed to create invoice');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating invoice';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          throw error;
        }
      },
      
      removeInvoice: async (id: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const { apiService } = await import('../lib/api');
          const response = await apiService.invoices.delete(id);
          
          if (response.data.success) {
            set((state) => {
              state.invoices = state.invoices.filter(invoice => invoice._id !== id);
              state.isLoading = false;
            });
          } else {
            throw new Error(response.data.message || 'Failed to delete invoice');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting invoice';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          throw error;
        }
      },
    })),
    { name: 'InvoicesStore' }
  )
);

// Transfers Store
interface TransfersState {
  transfers: Transfer[];
  isLoading: boolean;
  error: string | null;
  
  setTransfers: (transfers: Transfer[]) => void;
  addTransfer: (transfer: Transfer) => void;
  updateTransfer: (id: string, transfer: Partial<Transfer>) => void;
  deleteTransfer: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchTransfers: () => Promise<void>;
  createTransfer: (transferData: {
    productId: string;
    fromBranch: string;
    toBranch: string;
    quantity: number;
    reason: string;
    notes?: string;
  }) => Promise<Transfer>;
  removeTransfer: (id: string) => Promise<void>;
}

export const useTransfersStore = create<TransfersState>()(
  devtools(
    immer((set) => ({
      transfers: [],
      isLoading: false,
      error: null,
      
      setTransfers: (transfers) => {
        set((state) => {
          state.transfers = transfers;
        });
      },
      
      addTransfer: (transfer) => {
        set((state) => {
          state.transfers.push(transfer);
        });
      },
      
      updateTransfer: (id, transfer) => {
        set((state) => {
          const index = state.transfers.findIndex(t => t._id === id);
          if (index !== -1) {
            state.transfers[index] = { ...state.transfers[index], ...transfer };
          }
        });
      },
      
      deleteTransfer: (id) => {
        set((state) => {
          state.transfers = state.transfers.filter(t => t._id !== id);
        });
      },
      
      setLoading: (isLoading) => {
        set((state) => {
          state.isLoading = isLoading;
        });
      },
      
      setError: (error) => {
        set((state) => {
          state.error = error;
        });
      },
      
      fetchTransfers: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const { apiService } = await import('../lib/api');
          const response = await apiService.transfers.getAll();
          
          if (response.data.success && response.data.data) {
            set((state) => {
              state.transfers = response.data.data.transfers || [];
              state.isLoading = false;
            });
          } else {
            set((state) => {
              state.error = response.data.message || 'Failed to fetch transfers';
              state.isLoading = false;
            });
          }
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'An error occurred while fetching transfers';
            state.isLoading = false;
          });
        }
      },
      
      createTransfer: async (transferData: {
        productId: string;
        fromBranch: string;
        toBranch: string;
        quantity: number;
        reason: string;
        notes?: string;
      }) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const { apiService } = await import('../lib/api');
          const response = await apiService.transfers.create(transferData);
          
          if (response.data.success) {
            const newTransfer = response.data.data;
            set((state) => {
              state.transfers.push(newTransfer);
              state.isLoading = false;
            });
            return newTransfer;
          } else {
            throw new Error(response.data.message || 'Failed to create transfer');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating transfer';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          throw error;
        }
      },
      
      removeTransfer: async (id: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const { apiService } = await import('../lib/api');
          const response = await apiService.transfers.delete(id);
          
          if (response.data.success) {
            set((state) => {
              state.transfers = state.transfers.filter(transfer => transfer._id !== id);
              state.isLoading = false;
            });
          } else {
            throw new Error(response.data.message || 'Failed to delete transfer');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting transfer';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          throw error;
        }
      },
    })),
    { name: 'TransfersStore' }
  )
);

// Payments Store
interface PaymentsState {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchPayments: () => Promise<void>;
  createPayment: (paymentData: Partial<Payment>) => Promise<Payment>;
  removePayment: (id: string) => Promise<void>;
}

export const usePaymentsStore = create<PaymentsState>()(
  devtools(
    immer((set) => ({
      payments: [],
      isLoading: false,
      error: null,
      
      setPayments: (payments) => {
        set((state) => {
          state.payments = payments;
        });
      },
      
      addPayment: (payment) => {
        set((state) => {
          state.payments.push(payment);
        });
      },
      
      updatePayment: (id, payment) => {
        set((state) => {
          const index = state.payments.findIndex(p => p._id === id);
          if (index !== -1) {
            state.payments[index] = { ...state.payments[index], ...payment };
          }
        });
      },
      
      deletePayment: (id) => {
        set((state) => {
          state.payments = state.payments.filter(p => p._id !== id);
        });
      },
      
      setLoading: (isLoading) => {
        set((state) => {
          state.isLoading = isLoading;
        });
      },
      
      setError: (error) => {
        set((state) => {
          state.error = error;
        });
      },
      
      fetchPayments: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const { apiService } = await import('../lib/api');
          const response = await apiService.payments.getAll();
          
          if (response.data.success && response.data.data) {
            set((state) => {
              state.payments = response.data.data.payments || [];
              state.isLoading = false;
            });
          } else {
            set((state) => {
              state.error = response.data.message || 'Failed to fetch payments';
              state.isLoading = false;
            });
          }
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'An error occurred while fetching payments';
            state.isLoading = false;
          });
        }
      },
      
      createPayment: async (paymentData: Partial<Payment>) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const { apiService } = await import('../lib/api');
          const response = await apiService.payments.create(paymentData);
          
          if (response.data.success) {
            const newPayment = response.data.data;
            set((state) => {
              state.payments.push(newPayment);
              state.isLoading = false;
            });
            return newPayment;
          } else {
            throw new Error(response.data.message || 'Failed to create payment');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating payment';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          throw error;
        }
      },
      
      removePayment: async (id: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const { apiService } = await import('../lib/api');
          const response = await apiService.payments.delete(id);
          
          if (response.data.success) {
            set((state) => {
              state.payments = state.payments.filter(payment => payment._id !== id);
              state.isLoading = false;
            });
          } else {
            throw new Error(response.data.message || 'Failed to delete payment');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting payment';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          throw error;
        }
      },
    })),
    { name: 'PaymentsStore' }
  )
);

// Users Store
interface UsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

interface UsersActions {
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchUsers: () => Promise<void>;
  createUser: (userData: Partial<User>) => Promise<User>;
  removeUser: (id: string) => Promise<void>;
}

export const useUsersStore = create<UsersState & UsersActions>()(
  devtools(
    immer((set) => ({
      users: [],
      isLoading: false,
      error: null,
      
      setUsers: (users) => {
        set((state) => {
          state.users = users;
        });
      },
      
      addUser: (user) => {
        set((state) => {
          state.users.push(user);
        });
      },
      
      updateUser: (id, user) => {
        set((state) => {
          const index = state.users.findIndex(u => u._id === id);
          if (index !== -1) {
            state.users[index] = { ...state.users[index], ...user };
          }
        });
      },
      
      deleteUser: (id) => {
        set((state) => {
          state.users = state.users.filter(u => u._id !== id);
        });
      },
      
      setLoading: (isLoading) => {
        set((state) => {
          state.isLoading = isLoading;
        });
      },
      
      setError: (error) => {
        set((state) => {
          state.error = error;
        });
      },
      
      fetchUsers: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const { apiService } = await import('../lib/api');
          const response = await apiService.users.getAll();
          
          if (response.data.success && response.data.data) {
            set((state) => {
              state.users = response.data.data.users || [];
              state.isLoading = false;
            });
          } else {
            set((state) => {
              state.error = response.data.message || 'Failed to fetch users';
              state.isLoading = false;
            });
          }
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'An error occurred while fetching users';
            state.isLoading = false;
          });
        }
      },
      
      createUser: async (userData: Partial<User>) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const { apiService } = await import('../lib/api');
          const response = await apiService.users.create(userData);
          
          if (response.data.success) {
            const newUser = response.data.data;
            set((state) => {
              state.users.push(newUser);
              state.isLoading = false;
            });
            return newUser;
          } else {
            throw new Error(response.data.message || 'Failed to create user');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating user';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          throw error;
        }
      },
      
      removeUser: async (id: string) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });
        
        try {
          const { apiService } = await import('../lib/api');
          const response = await apiService.users.delete(id);
          
          if (response.data.success) {
            set((state) => {
              state.users = state.users.filter(u => u._id !== id);
              state.isLoading = false;
            });
          } else {
            throw new Error(response.data.message || 'Failed to delete user');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting user';
          set((state) => {
            state.error = errorMessage;
            state.isLoading = false;
          });
          throw error;
        }
      },
    })),
    { name: 'UsersStore' }
  )
);

// Reports Store
interface ChartDataItem {
  date: string;
  revenue: number;
  count: number;
}

interface ProfitLossDataItem {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface CategoryStatsItem {
  category: string;
  count: number;
  totalStock: number;
  totalValue: number;
}

interface PaymentMethodStatsItem {
  method: string;
  count: number;
  revenue: number;
}

interface LowStockProduct {
  name: string;
  category: string;
  stock: number;
  minStock: number;
  costPrice: number;
}

interface ReportSummary {
  totalRevenue?: number;
  totalInvoices?: number;
  totalProducts?: number;
  netProfit?: number;
  averageOrderValue?: number;
  profitMargin?: number;
  lowStockProducts?: number;
  outOfStockProducts?: number;
  totalStockValue?: number;
  totalExpenses?: number;
}

interface ReportData {
  chartData?: ChartDataItem[] | ProfitLossDataItem[];
  summary?: ReportSummary;
  paymentMethodStats?: PaymentMethodStatsItem[];
  categoryStats?: CategoryStatsItem[];
  lowStockProducts?: LowStockProduct[];
}

interface ReportsState {
  reportData: ReportData | null;
  isLoading: boolean;
  error: string | null;
  selectedReport: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  period: string;
}

interface ReportsActions {
  setReportData: (data: ReportData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedReport: (report: string) => void;
  setDateRange: (dateRange: { startDate: string; endDate: string }) => void;
  setPeriod: (period: string) => void;
  fetchReports: (params?: Record<string, string>) => Promise<void>;
}

export const useReportsStore = create<ReportsState & ReportsActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        // State
        reportData: null,
        isLoading: false,
        error: null,
        selectedReport: "sales",
        dateRange: {
          startDate: "",
          endDate: "",
        },
        period: "monthly",

        // Actions
        setReportData: (data) => {
          set((state) => {
            state.reportData = data;
          });
        },

        setLoading: (loading) => {
          set((state) => {
            state.isLoading = loading;
          });
        },

        setError: (error) => {
          set((state) => {
            state.error = error;
          });
        },

        setSelectedReport: (report) => {
          set((state) => {
            state.selectedReport = report;
          });
        },

        setDateRange: (dateRange) => {
          set((state) => {
            state.dateRange = dateRange;
          });
        },

        setPeriod: (period) => {
          set((state) => {
            state.period = period;
          });
        },

        fetchReports: async (params = {}) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const { apiService } = await import('../lib/api');
            const { selectedReport } = get();
            
            // Get the appropriate API function based on selected report type
            let apiFunction;
            switch (selectedReport) {
              case "sales":
                apiFunction = apiService.reports.sales;
                break;
              case "revenue":
                apiFunction = apiService.reports.sales; // Revenue uses same endpoint as sales
                break;
              case "profitLoss":
                apiFunction = apiService.reports.profitLoss;
                break;
              case "stock":
                apiFunction = apiService.reports.stock;
                break;
              default:
                apiFunction = apiService.reports.sales;
            }

            const response = await apiFunction(params);
            
            if (response.data.success && response.data.data) {
              set((state) => {
                state.reportData = response.data.data;
                state.isLoading = false;
              });
            } else {
              set((state) => {
                state.error = response.data.message || 'Failed to fetch reports';
                state.isLoading = false;
              });
            }
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'An error occurred while fetching reports';
              state.isLoading = false;
            });
          }
        },
      })),
      {
        name: "reports-store",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          selectedReport: state.selectedReport,
          dateRange: state.dateRange,
          period: state.period,
        }),
      }
    ),
    { name: "ReportsStore" }
  )
);

// UI Store for global UI state
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    immer((set) => ({
      sidebarOpen: false,
      theme: 'light',
      notifications: [],
      
      toggleSidebar: () => {
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        });
      },
      
      setSidebarOpen: (open: boolean) => {
        set((state) => {
          state.sidebarOpen = open;
        });
      },
      
      setTheme: (theme: 'light' | 'dark') => {
        set((state) => {
          state.theme = theme;
        });
        
        // Apply theme to document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      
      addNotification: (notification) => {
        set((state) => {
          state.notifications.push({
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
          });
        });
      },
      
      removeNotification: (id: string) => {
        set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        });
      },
      
      clearNotifications: () => {
        set((state) => {
          state.notifications = [];
        });
      },
    })),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        theme: state.theme,
        sidebarOpen: state.sidebarOpen 
      }),
    }
  )
);
