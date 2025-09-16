import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import type { SelectOption } from '../components/ui/Select';
import type { Invoice, Product } from '../types';
import { formatCurrency } from '../lib/utils';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  QrCodeIcon,
  MicrophoneIcon,
  ShoppingCartIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customer: { name: '', email: '', phone: '', address: '' },
    items: [] as any[],
    paymentMethod: 'cash' as 'cash' | 'card' | 'upi' | 'bank_transfer',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Mock data for now
      const mockInvoices: Invoice[] = [
        {
          _id: '1',
          invoiceNumber: 'INV-001',
          customer: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            address: '123 Main St, City, State'
          },
          items: [
            { product: 'iPhone 15 Pro', quantity: 1, price: 99999, total: 99999 },
            { product: 'Case', quantity: 1, price: 2999, total: 2999 }
          ],
          subtotal: 102998,
          tax: 12360,
          discount: 0,
          total: 115358,
          paymentMethod: 'card',
          paymentStatus: 'paid',
          branch: 'main',
          createdBy: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: '2',
          invoiceNumber: 'INV-002',
          customer: {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+0987654321',
            address: '456 Oak Ave, City, State'
          },
          items: [
            { product: 'Samsung Galaxy S24', quantity: 1, price: 79999, total: 79999 }
          ],
          subtotal: 79999,
          tax: 9600,
          discount: 1000,
          total: 88599,
          paymentMethod: 'upi',
          paymentStatus: 'pending',
          branch: 'main',
          createdBy: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockProducts: Product[] = [
        {
          _id: '1',
          name: 'iPhone 15 Pro',
          sku: 'IPH15P-001',
          price: 99999,
          costPrice: 80000,
          stock: 25,
          minStock: 5,
          maxStock: 50,
          category: 'Electronics',
          brand: 'Apple',
          unit: 'pieces',
          branch: 'main',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: '2',
          name: 'Samsung Galaxy S24',
          sku: 'SGS24-001',
          price: 79999,
          costPrice: 65000,
          stock: 15,
          minStock: 5,
          maxStock: 60,
          category: 'Electronics',
          brand: 'Samsung',
          unit: 'pieces',
          branch: 'main',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      setInvoices(mockInvoices);
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItemToInvoice = (product: Product) => {
    const existingItem = newInvoice.items.find(item => item.product === product.name);
    if (existingItem) {
      setNewInvoice(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.product === product.name
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        )
      }));
    } else {
      setNewInvoice(prev => ({
        ...prev,
        items: [...prev.items, {
          product: product.name,
          quantity: 1,
          price: product.price,
          total: product.price
        }]
      }));
    }
  };

  const calculateTotal = () => {
    const subtotal = newInvoice.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.12; // 12% tax
    return { subtotal, tax, total: subtotal + tax };
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
                onClick={() => setShowNewInvoice(!showNewInvoice)}
              >
                <QrCodeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">QR Scan</span>
                <span className="sm:hidden">QR</span>
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                onClick={() => setShowNewInvoice(!showNewInvoice)}
              >
                <MicrophoneIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Voice</span>
                <span className="sm:hidden">Mic</span>
              </Button>
              <Button 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-green-400 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                onClick={() => setShowNewInvoice(!showNewInvoice)}
              >
                <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">New Invoice</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>
        </div>

        {/* New Invoice Form */}
        {showNewInvoice && (
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-900 dark:to-black p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-foreground">Create New Invoice</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                Add products and customer details to create an invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
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
                      <Label htmlFor="customerName" className="text-xs sm:text-sm font-semibold text-foreground">Customer Name</Label>
                      <Input
                        id="customerName"
                        value={newInvoice.customer.name}
                        onChange={(e) => setNewInvoice(prev => ({
                          ...prev,
                          customer: { ...prev.customer, name: e.target.value }
                        }))}
                        placeholder="Enter customer name"
                        className="mt-2 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail" className="text-xs sm:text-sm font-semibold text-foreground">Email</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={newInvoice.customer.email}
                        onChange={(e) => setNewInvoice(prev => ({
                          ...prev,
                          customer: { ...prev.customer, email: e.target.value }
                        }))}
                        placeholder="Enter email"
                        className="mt-2 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone" className="text-xs sm:text-sm font-semibold text-foreground">Phone</Label>
                      <Input
                        id="customerPhone"
                        value={newInvoice.customer.phone}
                        onChange={(e) => setNewInvoice(prev => ({
                          ...prev,
                          customer: { ...prev.customer, phone: e.target.value }
                        }))}
                        placeholder="Enter phone number"
                        className="mt-2 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
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
                  <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                    {products.map((product) => (
                      <div key={product._id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{product.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {formatCurrency(product.price)} | Stock: {product.stock}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addItemToInvoice(product)}
                          disabled={product.stock === 0}
                          className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              {newInvoice.items.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="h-4 w-4 text-purple-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">Invoice Items</h3>
                  </div>
                  <div className="space-y-3">
                    {newInvoice.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200">
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{item.product}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {formatCurrency(item.price)} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-base sm:text-lg text-green-600">{formatCurrency(item.total)}</span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setNewInvoice(prev => ({
                              ...prev,
                              items: prev.items.filter((_, i) => i !== index)
                            }))}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black rounded-xl border-2 border-gray-200">
                    <div className="space-y-2">
                      <div className="flex justify-between text-base sm:text-lg">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-semibold">{formatCurrency(calculateTotal().subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-base sm:text-lg">
                        <span className="text-muted-foreground">Tax (12%):</span>
                        <span className="font-semibold">{formatCurrency(calculateTotal().tax)}</span>
                      </div>
                      <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                        <div className="flex justify-between text-lg sm:text-xl font-bold">
                          <span className="text-foreground">Total:</span>
                          <span className="text-green-600">{formatCurrency(calculateTotal().total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-green-400">
                  Create Invoice
                </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowNewInvoice(false)}
                      className="border-2 border-gray-300 text-muted-foreground hover:bg-muted px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-semibold"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-xs sm:text-sm font-semibold text-foreground">Search Invoices</Label>
                <div className="relative mt-2">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by invoice number, customer name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-10 sm:h-12 text-sm sm:text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice._id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors">
                        {invoice.invoiceNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        invoice.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : invoice.paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {invoice.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Customer:</span> {invoice.customer?.name} ({invoice.customer?.email})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Created:</span> {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Payment:</span> {invoice.paymentMethod.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-bold text-green-600">{formatCurrency(invoice.total)}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Total Amount
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-400 transition-all duration-200"
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200"
                  >
                    Print
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInvoices.length === 0 && (
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <ShoppingCartIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'No invoices found' : 'No invoices available'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? 'Try adjusting your search terms or filters.'
                  : 'Get started by creating your first invoice.'
                }
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
        )}
      </div>
    </DashboardLayout>
  );
}
