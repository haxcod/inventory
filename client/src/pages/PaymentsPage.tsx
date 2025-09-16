import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import type { SelectOption } from '../components/ui/Select';
import type { Payment } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'upi' | 'bank_transfer',
    paymentType: 'credit' as 'credit' | 'debit',
    description: '',
    reference: '',
    customer: '',
    notes: '',
  });

  const paymentMethodOptions: SelectOption[] = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank_transfer', label: 'Bank Transfer' }
  ];

  const paymentTypeOptions: SelectOption[] = [
    { value: 'credit', label: 'Credit (Money In)' },
    { value: 'debit', label: 'Debit (Money Out)' }
  ];

  const typeFilterOptions: SelectOption[] = [
    { value: 'all', label: 'All Types' },
    { value: 'credit', label: 'Credits Only' },
    { value: 'debit', label: 'Debits Only' }
  ];

  const methodFilterOptions: SelectOption[] = [
    { value: 'all', label: 'All Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank_transfer', label: 'Bank Transfer' }
  ];

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      // Mock data for now
      const mockPayments: Payment[] = [
        {
          _id: '1',
          amount: 500000, // 5L
          paymentMethod: 'upi',
          paymentType: 'credit',
          description: 'Payment for Invoice INV-001',
          reference: 'TXN123456789',
          customer: 'John Doe',
          branch: 'main',
          createdBy: 'user1',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          _id: '2',
          amount: 250000, // 2.5L
          paymentMethod: 'card',
          paymentType: 'credit',
          description: 'Partial payment for Invoice INV-002',
          reference: 'CARD987654321',
          customer: 'Jane Smith',
          branch: 'main',
          createdBy: 'user1',
          createdAt: new Date('2024-01-14'),
          updatedAt: new Date('2024-01-14'),
        },
        {
          _id: '3',
          amount: 10000,
          paymentMethod: 'cash',
          paymentType: 'debit',
          description: 'Refund for returned item',
          reference: 'REF123456',
          customer: 'Bob Johnson',
          branch: 'main',
          createdBy: 'user1',
          createdAt: new Date('2024-01-13'),
          updatedAt: new Date('2024-01-13'),
        },
        {
          _id: '4',
          amount: 75000,
          paymentMethod: 'bank_transfer',
          paymentType: 'credit',
          description: 'Payment for bulk order',
          reference: 'BANK456789',
          customer: 'Alice Brown',
          branch: 'main',
          createdBy: 'user1',
          createdAt: new Date('2024-01-12'),
          updatedAt: new Date('2024-01-12'),
        },
      ];

      setPayments(mockPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || payment.paymentType === typeFilter;
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    
    return matchesSearch && matchesType && matchesMethod;
  });

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'upi':
        return <DevicePhoneMobileIcon className="h-5 w-5" />;
      case 'cash':
        return <BanknotesIcon className="h-5 w-5" />;
      case 'bank_transfer':
        return <BuildingLibraryIcon className="h-5 w-5" />;
      default:
        return <BanknotesIcon className="h-5 w-5" />;
    }
  };

  const getPaymentTypeColor = (type: string) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const handleCreatePayment = async () => {
    try {
      // Mock API call
      const paymentData = {
        ...newPayment,
        amount: parseFloat(newPayment.amount),
        branch: 'main',
        createdBy: 'user1',
      };
      
      console.log('Creating payment:', paymentData);
      setShowNewPayment(false);
      setNewPayment({
        amount: '',
        paymentMethod: 'cash',
        paymentType: 'credit',
        description: '',
        reference: '',
        customer: '',
        notes: '',
      });
      // Refresh payments list
      fetchPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-gray-900 dark:to-black rounded-xl p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Payment Management
              </h1>
              <p className="mt-2 text-emerald-100 dark:text-gray-300 text-sm sm:text-base">
                Track and manage all payment transactions
              </p>
            </div>
            <Button 
              onClick={() => setShowNewPayment(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-emerald-400 w-full sm:w-auto"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Payment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start min-w-0 flex-1">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
                    <BanknotesIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Payments
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                      {payments.length}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start min-w-0 flex-1">
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg flex-shrink-0">
                    <span className="text-white font-bold text-lg sm:text-xl">₹</span>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Amount
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                      {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start min-w-0 flex-1">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg flex-shrink-0">
                    <span className="text-white font-bold text-lg sm:text-xl">+</span>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Credits
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                      {formatCurrency(payments.filter(p => p.paymentType === 'credit').reduce((sum, p) => sum + p.amount, 0))}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start min-w-0 flex-1">
                  <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg flex-shrink-0">
                    <span className="text-white font-bold text-lg sm:text-xl">-</span>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Debits
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                      {formatCurrency(payments.filter(p => p.paymentType === 'debit').reduce((sum, p) => sum + p.amount, 0))}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Payment Modal */}
        {showNewPayment && (
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-black">
              <CardTitle className="text-lg sm:text-xl font-bold text-foreground">Create New Payment</CardTitle>
              <CardDescription className="text-muted-foreground">
                Record a new payment transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="amount" className="text-sm font-semibold text-foreground">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Enter amount"
                    className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod" className="text-sm font-semibold text-foreground">Payment Method</Label>
                  <Select
                    id="paymentMethod"
                    options={paymentMethodOptions}
                    value={newPayment.paymentMethod}
                    onChange={(value) => setNewPayment(prev => ({ ...prev, paymentMethod: value as any }))}
                    placeholder="Select payment method"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentType" className="text-sm font-semibold text-foreground">Payment Type</Label>
                  <Select
                    id="paymentType"
                    options={paymentTypeOptions}
                    value={newPayment.paymentType}
                    onChange={(value) => setNewPayment(prev => ({ ...prev, paymentType: value as any }))}
                    placeholder="Select payment type"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="customer" className="text-sm font-semibold text-foreground">Customer</Label>
                  <Input
                    id="customer"
                    value={newPayment.customer}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, customer: e.target.value }))}
                    placeholder="Enter customer name"
                    className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-foreground">Description</Label>
                  <Input
                    id="description"
                    value={newPayment.description}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter payment description"
                    className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="reference" className="text-sm font-semibold text-foreground">Reference</Label>
                  <Input
                    id="reference"
                    value={newPayment.reference}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Transaction reference"
                    className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="notes" className="text-sm font-semibold text-foreground">Notes</Label>
                  <Input
                    id="notes"
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes"
                    className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button 
                  onClick={handleCreatePayment}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  Create Payment
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewPayment(false)}
                  className="border-2 border-gray-200 hover:border-gray-300 hover:bg-muted"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="search" className="text-sm font-semibold text-foreground">Search Payments</Label>
                <div className="relative mt-2">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by description, customer, or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="type" className="text-sm font-semibold text-foreground">Type</Label>
                <Select
                  id="type"
                  options={typeFilterOptions}
                  value={typeFilter}
                  onChange={setTypeFilter}
                  placeholder="Select type"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="method" className="text-sm font-semibold text-foreground">Method</Label>
                <Select
                  id="method"
                  options={methodFilterOptions}
                  value={methodFilter}
                  onChange={setMethodFilter}
                  placeholder="Select method"
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card key={payment._id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          payment.paymentMethod === 'cash' ? 'bg-green-100 text-green-600' :
                          payment.paymentMethod === 'card' ? 'bg-blue-100 text-blue-600' :
                          payment.paymentMethod === 'upi' ? 'bg-purple-100 text-purple-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getPaymentMethodIcon(payment.paymentMethod)}
                        </div>
                        <span className="capitalize font-semibold text-foreground">
                          {payment.paymentMethod.replace('_', ' ')}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        payment.paymentType === 'credit' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {payment.paymentType.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-2 font-medium">
                      {payment.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span><strong>Customer:</strong> {payment.customer}</span>
                      <span><strong>Ref:</strong> {payment.reference}</span>
                      <span><strong>Date:</strong> {formatDate(payment.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getPaymentTypeColor(payment.paymentType)}`}>
                      {payment.paymentType === 'credit' ? '+' : '-'}{formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button variant="outline" size="sm" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50 hover:text-green-700">
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <BanknotesIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'No payments found' : 'No payments available'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters.' 
                  : 'Get started by recording your first payment transaction.'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setShowNewPayment(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Record First Payment
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
