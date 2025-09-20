import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { QRScanner } from '../components/ui/QRScanner';
import { QRMachine } from '../components/ui/QRMachine';
import { VoiceInput } from '../components/ui/VoiceInput';
import { ModernInvoice } from '../components/ui/ModernInvoice';
import type { Invoice, Product } from '../types';
import { formatCurrency } from '../lib/utils';
import { apiService } from '../lib/api';
import { useApiList, useApiCreate, useApiDelete } from '../hooks/useApi';
import { useConfirmations } from '../hooks/useConfirmations';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  QrCodeIcon,
  MicrophoneIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  ComputerDesktopIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showQRMachine, setShowQRMachine] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showModernInvoice, setShowModernInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [newInvoice, setNewInvoice] = useState({
    customer: { name: '', email: '', phone: '', address: '' },
    items: [] as Array<{product: string, quantity: number, price: number, total: number}>,
    paymentMethod: 'cash' as 'cash' | 'card' | 'upi' | 'bank_transfer',
    notes: '',
  });

  // Use API hooks and confirmations
  const { showError, confirmDelete } = useConfirmations();
  
  const {
    loading: isLoadingInvoices,
    execute: fetchInvoices
  } = useApiList<any>(apiService.invoices.getAll, {
    onSuccess: (data) => {
      setInvoices((data as any)?.invoices || []);
    },
    onError: () => {
      showError('Failed to load invoices');
    }
  });

  const {
    loading: isLoadingProducts,
    execute: fetchProducts
  } = useApiList<any>(apiService.products.getAll, {
    onSuccess: (data) => {
      setProducts((data as any)?.products || []);
    },
    onError: () => {
      showError('Failed to load products');
    }
  });

  const {
    loading: isCreatingInvoice,
    execute: createInvoice
  } = useApiCreate<Invoice>(apiService.invoices.create, {
    onSuccess: () => {
      setShowNewInvoice(false);
      setNewInvoice({
        customer: { name: '', email: '', phone: '', address: '' },
        items: [],
        paymentMethod: 'cash',
        notes: '',
      });
      fetchInvoices();
    },
    onError: () => {
      showError('Failed to create invoice');
    }
  });

  const {
    loading: isDeletingInvoice,
    execute: deleteInvoice
  } = useApiDelete(apiService.invoices.delete, {
    onSuccess: () => {
      fetchInvoices();
    },
    onError: () => {
      showError('Failed to delete invoice');
    }
  });

  // Load data on component mount
  useEffect(() => {
    fetchInvoices();
    fetchProducts();
  }, [fetchInvoices, fetchProducts]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);

  const handleAddProduct = () => {
    if (!selectedProduct) return;

    const existingItemIndex = newInvoice.items.findIndex(
      item => item.product === selectedProduct._id
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...newInvoice.items];
      updatedItems[existingItemIndex].quantity += productQuantity;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * selectedProduct.price;
      setNewInvoice(prev => ({ ...prev, items: updatedItems }));
    } else {
      const newItem = {
        product: selectedProduct._id,
        quantity: productQuantity,
        price: selectedProduct.price,
        total: productQuantity * selectedProduct.price,
      };
      setNewInvoice(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }

    setSelectedProduct(null);
    setProductQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = newInvoice.items.filter((_, i) => i !== index);
    setNewInvoice(prev => ({ ...prev, items: updatedItems }));
  };

  const handleCreateInvoice = async () => {
    if (newInvoice.items.length === 0) {
      showError('Please add at least one product');
      return;
    }

    if (!newInvoice.customer.name) {
      showError('Please enter customer name');
      return;
    }

    const invoiceData = {
      ...newInvoice,
      total: newInvoice.items.reduce((sum, item) => sum + item.total, 0),
      status: 'pending' as const,
    };

    await createInvoice(invoiceData);
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    confirmDelete(
      `invoice #${invoice.invoiceNumber}`,
      async () => {
        await deleteInvoice(invoice._id);
      }
    );
  };

  const handleQRScan = (data: string) => {
    console.log('QR Code scanned:', data);
    // Handle QR code data
  };

  const handleVoiceInput = (text: string) => {
    console.log('Voice input:', text);
    // Handle voice input
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

  // Show loading if data is not yet available
  if (isLoadingInvoices || !invoices || isLoadingProducts || !products) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-gray-900 dark:to-black rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Billing & Invoicing
              </h1>
              <p className="mt-2 text-green-100 dark:text-gray-300 text-sm sm:text-base">
                Manage invoices and billing operations
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                onClick={() => setShowQRScanner(true)}
              >
                <QrCodeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Camera Scan</span>
                <span className="sm:hidden">Camera</span>
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                onClick={() => setShowQRMachine(true)}
              >
                <ComputerDesktopIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Machine Scan</span>
                <span className="sm:hidden">Machine</span>
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                onClick={() => setShowVoiceInput(true)}
              >
                <MicrophoneIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Voice</span>
                <span className="sm:hidden">Mic</span>
              </Button>
              <Button 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-green-400 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                onClick={() => setShowNewInvoice(true)}
              >
                <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">New Invoice</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-xs sm:text-sm font-semibold text-foreground">Search Invoices</Label>
                <div className="relative mt-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by customer name or invoice number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="lg"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Invoices</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{filteredInvoices.length}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-green-50 to-green-100 dark:from-gray-800 dark:to-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Amount</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Items</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {filteredInvoices.reduce((sum, inv) => sum + inv.items.length, 0)}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg Amount</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {filteredInvoices.length > 0 ? formatCurrency(totalAmount / filteredInvoices.length) : formatCurrency(0)}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <DocumentTextIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No Invoices Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm sm:text-base">
                {searchTerm ? 'No invoices match your search criteria.' : 'Get started by creating your first invoice.'}
              </p>
              {!searchTerm && (
                <Button 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-green-400"
                  onClick={() => setShowNewInvoice(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Your First Invoice
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice._id} className="hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        #{invoice.invoiceNumber}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                        {invoice.customer?.name || 'Unknown Customer'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Invoice
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(invoice.total)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Date:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Payment:</span>
                      <span className="text-gray-900 dark:text-white capitalize">
                        {invoice.paymentMethod.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowModernInvoice(true);
                      }}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteInvoice(invoice)}
                      disabled={isDeletingInvoice}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* New Invoice Modal */}
        {showNewInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blurred Background */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowNewInvoice(false)}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">📄</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Create New Invoice
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add products and customer details to create an invoice
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewInvoice(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Customer Details */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <ShoppingCartIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground">Customer Details</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="customerName">Customer Name</Label>
                        <Input
                          id="customerName"
                          value={newInvoice.customer.name}
                          onChange={(e) => setNewInvoice(prev => ({
                            ...prev,
                            customer: { ...prev.customer, name: e.target.value }
                          }))}
                          placeholder="Enter customer name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="customerEmail">Email</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={newInvoice.customer.email}
                          onChange={(e) => setNewInvoice(prev => ({
                            ...prev,
                            customer: { ...prev.customer, email: e.target.value }
                          }))}
                          placeholder="Enter email address"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="customerPhone">Phone</Label>
                        <Input
                          id="customerPhone"
                          value={newInvoice.customer.phone}
                          onChange={(e) => setNewInvoice(prev => ({
                            ...prev,
                            customer: { ...prev.customer, phone: e.target.value }
                          }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="customerAddress">Address</Label>
                        <Input
                          id="customerAddress"
                          value={newInvoice.customer.address}
                          onChange={(e) => setNewInvoice(prev => ({
                            ...prev,
                            customer: { ...prev.customer, address: e.target.value }
                          }))}
                          placeholder="Enter address"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                        <DocumentTextIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-foreground">Add Products</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label htmlFor="productSelect">Select Product</Label>
                          <Select
                            id="productSelect"
                            options={[
                              { value: '', label: 'Choose a product' },
                              ...products.map(product => ({
                                value: product._id,
                                label: `${product.name} - ${formatCurrency(product.price)}`
                              }))
                            ]}
                            value={selectedProduct?._id || ''}
                            onChange={(value) => {
                              const product = products.find(p => p._id === value);
                              setSelectedProduct(product || null);
                            }}
                            placeholder="Choose a product"
                            className="mt-2"
                          />
                        </div>
                        <div className="w-24">
                          <Label htmlFor="quantity">Qty</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={productQuantity}
                            onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                            placeholder="1"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            onClick={handleAddProduct}
                            disabled={!selectedProduct}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {newInvoice.items.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Added Items:</h4>
                          {newInvoice.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                              <span className="text-sm">{item.product} x {item.quantity}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{formatCurrency(item.total)}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveItem(index)}
                                  className="h-6 w-6 p-0"
                                >
                                  <TrashIcon className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewInvoice(false)}
                    className="px-6 py-2"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateInvoice}
                    disabled={isCreatingInvoice}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingInvoice ? 'Creating...' : 'Create Invoice'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Scanner Modal */}
        <QRScanner
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScan={handleQRScan}
        />

        {/* QR Machine Modal */}
        <QRMachine
          isOpen={showQRMachine}
          onClose={() => setShowQRMachine(false)}
          onScan={handleQRScan}
        />

        {/* Voice Input Modal */}
        <VoiceInput
          isOpen={showVoiceInput}
          onClose={() => setShowVoiceInput(false)}
          onResult={handleVoiceInput}
        />

        {/* Modern Invoice Modal */}
        {showModernInvoice && selectedInvoice && (
          <ModernInvoice
            isOpen={showModernInvoice}
            onClose={() => {
              setShowModernInvoice(false);
              setSelectedInvoice(null);
            }}
            invoice={selectedInvoice}
            products={products}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
