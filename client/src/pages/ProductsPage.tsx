import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { ProductTransferModal } from '../components/ui/ProductTransferModal';
import type { Product } from '../types';

// Extended product type for display purposes
type DisplayProduct = Product & {
  costPrice?: number;
  brand?: string;
  isActive?: boolean;
  unit?: string;
};
import { formatCurrency, formatNumber } from '../lib/utils';
import { PlusIcon, MagnifyingGlassIcon, ArrowRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAuth, useProducts, useBranches } from '../hooks/useStores';
import { useConfirmations } from '../hooks/useConfirmations';
import { apiService } from '../lib/api';
import { processApiResponse } from '../lib/responseHandler';
import { handleApiError } from '../lib/errorHandler';
import { isAdmin, isTeam } from '../lib/roles';
import { hasPermission, PERMISSIONS } from '../lib/permissions';

export default function ProductsPage() {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    products, 
    isLoading, 
    error, 
    filters,
    deleteProduct,
    setLoading, 
    setError, 
    setFilters,
    fetchProducts
  } = useProducts();
  const { branches, fetchBranches } = useBranches();
  const { showSuccess } = useConfirmations();

  // Permission checks
  const canCreate = hasPermission(user, PERMISSIONS.PRODUCTS_CREATE);
  const canEdit = hasPermission(user, PERMISSIONS.PRODUCTS_EDIT);
  const canDelete = hasPermission(user, PERMISSIONS.PRODUCTS_DELETE);
  const canTransfer = hasPermission(user, PERMISSIONS.TRANSFERS_CREATE);
  const canViewDetails = hasPermission(user, PERMISSIONS.PRODUCTS_VIEW_DETAILS);


  // Delete product function
  const handleDeleteProduct = useCallback(async (productId: string) => {
    try {
      setLoading(true);
      
      const response = await apiService.products.delete(productId);
      
      if (response.data.success) {
        deleteProduct(productId);
        showSuccess('Product deleted successfully');
      } else {
        setError(response.data.message || 'Failed to delete product');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting product';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [deleteProduct, setLoading, setError, showSuccess]);

  // Load products on component mount
  useEffect(() => {
    // Only fetch if we don't have products yet
    if (products.length === 0) {
      if (isAdmin(user)) {
        fetchProducts();
      } else if (isTeam(user)) {
        fetchProducts();
      }
    }
  }, [products.length, fetchProducts, user]);

  // Load branches only for admin users
  useEffect(() => {
    if (isAdmin(user) && branches.length === 0) {
      fetchBranches();
    }
  }, [branches.length, fetchBranches, user]);

  const handleTransferProduct = (product: DisplayProduct) => {
    setSelectedProduct(product);
    setShowTransferModal(true);
  };

  const handleCloseTransferModal = () => {
    setShowTransferModal(false);
    setSelectedProduct(null);
  };

  const handleTransfer = async (transferData: {
    productId: string;
    fromBranch: string;
    toBranch: string;
    quantity: number;
    reason: string;
    notes?: string;
  }) => {
    try {
      const response = await apiService.transfers.create(transferData);
      const processedResponse = processApiResponse(response, 'Transfer completed successfully');
      
      if (processedResponse.success) {
        await fetchProducts(); // Refresh products to get updated stock
        showSuccess(`Successfully transferred ${transferData.quantity} ${selectedProduct?.unit || 'units'} of ${selectedProduct?.name} to the destination branch.`);
      } else {
        throw new Error(processedResponse.error?.message || 'Transfer failed');
      }
    } catch (error) {
      const apiError = handleApiError(error, true);
      console.error('Error transferring product:', apiError);
    }
  };


  const handleViewProduct = (product: DisplayProduct) => {
    navigate(`/products/view/${product._id}`);
  };

  const handleEditProduct = (product: DisplayProduct) => {
    navigate(`/products/edit/${product._id}`);
  };

  // Update search filter
  const handleSearchChange = (value: string) => {
    setFilters({ search: value });
  };

  // Update branch filter
  const handleBranchChange = useCallback((value: string) => {
    setFilters({ branch: value });
    // No need to fetch products - frontend filtering handles this
  }, [setFilters]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16" style={{borderBottom: '2px solid hsl(var(--primary))'}}></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <CardContent>
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Products</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={() => fetchProducts()} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Products
              </h1>
              <p className="mt-2 text-blue-100 dark:text-gray-300 text-sm sm:text-base">
                {isAdmin(user) 
                  ? 'Manage all inventory products across all branches' 
                  : `Manage inventory products for ${user?.branch ? (typeof user.branch === 'object' ? user.branch.name : user.branch) : 'your branch'}`
                }
              </p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isAdmin(user) 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {isAdmin(user) ? 'Admin Access' : 'Team Access'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {canCreate && (
                <Link to="/products/add">
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-blue-400 w-full sm:w-auto">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Product
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-semibold text-foreground">
                  Search Products
                </Label>
                <div className="relative mt-2">
                  <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, SKU, or category..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    size="lg"
                    className="pl-10 sm:pl-12"
                  />
                </div>
              </div>
                  {/* Branch filter only for admin users */}
                  {isAdmin(user) && (
                    <div className="w-48">
                      <Label htmlFor="branch" className="text-sm font-semibold text-foreground">
                        Filter by Branch
                      </Label>
                      <div className="mt-2 relative">
                        <select
                          id="branch"
                          value={filters.branch}
                          onChange={(e) => handleBranchChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">All Branches</option>
                          {branches.map((branch) => (
                            <option key={branch._id} value={branch._id}>
                              {branch.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product: DisplayProduct) => (
            <Card key={product._id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="pb-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      SKU: {product.sku}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Stock: {formatNumber(product.stock)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cost Price:</span>
                    <span className="font-medium">{formatCurrency(product.costPrice || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Brand:</span>
                    <span className="font-medium">{product.brand || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Branch:</span>
                    <span className="font-medium">
                      {typeof product.branch === 'object' ? product.branch.name : product.branch}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                  <div className="flex gap-2 mt-4">
                    {canViewDetails && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewProduct(product)}
                        className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                      >
                        View
                      </Button>
                    )}
                    {canEdit && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-400 transition-all duration-200"
                      >
                        Edit
                      </Button>
                    )}
                    {canTransfer && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleTransferProduct(product)}
                        className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200"
                        title="Transfer product"
                      >
                        <ArrowRightIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteProduct(product._id)}
                        disabled={isLoading}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                        title="Delete product"
                      >
                        {isLoading ? '...' : 'Delete'}
                      </Button>
                    )}
                  </div>
              </CardContent>
            </Card>
            ))}
        </div>

        {/* Empty State - only show when no products */}
        {products.length === 0 && (
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {filters.search ? 'No products found' : 'No products available'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {filters.search 
                  ? 'Try adjusting your search terms or filters.' 
                  : 'Get started by adding your first product to the inventory.'
                }
              </p>
              {!filters.search && (
                <Link to="/products/add">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Product Transfer Modal */}
        <ProductTransferModal
          isOpen={showTransferModal}
          onClose={handleCloseTransferModal}
          product={selectedProduct}
          onTransfer={handleTransfer}
        />
      </div>
    </DashboardLayout>
  );
}