import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { ProductTransferModal } from '../components/ui/ProductTransferModal';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ArrowRightIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth, useBranches, useTransfers } from '../hooks/useStores';
import { useConfirmations } from '../hooks/useConfirmations';
import { formatNumber, formatDate } from '../lib/utils';
import { isAdmin, getUserBranchName } from '../lib/roles';
import type { Product, Branch } from '../types';

interface TransferWithDetails {
  _id: string;
  product: Product;
  fromBranch: Branch;
  toBranch: Branch;
  quantity: number;
  reason: string;
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  completedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

export default function TransferPage() {
  const { user } = useAuth();
  const { branches, fetchBranches } = useBranches();
  const { transfers, fetchTransfers, isLoading, error, createTransfer: storeCreateTransfer, removeTransfer } = useTransfers();
  // Type assertion to ensure compatibility with TransferWithDetails type
  const typedTransfers = transfers as unknown as TransferWithDetails[];
  const { showSuccess, confirmDelete } = useConfirmations();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [selectedProduct] = useState<Product | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const branchName = getUserBranchName(user);

  // Load data using the same pattern as ProductsPage and BillingPage
  useEffect(() => {
    console.log('🔍 TransferPage useEffect - transfers.length:', typedTransfers.length, 'branches.length:', branches.length);
    
    // Only fetch transfers if we don't have transfers yet
    if (typedTransfers.length === 0) {
      console.log('📥 Fetching transfers...');
      fetchTransfers();
    }
    
    // Only fetch branches if we don't have branches yet
    if (branches.length === 0) {
      console.log('📥 Fetching branches...');
      fetchBranches();
    }
  }, [typedTransfers.length, branches.length, fetchTransfers, fetchBranches]);

  // Filter transfers based on search and filters
  const filteredTransfers = typedTransfers.filter(transfer => {
    const matchesSearch = 
      transfer.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.fromBranch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.toBranch.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || transfer.status === statusFilter;
    const matchesReason = !reasonFilter || transfer.reason === reasonFilter;
    
    return matchesSearch && matchesStatus && matchesReason;
  });

  // Handle transfer creation using Zustand store
  const handleTransfer = useCallback(async (transferData: {
    productId: string;
    fromBranch: string;
    toBranch: string;
    quantity: number;
    reason: string;
    notes?: string;
  }) => {
    try {
      // Use store method which handles API call and state update
      await storeCreateTransfer(transferData);
      showSuccess('Product transferred successfully');
    } catch (error) {
      console.error('Transfer error:', error);
      throw error;
    }
  }, [storeCreateTransfer, showSuccess]);

  // Handle transfer cancellation using Zustand store
  const handleCancelTransfer = useCallback(async (transfer: TransferWithDetails) => {
    try {
      setIsDeleting(true);
      // Use store method which handles API call and state update
      await removeTransfer(transfer._id);
      showSuccess('Transfer cancelled successfully');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while cancelling transfer';
      console.error('Transfer cancellation error:', errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [removeTransfer, showSuccess]);

  // Handle transfer cancellation with confirmation
  const handleCancelTransferConfirm = (transfer: TransferWithDetails) => {
    confirmDelete(
      `transfer of ${transfer.quantity} ${transfer.product.unit} of ${transfer.product.name}`,
      () => handleCancelTransfer(transfer)
    );
  };

  // Handle view transfer
  const handleViewTransfer = (transfer: TransferWithDetails) => {
    // Navigate to transfer details page or show modal
    console.log('View transfer:', transfer);
  };

  // Handle edit transfer (if pending)
  const handleEditTransfer = (transfer: TransferWithDetails) => {
    if (transfer.status === 'pending') {
      // Navigate to edit page or show edit modal
      console.log('Edit transfer:', transfer);
    }
  };

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex-1">
            <h1 className="text-3xl font-bold text-white dark:text-white">
              Product Transfers
            </h1>
              <p className="mt-2 text-blue-100 dark:text-gray-300 text-sm sm:text-base">
                {isAdmin(user) 
                  ? 'Manage product transfers across all branches' 
                  : `Manage product transfers for ${branchName || 'your branch'}`
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
              <Button
                onClick={() => setIsTransferModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-blue-400 w-full sm:w-auto"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Transfer
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-semibold text-foreground">
                  Search Transfers
                </Label>
                <div className="relative mt-2">
                  <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by product name, SKU, or branch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="lg"
                    className="pl-10 sm:pl-12"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="status" className="text-sm font-semibold text-foreground">
                  Filter by Status
                </Label>
                <div className="mt-2">
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="reason" className="text-sm font-semibold text-foreground">
                  Filter by Reason
                </Label>
                <div className="mt-2">
                  <select
                    id="reason"
                    value={reasonFilter}
                    onChange={(e) => setReasonFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Reasons</option>
                    <option value="restock">Restock</option>
                    <option value="demand">High Demand</option>
                    <option value="rebalance">Stock Rebalancing</option>
                    <option value="emergency">Emergency Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transfers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightIcon className="h-5 w-5" />
              Transfer History
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({filteredTransfers.length} transfers)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-16 w-16" style={{borderBottom: '2px solid hsl(var(--primary))'}}></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Card className="p-8 text-center max-w-md">
                  <CardContent>
                    <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Transfers</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <Button onClick={() => fetchTransfers()} className="bg-blue-600 hover:bg-blue-700">
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : filteredTransfers.length === 0 ? (
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <ArrowRightIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {searchTerm || statusFilter || reasonFilter ? 'No transfers found' : 'No transfers available'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm || statusFilter || reasonFilter 
                      ? 'Try adjusting your search terms or filters.' 
                      : 'Get started by creating your first product transfer.'
                    }
                  </p>
                  {!(searchTerm || statusFilter || reasonFilter) && (
                    <Button
                      onClick={() => setIsTransferModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create First Transfer
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredTransfers.map((transfer) => (
                  <Card key={transfer._id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                    <CardHeader className="pb-4 p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg sm:text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors">
                            {transfer.product.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex flex-row items-center gap-1 ${getStatusColor(transfer.status)}`}>
                              {getStatusIcon(transfer.status)}
                              <span className="capitalize">{transfer.status}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">SKU:</span>
                          <span className="font-medium">{transfer.product.sku}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Quantity:</span>
                          <span className="font-medium">{formatNumber(transfer.quantity)} {transfer.product.unit}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">From Branch:</span>
                          <span className="font-medium">{transfer.fromBranch.name}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">To Branch:</span>
                          <span className="font-medium">{transfer.toBranch.name}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Reason:</span>
                          <span className="font-medium capitalize">{transfer.reason.replace('_', ' ')}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Created By:</span>
                          <span className="font-medium">{transfer.createdBy.name}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Created:</span>
                          <span className="font-medium">{formatDate(transfer.createdAt)}</span>
                        </div>
                        
                        {transfer.completedAt && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Completed:</span>
                            <span className="font-medium">{formatDate(transfer.completedAt)}</span>
                          </div>
                        )}
                      </div>

                      {transfer.notes && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Notes:</strong> {transfer.notes}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewTransfer(transfer)}
                          className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                        >
                          View
                        </Button>
                        
                        {transfer.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditTransfer(transfer)}
                              className="flex-1 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-400 transition-all duration-200"
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleCancelTransferConfirm(transfer)}
                              disabled={isDeleting}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                              title="Cancel Transfer"
                            >
                              {isDeleting ? '...' : 'Cancel'}
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transfer Modal */}
        <ProductTransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          product={selectedProduct}
          onTransfer={handleTransfer}
        />
      </div>
    </DashboardLayout>
  );
}
