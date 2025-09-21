import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { ArrowLeftIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useApi, useApiUpdate } from '../hooks/useApi';
import { useConfirmations } from '../hooks/useConfirmations';
import { apiService } from '../lib/api';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useConfirmations();

  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    price: '',
    costPrice: '',
    stock: '',
    minStock: '',
    maxStock: '',
    unit: 'pieces',
    category: '',
    brand: '',
    description: '',
    branch: ''
  });

  // Fetch product data
  const {
    loading: isLoading,
    error: productError,
    execute: fetchProduct
  } = useApi(apiService.products.getById, {
    onSuccess: (data: any) => {
      if (data?.product) {
        const p = data.product;
        setProductForm({
          name: p.name || '',
          sku: p.sku || '',
          price: p.price?.toString() || '',
          costPrice: p.costPrice?.toString() || '',
          stock: p.stock?.toString() || '',
          minStock: p.minStock?.toString() || '',
          maxStock: p.maxStock?.toString() || '',
          unit: p.unit || 'pieces',
          category: p.category || '',
          brand: p.brand || '',
          description: p.description || '',
          branch: p.branch || ''
        });
      }
    },
    onError: (error: string) => {
      console.error('Failed to load product:', error);
    }
  });

  const {
    execute: updateProduct,
    loading: isUpdating
  } = useApiUpdate(apiService.products.update, {
    onSuccess: () => {
      showSuccess('Product updated successfully!');
      navigate('/products');
    },
    itemName: 'Product'
  });

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id, fetchProduct]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    // Validate required fields
    const missingFields = [];
    if (!productForm.name.trim()) missingFields.push('Product Name');
    if (!productForm.sku.trim()) missingFields.push('SKU');
    if (!productForm.price.trim()) missingFields.push('Price');
    if (!productForm.stock.trim()) missingFields.push('Stock');
    
    if (missingFields.length > 0) {
      showError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const productData = {
        name: productForm.name,
        sku: productForm.sku,
        price: parseFloat(productForm.price),
        costPrice: parseFloat(productForm.costPrice || '0'),
        stock: parseInt(productForm.stock),
        minStock: parseInt(productForm.minStock || '0'),
        maxStock: parseInt(productForm.maxStock || '1000'),
        unit: productForm.unit,
        category: productForm.category,
        brand: productForm.brand,
        description: productForm.description,
        branch: productForm.branch
      };

      await updateProduct(id, productData);
    } catch (error) {
      console.error('Error updating product:', error);
      showError('Error updating product. Please try again.');
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

  if (productError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <CardContent>
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Product</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{productError}</p>
              <Button onClick={() => navigate('/products')} className="bg-blue-600 hover:bg-blue-700">
                Back to Products
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
                  Edit Product
                </h1>
              </div>
              <p className="text-blue-100 dark:text-gray-300 text-sm sm:text-base">
                Update product information
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-blue-600" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  size="lg"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={productForm.sku}
                  onChange={handleInputChange}
                  placeholder="Enter SKU"
                  size="lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={productForm.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    size="lg"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="costPrice">Cost Price</Label>
                  <Input
                    id="costPrice"
                    name="costPrice"
                    type="number"
                    value={productForm.costPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    size="lg"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    value={productForm.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    size="lg"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="minStock">Min Stock</Label>
                  <Input
                    id="minStock"
                    name="minStock"
                    type="number"
                    value={productForm.minStock}
                    onChange={handleInputChange}
                    placeholder="0"
                    size="lg"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxStock">Max Stock</Label>
                  <Input
                    id="maxStock"
                    name="maxStock"
                    type="number"
                    value={productForm.maxStock}
                    onChange={handleInputChange}
                    placeholder="1000"
                    size="lg"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={productForm.category}
                    onChange={(value) => handleSelectChange('category', value)}
                    options={[
                      { label: 'Electronics', value: 'electronics' },
                      { label: 'Clothing', value: 'clothing' },
                      { label: 'Books', value: 'books' },
                      { label: 'Home & Garden', value: 'home_garden' },
                      { label: 'Sports', value: 'sports' },
                      { label: 'Other', value: 'other' }
                    ]}
                    placeholder="Select category"
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={productForm.unit}
                    onChange={(value) => handleSelectChange('unit', value)}
                    options={[
                      { label: 'Pieces', value: 'pieces' },
                      { label: 'Kg', value: 'kg' },
                      { label: 'Liters', value: 'liters' },
                      { label: 'Meters', value: 'meters' },
                      { label: 'Boxes', value: 'boxes' }
                    ]}
                    placeholder="Select unit"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={productForm.brand}
                  onChange={handleInputChange}
                  placeholder="Enter brand name"
                  size="lg"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Updating Product...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Update Product
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/products')}
                  className="px-6 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
