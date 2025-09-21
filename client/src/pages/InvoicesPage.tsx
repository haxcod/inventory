import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import type { SelectOption } from '../components/ui/Select';
import type { Invoice } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { apiService } from '../lib/api';
import { useApiList, useApiDelete } from '../hooks/useApi';
import { useConfirmations } from '../hooks/useConfirmations';
import { 
  MagnifyingGlassIcon, 
  DocumentTextIcon,
  PrinterIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const { confirmDelete } = useConfirmations();

  // Use API hooks for invoices
  const {
    data: invoicesResponse,
    loading: isLoading,
    error: invoicesError,
    execute: fetchInvoices
  } = useApiList<any>(apiService.invoices.getAll, {
    onSuccess: (data: any) => {
      console.log('Invoices loaded successfully:', data);
    },
    onError: (error: string) => {
      console.error('Failed to load invoices:', error);
    }
  });
  
  console.log(invoicesResponse);
  

  // Extract invoices array from response
  const invoices = (invoicesResponse as any)?.invoices || [];
  

  const {
    execute: deleteInvoice,
    loading: isDeletingInvoice
  } = useApiDelete(apiService.invoices.delete, {
    onSuccess: () => {
      fetchInvoices(); // Refresh the list
    },
    itemName: 'Invoice'
  });

  const statusFilterOptions: SelectOption[] = [
    { value: 'all', label: 'All Status' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const dateFilterOptions: SelectOption[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDeleteInvoice = (invoice: Invoice) => {
    confirmDelete(`Invoice #${invoice.invoiceNumber}`, async () => {
      await deleteInvoice(invoice._id);
    });
  };

  const filteredInvoices = (Array.isArray(invoices) ? invoices : []).filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return '💳';
      case 'upi':
        return '📱';
      case 'cash':
        return '💵';
      case 'bank_transfer':
        return '🏦';
      default:
        return '💰';
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

  if (invoicesError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <CardContent>
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Invoices</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{invoicesError}</p>
              <Button onClick={() => fetchInvoices()} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading if no data yet
  if (isLoading || !invoices) {
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
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-gray-900 dark:to-black rounded-xl p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Invoice Management
              </h1>
              <p className="mt-2 text-indigo-100 dark:text-gray-300 text-sm sm:text-base">
                Manage and track all your invoices
              </p>
            </div>
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-indigo-400 w-full sm:w-auto">
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start min-w-0 flex-1">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg flex-shrink-0">
                    <DocumentTextIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Invoices
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                      {(Array.isArray(invoices) ? invoices : []).length}
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
                  <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg flex-shrink-0">
                    <span className="text-white font-bold text-lg sm:text-xl">₹</span>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Amount
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                      {formatCurrency((Array.isArray(invoices) ? invoices : []).reduce((sum, inv) => sum + inv.total, 0))}
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
                  <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg flex-shrink-0">
                    <span className="text-white font-bold text-lg sm:text-xl">⏳</span>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Pending
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                      {(Array.isArray(invoices) ? invoices : []).filter(inv => inv.paymentStatus === 'pending').length}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start min-w-0 flex-1">
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg flex-shrink-0">
                    <span className="text-white font-bold text-lg sm:text-xl">✅</span>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Paid
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                      {(Array.isArray(invoices) ? invoices : []).filter(inv => inv.paymentStatus === 'paid').length}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="search" className="text-xs sm:text-sm font-semibold text-foreground">Search Invoices</Label>
                <div className="relative mt-2">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by invoice number, customer name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="lg"
                    className="pl-12"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status" className="text-xs sm:text-sm font-semibold text-foreground">Status</Label>
                <Select
                  id="status"
                  options={statusFilterOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="Select status"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="date" className="text-xs sm:text-sm font-semibold text-foreground">Date Range</Label>
                <Select
                  id="date"
                  options={dateFilterOptions}
                  value={dateFilter}
                  onChange={setDateFilter}
                  placeholder="Select date range"
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground">Invoice List</CardTitle>
            <CardDescription className="text-muted-foreground">
              {filteredInvoices.length} invoice(s) found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      Invoice #
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      Customer
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      Amount
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      Payment
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <span className="font-semibold text-foreground">{invoice.invoiceNumber}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-foreground">{invoice.customer?.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {invoice.customer?.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-muted-foreground">{formatDate(invoice.createdAt)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-green-600 text-lg">{formatCurrency(invoice.total)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.paymentStatus)}`}>
                          {invoice.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <span className="mr-2 text-lg">{getPaymentMethodIcon(invoice.paymentMethod)}</span>
                          <span className="capitalize text-muted-foreground">{invoice.paymentMethod.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50 hover:text-green-700">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-purple-600 hover:bg-purple-50 hover:text-purple-700">
                            <PrinterIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeleteInvoice(invoice)}
                            disabled={isDeletingInvoice}
                          >
                            <TrashIcon className="h-4 w-4" />
                            {isDeletingInvoice ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredInvoices.length === 0 && (
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <DocumentTextIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'No invoices found' : 'No invoices available'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters.' 
                  : 'Get started by creating your first invoice.'
                }
              </p>
              {!searchTerm && (
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-indigo-400">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
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
