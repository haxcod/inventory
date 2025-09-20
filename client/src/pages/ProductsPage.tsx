import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { ProductTransferModal } from '../components/ui/ProductTransferModal';
import type { Product } from '../types';
import { formatCurrency, formatNumber } from '../lib/utils';
import { PlusIcon, MagnifyingGlassIcon, ArrowRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConfirmations } from '../hooks/useConfirmations';
import { apiService } from '../lib/api';
import { useApiList, useApiDelete } from '../hooks/useApi';
import { processApiResponse } from '../lib/responseHandler';
import { handleApiError } from '../lib/errorHandler';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { user } = useAuth();
  const { showSuccess, confirmDelete } = useConfirmations();

  // Use API hooks for products
  const {
    data: productsResponse,
    loading: isLoading,
    error: productsError,
    execute: fetchProducts
  } = useApiList<any>(apiService.products.getAll, {
    onSuccess: (data: any) => {
      console.log('Products loaded successfully:', data);
    },
    onError: (error: string) => {
      console.error('Failed to load products:', error);
    }
  });

  // Extract products array from response
  const products = (productsResponse as any)?.products || [];

  const {
    execute: deleteProduct,
    loading: isDeleting
  } = useApiDelete(apiService.products.delete, {
    onSuccess: () => {
      fetchProducts(); // Refresh the list
    },
    itemName: 'Product'
  });

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Ensure products is always an array
  const safeProducts = Array.isArray(products) ? products : [];
  
  const filteredProducts = safeProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTransferProduct = (product: Product) => {
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
        showSuccess(`Successfully transferred ${transferData.quantity} ${selectedProduct?.unit} of ${selectedProduct?.name} to the destination branch.`);
      } else {
        throw new Error(processedResponse.error?.message || 'Transfer failed');
      }
    } catch (error) {
      const apiError = handleApiError(error, true);
      console.error('Error transferring product:', apiError);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    confirmDelete(product.name, async () => {
      await deleteProduct(product._id);
    });
  };

  // Check if user can transfer products (admin or team member)
  const canTransfer = user?.role === 'admin' || (user?.role === 'user' && user?.permissions?.includes('transfer_products'));

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16" style={{borderBottom: '2px solid hsl(var(--primary))'}}></div>
        </div>
      </DashboardLayout>
    );
  }

  if (productsError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <CardContent>
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Products</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{productsError}</p>
              <Button onClick={() => fetchProducts()} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading if no data yet
  if (isLoading || !products) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16" style={{borderBottom: '2px solid hsl(var(--primary))'}}></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-900 dark:to-black rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Products
              </h1>
              <p className="mt-2 text-blue-100 dark:text-gray-300 text-sm sm:text-base">
                Manage your inventory products
              </p>
            </div>
            <Link to="/products/add">
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-blue-400 w-full sm:w-auto">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Product
              </Button>
            </Link>
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="lg"
                    className="pl-10 sm:pl-12"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="pb-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </CardTitle>
                    <div className="mt-1">
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        {product.sku}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold self-start ${
                    product.stock <= product.minStock 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {product.stock <= product.minStock ? 'Low Stock' : 'In Stock'}
                  </div>
                </div>
                <CardDescription className="text-muted-foreground mt-2 text-sm">
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Price:</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrency(product.price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Stock:</span>
                    <span className={`font-semibold ${product.stock <= product.minStock ? 'text-red-600' : 'text-green-600'}`}>
                      {formatNumber(product.stock)} {product.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Category:</span>
                    <span className="px-2 py-1 text-xs font-semibold text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Brand:</span>
                    <span className="font-semibold text-foreground">{product.brand}</span>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-400 transition-all duration-200"
                  >
                    View
                  </Button>
                  {canTransfer && product.stock > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTransferProduct(product)}
                      className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all duration-200"
                      title="Transfer to another branch"
                    >
                      <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDeleteProduct(product)}
                    disabled={isDeleting}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                    title="Delete product"
                  >
                    {isDeleting ? '...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'No products found' : 'No products available'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters.' 
                  : 'Get started by adding your first product to the inventory.'
                }
              </p>
              {!searchTerm && (
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
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
