import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowLeftIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { useApi, useApiDelete } from '../hooks/useApi';
import { useConfirmations } from '../hooks/useConfirmations';
import { apiService } from '../lib/api';
import { formatCurrency, formatNumber, formatDate } from '../lib/utils';

export default function ViewProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, confirmDelete } = useConfirmations();

  // Fetch product data
  const {
    data: product,
    loading: isLoading,
    error: productError,
    execute: fetchProduct
  } = useApi(apiService.products.getById, {
    onSuccess: (data: any) => {
      console.log('Product loaded successfully:', data);
    },
    onError: (error: string) => {
      console.error('Failed to load product:', error);
    }
  });

  const {
    execute: deleteProduct,
    loading: isDeleting
  } = useApiDelete(apiService.products.delete, {
    onSuccess: () => {
      showSuccess('Product deleted successfully!');
      navigate('/products');
    },
    itemName: 'Product'
  });

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id, fetchProduct]);

  const handleEdit = () => {
    if (id) {
      navigate(`/products/edit/${id}`);
    }
  };

  const handleDelete = () => {
    if (product?.product && id) {
      confirmDelete(product.product.name, async () => {
        await deleteProduct(id);
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16" style={{borderBottom: '2px solid hsl(var(--primary))'}}></div>
        </div>
      </DashboardLayout>
    );
  }

  if (productError || !product?.product) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <CardContent>
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {productError || 'The product you are looking for does not exist.'}
              </p>
              <Button onClick={() => navigate('/products')} className="bg-blue-600 hover:bg-blue-700">
                Back to Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const p = product.product;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-900 dark:to-black rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white"
                  onClick={() => navigate('/products')}
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Products
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {p.name}
                </h1>
              </div>
              <p className="text-blue-100 dark:text-gray-300 text-sm sm:text-base">
                Product Details & Information
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleEdit}
                className="bg-white/10 hover:bg-white/20 border-white/30 text-white"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500/20 hover:bg-red-500/30 border-red-400/30 text-red-100 hover:text-white"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Product Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCodeIcon className="h-5 w-5 text-blue-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                    <p className="text-lg font-semibold text-foreground">{p.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">SKU</label>
                    <p className="text-lg font-semibold text-blue-600">{p.sku}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="text-lg font-semibold text-foreground capitalize">{p.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Brand</label>
                    <p className="text-lg font-semibold text-foreground">{p.brand || 'N/A'}</p>
                  </div>
                </div>
                {p.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-foreground mt-1">{p.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing Information */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Pricing Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Selling Price</label>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(p.price)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Cost Price</label>
                    <p className="text-xl font-semibold text-foreground">{formatCurrency(p.costPrice || 0)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Profit Margin</label>
                    <p className="text-lg font-semibold text-blue-600">
                      {p.costPrice ? formatCurrency(p.price - p.costPrice) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Unit</label>
                    <p className="text-lg font-semibold text-foreground capitalize">{p.unit}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Information */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Stock Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Stock</label>
                    <p className={`text-2xl font-bold ${p.stock <= p.minStock ? 'text-red-600' : 'text-green-600'}`}>
                      {formatNumber(p.stock)} {p.unit}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Minimum Stock</label>
                    <p className="text-xl font-semibold text-orange-600">{formatNumber(p.minStock)} {p.unit}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Maximum Stock</label>
                    <p className="text-xl font-semibold text-blue-600">{formatNumber(p.maxStock)} {p.unit}</p>
                  </div>
                </div>
                {p.stock <= p.minStock && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      ⚠️ Low Stock Alert: Current stock is below minimum threshold
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Availability</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      p.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Stock Level</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      p.stock <= p.minStock 
                        ? 'bg-red-100 text-red-800' 
                        : p.stock <= p.minStock * 1.5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {p.stock <= p.minStock ? 'Low' : p.stock <= p.minStock * 1.5 ? 'Medium' : 'Good'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Active</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      p.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {p.isActive ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>Timestamps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-sm text-foreground">{formatDate(p.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="text-sm text-foreground">{formatDate(p.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Branch Information */}
            {p.branch && (
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle>Branch</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Branch</label>
                    <p className="text-sm font-semibold text-foreground">
                      {typeof p.branch === 'object' ? p.branch.name : p.branch}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
