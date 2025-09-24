import { useAuthStore, useDashboardStore, useProductsStore, useBranchesStore, useInvoicesStore, useTransfersStore, usePaymentsStore, useUsersStore, useReportsStore, useUIStore } from '../store';

// Auth hooks
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, login, logout, setLoading, initializeAuth } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setLoading,
    initializeAuth,
  };
};

// Dashboard hooks
export const useDashboard = () => {
  const { 
    data, 
    isLoading, 
    error, 
    setData, 
    setLoading, 
    setError, 
    clearCache, 
    isCacheValid 
  } = useDashboardStore();
  
  return {
    dashboardData: data,
    isLoading,
    error,
    setData,
    setLoading,
    setError,
    clearCache,
    isCacheValid: isCacheValid(),
  };
};

// Products hooks
export const useProducts = () => {
  const { 
    products, 
    isLoading, 
    error, 
    filters,
    setProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    setLoading, 
    setError, 
    setFilters, 
    clearFilters,
    fetchProducts
  } = useProductsStore();
  
  // Computed filtered products
  const filteredProducts = products.filter(product => {
    const matchesSearch = !filters.search || 
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(filters.search.toLowerCase())) ||
      product.sku.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || product.category === filters.category;
    
    // Handle branch filtering - product.branch can be a string ID or an object with _id
    const matchesBranch = !filters.branch || 
      filters.branch === 'all' || 
      (typeof product.branch === 'string' ? product.branch === filters.branch : product.branch._id === filters.branch);
    
    return matchesSearch && matchesCategory && matchesBranch;
  });
  
  return {
    products: filteredProducts,
    allProducts: products,
    isLoading,
    error,
    filters,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    setLoading,
    setError,
    setFilters,
    clearFilters,
    fetchProducts,
  };
};

// UI hooks
export const useUI = () => {
  const { 
    sidebarOpen, 
    theme, 
    notifications,
    toggleSidebar, 
    setSidebarOpen, 
    setTheme, 
    addNotification, 
    removeNotification, 
    clearNotifications 
  } = useUIStore();
  
  return {
    sidebarOpen,
    theme,
    notifications,
    toggleSidebar,
    setSidebarOpen,
    setTheme,
    addNotification,
    removeNotification,
    clearNotifications,
  };
};

// Branches hooks
export const useBranches = () => {
  const { 
    branches, 
    isLoading, 
    error, 
    setBranches, 
    addBranch,
    updateBranch,
    deleteBranch,
    setLoading, 
    setError, 
    fetchBranches,
    createBranch,
    removeBranch
  } = useBranchesStore();
  
  return {
    branches,
    isLoading,
    error,
    setBranches,
    addBranch,
    updateBranch,
    deleteBranch,
    setLoading,
    setError,
    fetchBranches,
    createBranch,
    removeBranch,
  };
};

export const useInvoices = () => {
  const { 
    invoices, 
    isLoading, 
    error, 
    setInvoices, 
    addInvoice,
    updateInvoice,
    deleteInvoice,
    setLoading, 
    setError, 
    fetchInvoices,
    createInvoice,
    removeInvoice
  } = useInvoicesStore();
  
  return {
    invoices,
    isLoading,
    error,
    setInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    setLoading,
    setError,
    fetchInvoices,
    createInvoice,
    removeInvoice,
  };
};

export const useTransfers = () => {
  const { 
    transfers, 
    isLoading, 
    error, 
    setTransfers, 
    addTransfer,
    updateTransfer,
    deleteTransfer,
    setLoading, 
    setError, 
    fetchTransfers,
    createTransfer,
    removeTransfer
  } = useTransfersStore();
  
  return {
    transfers,
    isLoading,
    error,
    setTransfers,
    addTransfer,
    updateTransfer,
    deleteTransfer,
    setLoading,
    setError,
    fetchTransfers,
    createTransfer,
    removeTransfer,
  };
};

export const usePayments = () => {
  const { 
    payments, 
    isLoading, 
    error, 
    setPayments, 
    addPayment,
    updatePayment,
    deletePayment,
    setLoading, 
    setError, 
    fetchPayments,
    createPayment,
    removePayment
  } = usePaymentsStore();
  
  return {
    payments,
    isLoading,
    error,
    setPayments,
    addPayment,
    updatePayment,
    deletePayment,
    setLoading,
    setError,
    fetchPayments,
    createPayment,
    removePayment,
  };
};

export const useUsers = () => {
  const { 
    users, 
    isLoading, 
    error, 
    setUsers, 
    addUser,
    updateUser,
    deleteUser,
    setLoading, 
    setError, 
    fetchUsers,
    createUser,
    removeUser
  } = useUsersStore();
  
  return {
    users,
    isLoading,
    error,
    setUsers,
    addUser,
    updateUser,
    deleteUser,
    setLoading,
    setError,
    fetchUsers,
    createUser,
    removeUser,
  };
};

export const useReports = () => {
  const { 
    reportData, 
    isLoading, 
    error, 
    selectedReport,
    dateRange,
    period,
    setReportData, 
    setLoading, 
    setError, 
    setSelectedReport,
    setDateRange,
    setPeriod,
    fetchReports
  } = useReportsStore();
  
  return {
    reportData,
    isLoading,
    error,
    selectedReport,
    dateRange,
    period,
    setReportData,
    setLoading,
    setError,
    setSelectedReport,
    setDateRange,
    setPeriod,
    fetchReports,
  };
};

// Specific selectors for better performance
export const useAuthUser = () => useAuthStore(state => state.user);
export const useAuthStatus = () => useAuthStore(state => ({ 
  isAuthenticated: state.isAuthenticated, 
  isLoading: state.isLoading 
}));

export const useDashboardStats = () => useDashboardStore(state => state.data?.stats);
export const useDashboardCharts = () => useDashboardStore(state => ({
  salesData: state.data?.salesData || [],
  productData: state.data?.productData || []
}));

export const useProductsCount = () => useProductsStore(state => state.products.length);
export const useProductsByCategory = (category: string) => 
  useProductsStore(state => state.products.filter(p => p.category === category));

export const useTheme = () => useUIStore(state => state.theme);
export const useSidebar = () => useUIStore(state => ({ 
  sidebarOpen: state.sidebarOpen, 
  toggleSidebar: state.toggleSidebar 
}));
