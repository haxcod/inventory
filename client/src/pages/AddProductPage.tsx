import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { SearchableDropdown } from '../components/ui/SearchableDropdown';
import { ArrowLeftIcon, CheckIcon, XMarkIcon, PlusIcon, CubeIcon, QrCodeIcon, PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import tractorData from '../data/tractor_dropdown.json';
import { useApiCreate, useApiList } from '../hooks/useApi';
import { useConfirmations } from '../hooks/useConfirmations';
import { apiService } from '../lib/api';

interface ProductData {
  model: string;
  variant: string;
  aggregators: string[];
}

interface SelectedProduct {
  category: 'rotovator' | 'tractor' | 'service' | null;
  model: string | null;
  variant: string | null;
  aggregators: string[];
  customModel?: string;
  customVariant?: string;
  customComponents?: string[];
}

const AddProductPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct>({
    category: null,
    model: null,
    variant: null,
    aggregators: [],
    customComponents: []
  });
  const [showModels, setShowModels] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [showComponents, setShowComponents] = useState(false);
  const [skipToForm, setSkipToForm] = useState(false);
  const [generatedQRCodes, setGeneratedQRCodes] = useState<string[]>([]);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [showQRPreview, setShowQRPreview] = useState(false);

  // Use API hooks and confirmations
  const { showSuccess, showError } = useConfirmations();
  
  const {
    execute: createProduct,
    loading: isCreatingProduct
  } = useApiCreate(apiService.products.create, {
    onSuccess: () => {
      showSuccess('Product created successfully!');
    },
    itemName: 'Product'
  });

  // Fetch branches for dropdown
  const {
    data: branches,
    loading: isLoadingBranches,
    error: branchesError,
    execute: fetchBranches
  } = useApiList<{_id: string, name: string, address: string}>(apiService.branches.getAll, {
    onSuccess: (data: {_id: string, name: string, address: string}[]) => {
      console.log('Branches loaded successfully:', data.length);
    },
    onError: (error: string) => {
      console.error('Failed to load branches:', error);
    }
  });
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    price: '',
    quantity: '',
    category: '',
    description: '',
    costPrice: '',
    minStock: '',
    maxStock: '',
    unit: 'pieces',
    brand: '',
    branch: 'main'
  });

  const productData: ProductData[] = tractorData;

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleCategorySelect = (category: 'rotovator' | 'tractor' | 'service') => {
    setSelectedProduct({
      category,
      model: null,
      variant: null,
      aggregators: []
    });
    setShowModels(true);
    setShowVariants(false);
    
    // Auto-populate category in form
    setProductForm(prev => ({
      ...prev,
      category: category
    }));
  };

  const handleModelSelect = (model: string) => {
    setSelectedProduct(prev => ({
      ...prev,
      model,
      variant: null,
      aggregators: []
    }));
    setShowVariants(true);
  };

  const handleVariantSelect = (variant: string) => {
    const selectedData = productData.find(p => p.model === selectedProduct.model && p.variant === variant);
    setSelectedProduct(prev => ({
      ...prev,
      variant,
      aggregators: selectedData?.aggregators || [],
      customVariant: variant
    }));
    setShowComponents(true);
  };

  const handleComponentSelect = (component: string) => {
    setSelectedProduct(prev => ({
      ...prev,
      customComponents: [...(prev.customComponents || []), component]
    }));
  };

  const handleComponentRemove = (component: string) => {
    setSelectedProduct(prev => ({
      ...prev,
      customComponents: prev.customComponents?.filter(c => c !== component) || []
    }));
  };

  const handleReset = () => {
    setSelectedProduct({
      category: null,
      model: null,
      variant: null,
      aggregators: [],
      customComponents: []
    });
    setShowModels(false);
    setShowVariants(false);
    setShowComponents(false);
    setSkipToForm(false);
  };

  const handleSkipToForm = () => {
    setSkipToForm(true);
    setShowModels(false);
    setShowVariants(false);
    setShowComponents(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateQRCode = async (data: string): Promise<string> => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const generateMultipleQRCodes = async (baseData: string, quantity: number): Promise<string[]> => {
    const qrCodes: string[] = [];
    for (let i = 1; i <= quantity; i++) {
      const qrData = `${baseData}-${i.toString().padStart(3, '0')}`;
      const qrCode = await generateQRCode(qrData);
      qrCodes.push(qrCode);
    }
    return qrCodes;
  };

  const printQRCodes = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrCodesHTML = generatedQRCodes.map((qrCode, index) => `
      <div style="
        display: inline-block;
        margin: 10px;
        padding: 10px;
        border: 1px solid #ccc;
        text-align: center;
        page-break-inside: avoid;
      ">
        <img src="${qrCode}" alt="QR Code ${index + 1}" style="width: 150px; height: 150px;" />
        <div style="margin-top: 5px; font-size: 12px; font-weight: bold;">
          ${productForm.name || 'Product'} - ${(index + 1).toString().padStart(3, '0')}
        </div>
        <div style="font-size: 10px; color: #666;">
          SKU: ${productForm.sku || 'N/A'}
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Codes - ${productForm.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              text-align: center;
            }
            .qr-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .qr-grid { grid-template-columns: repeat(3, 1fr); }
            }
          </style>
        </head>
        <body>
          <h1>QR Codes for ${productForm.name}</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Total Quantity: ${generatedQRCodes.length}</p>
          <div class="qr-grid">
            ${qrCodesHTML}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const downloadQRCodes = async () => {
    try {
      // Create a zip file with all QR codes
      const zip = new (await import('jszip')).default();
      
      generatedQRCodes.forEach((qrCode, index) => {
        const base64Data = qrCode.split(',')[1];
        zip.file(`qr-code-${(index + 1).toString().padStart(3, '0')}.png`, base64Data, { base64: true });
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-codes-${productForm.name || 'product'}-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR codes:', error);
      alert('Error downloading QR codes. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Debug: Log form values
    console.log('Form validation - Current form values:', {
      name: productForm.name,
      sku: productForm.sku,
      price: productForm.price,
      quantity: productForm.quantity,
      category: productForm.category
    });
    
    // Validate required fields with specific error messages
    const missingFields = [];
    if (!productForm.name || productForm.name.trim() === '') missingFields.push('Product Name');
    if (!productForm.sku || productForm.sku.trim() === '') missingFields.push('SKU');
    if (!productForm.price || productForm.price.trim() === '') missingFields.push('Price');
    if (!productForm.quantity || productForm.quantity.trim() === '') missingFields.push('Quantity');
    
    if (missingFields.length > 0) {
      console.log('Validation failed - missing required fields:', missingFields);
      showError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (parseInt(productForm.quantity) <= 0) {
      showError('Please enter a valid quantity');
      return;
    }

    try {
      setIsGeneratingQR(true);
      
      // Generate QR codes based on quantity
      const baseQRData = `${productForm.sku || productForm.name}-${Date.now()}`;
      const qrCodes = await generateMultipleQRCodes(baseQRData, parseInt(productForm.quantity));
      setGeneratedQRCodes(qrCodes);
      setShowQRPreview(true);
      
      // Create product data for API
      const productData = {
        name: productForm.name,
        sku: productForm.sku,
        price: parseFloat(productForm.price),
        costPrice: parseFloat(productForm.costPrice || '0'),
        stock: parseInt(productForm.quantity),
        minStock: parseInt(productForm.minStock || '0'),
        maxStock: parseInt(productForm.maxStock || '1000'),
        unit: productForm.unit || 'pieces',
        category: productForm.category || 'General',
        brand: productForm.brand || '',
        description: productForm.description || '',
        branch: productForm.branch || 'main',
        isActive: true
      };

      // Create product using API hook
      await createProduct(productData);
      
      console.log('Product Form:', productForm);
      console.log('Selected Product:', selectedProduct);
      console.log('Generated QR Codes:', qrCodes.length);
      
    } catch (error) {
      console.error('Error creating product:', error);
      showError('Error creating product. Please try again.');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Get unique models based on selected category
  const getUniqueModels = () => {
    if (!selectedProduct.category) return [];
    return [...new Set(productData.map(item => item.model))];
  };

  // Get variants based on selected model
  const getVariantsForModel = () => {
    if (!selectedProduct.model) return [];
    return productData
      .filter(item => item.model === selectedProduct.model)
      .map(item => item.variant);
  };

  // Get all unique components from the data
  const getAllComponents = () => {
    const allComponents = productData.flatMap(item => item.aggregators);
    return [...new Set(allComponents)];
  };


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-900 dark:to-black rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <Link to="/products">
                  <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 border-white/30 text-white">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Products
                  </Button>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Add New Product
                </h1>
              </div>
              <p className="text-blue-100 dark:text-gray-300 text-sm sm:text-base">
                Select a product category and configure details
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CubeIcon className="h-8 w-8 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Quick Add Options */}
        {!skipToForm && (
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusIcon className="h-5 w-5 text-blue-600" />
                Quick Add Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => {
                    setSelectedProduct(prev => ({ ...prev, category: 'tractor' }));
                    setSkipToForm(true);
                  }}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CubeIcon className="h-5 w-5 mr-2" />
                  Quick Add Tractor
                </Button>
                <Button
                  onClick={() => {
                    setSelectedProduct(prev => ({ ...prev, category: 'rotovator' }));
                    setSkipToForm(true);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CubeIcon className="h-5 w-5 mr-2" />
                  Quick Add Rotovator
                </Button>
                <Button
                  onClick={() => {
                    setSelectedProduct(prev => ({ ...prev, category: 'service' }));
                    setSkipToForm(true);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <CubeIcon className="h-5 w-5 mr-2" />
                  Quick Add Service
                </Button>
                <Button
                  onClick={handleSkipToForm}
                  variant="outline"
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Skip All - Direct to Form
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tractor Selection Section */}
          {!skipToForm && (
            <div className="space-y-6">
            {/* Step 1: Category Selection */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                    1
                  </span>
                  Choose Product Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Rotovator Card */}
                  <div
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedProduct.category === 'rotovator'
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'
                    }`}
                    onClick={() => handleCategorySelect('rotovator')}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                        <span className="text-2xl">🚜</span>
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        Rotovator
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Agricultural tillage equipment
                      </p>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        selectedProduct.category === 'rotovator'
                          ? 'border-orange-500 bg-orange-500 shadow-md'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedProduct.category === 'rotovator' && (
                          <CheckIcon className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tractor Card */}
                  <div
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedProduct.category === 'tractor'
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50/50 dark:hover:bg-green-900/10'
                    }`}
                    onClick={() => handleCategorySelect('tractor')}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                        <span className="text-2xl">🚜</span>
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        Tractor
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Heavy-duty farming vehicles
                      </p>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        selectedProduct.category === 'tractor'
                          ? 'border-green-500 bg-green-500 shadow-md'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedProduct.category === 'tractor' && (
                          <CheckIcon className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Service Card */}
                  <div
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedProduct.category === 'service'
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-900/10'
                    }`}
                    onClick={() => handleCategorySelect('service')}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mb-3 shadow-lg">
                        <span className="text-2xl">🔧</span>
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        Service
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Maintenance and repair services
                      </p>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        selectedProduct.category === 'service'
                          ? 'border-purple-500 bg-purple-500 shadow-md'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedProduct.category === 'service' && (
                          <CheckIcon className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedProduct.category && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                            Selected: {selectedProduct.category.charAt(0).toUpperCase() + selectedProduct.category.slice(1)}
                          </span>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            Ready to proceed to next step
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSkipToForm}
                        className="text-xs bg-white/50 hover:bg-white/80 border-green-300 text-green-700 hover:text-green-800"
                      >
                        Skip to Form
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Model Selection */}
            {showModels && selectedProduct.category && (
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                      2
                    </span>
                    Choose Model Number
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="model-select">Select Model</Label>
                      <SearchableDropdown
                        options={getUniqueModels()}
                        value={selectedProduct.model || ''}
                        onChange={(value) => {
                          setSelectedProduct(prev => ({ ...prev, model: value, customModel: value }));
                          handleModelSelect(value);
                        }}
                        placeholder="Search and select model..."
                        allowCustom={true}
                        customPlaceholder="Enter custom model..."
                        className="mt-1"
                      />
                    </div>
                    
                    {selectedProduct.model && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-green-800 dark:text-green-200">
                                Selected: {selectedProduct.model}
                              </span>
                              <p className="text-xs text-green-600 dark:text-green-400">
                                {productData.filter(item => item.model === selectedProduct.model).length} variants available
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSkipToForm}
                            className="text-xs bg-white/50 hover:bg-white/80 border-green-300 text-green-700 hover:text-green-800"
                          >
                            Skip to Form
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Variant Selection */}
            {showVariants && selectedProduct.model && (
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                      3
                    </span>
                    Choose Variant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="variant-select">Select Variant</Label>
                      <SearchableDropdown
                        options={getVariantsForModel()}
                        value={selectedProduct.variant || ''}
                        onChange={(value) => {
                          setSelectedProduct(prev => ({ ...prev, variant: value, customVariant: value }));
                          handleVariantSelect(value);
                        }}
                        placeholder="Search and select variant..."
                        allowCustom={true}
                        customPlaceholder="Enter custom variant..."
                        className="mt-1"
                      />
                    </div>
                    
                    {selectedProduct.variant && (
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200 dark:border-purple-800 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                              <CheckIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                                Selected: {selectedProduct.variant}
                              </span>
                              <p className="text-xs text-purple-600 dark:text-purple-400">
                                {productData.find(item => item.model === selectedProduct.model && item.variant === selectedProduct.variant)?.aggregators.length || 0} components available
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSkipToForm}
                            className="text-xs bg-white/50 hover:bg-white/80 border-purple-300 text-purple-700 hover:text-purple-800"
                          >
                            Skip to Form
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Component Selection */}
            {showComponents && selectedProduct.variant && (
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                      4
                    </span>
                    Choose Components
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="component-select">Add Components</Label>
                      <SearchableDropdown
                        options={getAllComponents()}
                        value=""
                        onChange={handleComponentSelect}
                        placeholder="Search and add components..."
                        allowCustom={true}
                        customPlaceholder="Enter custom component..."
                        className="mt-1"
                      />
                    </div>
                    
                    {/* Selected Components */}
                    {(selectedProduct.customComponents && selectedProduct.customComponents.length > 0) && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          Selected Components:
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedProduct.customComponents.map((component, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-200 text-sm rounded-full border border-orange-200 dark:border-orange-800"
                            >
                              <span>{component}</span>
                              <button
                                type="button"
                                onClick={() => handleComponentRemove(component)}
                                className="text-orange-500 hover:text-orange-700 dark:hover:text-orange-300"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Default Components from Variant */}
                    {selectedProduct.aggregators.length > 0 && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium text-foreground mb-2 block">
                          Default Components for {selectedProduct.variant}:
                        </Label>
                        <div className="flex flex-wrap gap-1">
                          {selectedProduct.aggregators.map((aggregator, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                            >
                              {aggregator}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reset Button */}
            {(selectedProduct.category || selectedProduct.model) && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Reset Selection
                </Button>
              </div>
            )}
            </div>
          )}

          {/* Product Form Section */}
          <div className={skipToForm ? "lg:col-span-2" : ""}>
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CubeIcon className="h-5 w-5 text-blue-600" />
                    Product Information
                  </CardTitle>
                  {skipToForm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSkipToForm(false)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800"
                    >
                      Back to Steps
                    </Button>
                  )}
                </div>
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
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        value={productForm.quantity}
                        onChange={handleInputChange}
                        placeholder="0"
                        size="lg"
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={productForm.category || selectedProduct.category || ''}
                      onChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                      options={[
                        { label: 'Rotovator', value: 'rotovator' },
                        { label: 'Tractor', value: 'tractor' },
                        { label: 'Service', value: 'service' }
                      ]}
                      placeholder="Select category"
                    />
                  </div>

                  <div>
                    <Label htmlFor="branch">Branch</Label>
                    {isLoadingBranches ? (
                      <div className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-md">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-500">Loading branches...</span>
                      </div>
                    ) : branchesError ? (
                      <div className="p-3 border border-red-300 dark:border-red-600 rounded-md bg-red-50 dark:bg-red-900/20">
                        <span className="text-sm text-red-600 dark:text-red-400">Failed to load branches</span>
                      </div>
                    ) : (
                      <Select
                        value={productForm.branch}
                        onChange={(value) => setProductForm(prev => ({ ...prev, branch: value }))}
                        options={[
                          { label: 'Main Branch', value: 'main' },
                          ...(Array.isArray(branches) ? branches.map(branch => ({
                            label: branch.name,
                            value: branch._id
                          })) : [])
                        ]}
                        placeholder="Select branch"
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter product description"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      rows={3}
                    />
                  </div>


                  {/* Selected Product Summary */}
                  {selectedProduct.category && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                      <h4 className="font-semibold text-sm text-foreground mb-3">Selected Product Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-medium">{selectedProduct.category.charAt(0).toUpperCase() + selectedProduct.category.slice(1)}</span>
                        </div>
                        {selectedProduct.model && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Model:</span>
                            <span className="font-medium">{selectedProduct.model}</span>
                          </div>
                        )}
                        {selectedProduct.variant && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Variant:</span>
                            <span className="font-medium">{selectedProduct.variant}</span>
                          </div>
                        )}
                        
                        {/* Default Components */}
                        {selectedProduct.aggregators.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Default Components:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedProduct.aggregators.map((aggregator, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs rounded-full"
                                >
                                  {aggregator}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Custom Components */}
                        {selectedProduct.customComponents && selectedProduct.customComponents.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">Custom Components:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedProduct.customComponents.map((component, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 text-xs rounded-full"
                                >
                                  {component}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Total Components Count */}
                        {(selectedProduct.aggregators.length > 0 || (selectedProduct.customComponents && selectedProduct.customComponents.length > 0)) && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-muted-foreground">Total Components:</span>
                            <span className="font-medium ml-2">
                              {selectedProduct.aggregators.length + (selectedProduct.customComponents?.length || 0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button 
                      type="submit" 
                      disabled={isGeneratingQR || isCreatingProduct}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {(isGeneratingQR || isCreatingProduct) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          {isCreatingProduct ? 'Creating Product...' : 'Generating QR Codes...'}
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-5 w-5 mr-2" />
                          Create Product & Generate QR Codes
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => window.history.back()}
                      className="px-6 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Debug Info:</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Show QR Preview: {showQRPreview.toString()}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Generated QR Codes Count: {generatedQRCodes.length}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Product Name: {productForm.name}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Quantity: {productForm.quantity}
              </p>
              <div className="mt-3">
                <Button
                  onClick={async () => {
                    try {
                      const testQRCodes = await generateMultipleQRCodes('TEST-123', 3);
                      setGeneratedQRCodes(testQRCodes);
                      setShowQRPreview(true);
                      console.log('Test QR codes generated:', testQRCodes);
                    } catch (error) {
                      console.error('Test QR generation failed:', error);
                    }
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
                >
                  Test Generate 3 QR Codes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* QR Code Preview Section */}
        {(showQRPreview || generatedQRCodes.length > 0) && (
          <Card className="mt-6 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <QrCodeIcon className="h-5 w-5 text-green-600" />
                  Generated QR Codes ({generatedQRCodes.length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={printQRCodes}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Print QR Codes
                  </Button>
                  <Button
                    onClick={downloadQRCodes}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {generatedQRCodes.map((qrCode, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center hover:shadow-md transition-all duration-200"
                  >
                    <img
                      src={qrCode}
                      alt={`QR Code ${index + 1}`}
                      className="w-full h-auto max-w-32 mx-auto mb-2"
                    />
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      #{index + 1}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {productForm.name}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Successfully generated {generatedQRCodes.length} QR codes for {productForm.name}
                  </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Each QR code contains a unique identifier. You can print or download them for inventory management.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fallback QR Display - Always show if QR codes exist */}
        {generatedQRCodes.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
              Generated QR Codes ({generatedQRCodes.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {generatedQRCodes.map((qrCode, index) => (
                <div key={index} className="text-center">
                  <img
                    src={qrCode}
                    alt={`QR Code ${index + 1}`}
                    className="w-20 h-20 mx-auto mb-1 border border-gray-300 rounded"
                  />
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                onClick={printQRCodes}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <PrinterIcon className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button
                onClick={downloadQRCodes}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AddProductPage;
