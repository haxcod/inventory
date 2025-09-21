import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ProductTransferModal } from '../components/ui/ProductTransferModal';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ArrowRightIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useConfirmations } from '../hooks/useConfirmations';
import { useApi, useApiDelete } from '../hooks/useApi';
import { apiService } from '../lib/api';
import { formatNumber, formatDate } from '../lib/utils';
import { hasPermission, PERMISSIONS } from '../lib/permissions';
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
  const { showSuccess, confirmDelete } = useConfirmations();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [selectedProduct] = useState<Product | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transfers, setTransfers] = useState<TransferWithDetails[]>([]);

  // API hooks
  const {
    loading: isLoading,
    error: transfersError,
    execute: fetchTransfers
  } = useApi<{transfers: TransferWithDetails[]}>(apiService.transfers.getAll, {
    onSuccess: (data: {transfers: TransferWithDetails[]}) => {
      console.log('Transfers loaded successfully:', data);
      setTransfers(data.transfers || []);
    },
    onError: (error: string) => {
      console.error('Failed to load transfers:', error);
    }
  });

  const {
    loading: isDeleting
  } = useApiDelete(apiService.transfers.delete, {
    onSuccess: () => {
      showSuccess('Transfer cancelled successfully');
      fetchTransfers();
    },
    onError: (error: string) => {
      console.error('Failed to cancel transfer:', error);
    }
  });

  // Load data on component mount
  useEffect(() => {
    fetchTransfers();
  }, []);

  // Filter transfers based on search and filters
  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = 
      transfer.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.fromBranch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.toBranch.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || transfer.status === statusFilter;
    const matchesReason = !reasonFilter || transfer.reason === reasonFilter;
    
    return matchesSearch && matchesStatus && matchesReason;
  });

  // Handle transfer creation
  const handleTransfer = async (transferData: any) => {
    try {
      const response = await apiService.transfers.create(transferData);
      if (response.data?.success) {
        showSuccess('Product transferred successfully');
        fetchTransfers();
      } else {
        throw new Error(response.data?.message || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      throw error;
    }
  };

  // Handle transfer cancellation
  const handleCancelTransfer = (transfer: TransferWithDetails) => {
    confirmDelete(
      `transfer of ${transfer.quantity} ${transfer.product.unit} of ${transfer.product.name}`,
      () => {
        // The actual delete will be handled by the useApiDelete hook
        console.log('Transfer cancellation confirmed');
      }
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

  // Check permissions
  const canCreate = hasPermission(user, PERMISSIONS.TRANSFERS_CREATE);
  const canEdit = hasPermission(user, PERMISSIONS.TRANSFERS_EDIT);
  const canDelete = hasPermission(user, PERMISSIONS.TRANSFERS_DELETE);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Product Transfers
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage product transfers between branches
            </p>
          </div>
          {canCreate && (
            <Button
              onClick={() => setIsTransferModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Transfer
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search transfers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Reason Filter */}
              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Reasons</option>
                <option value="restock">Restock</option>
                <option value="demand">High Demand</option>
                <option value="rebalance">Stock Rebalancing</option>
                <option value="emergency">Emergency Transfer</option>
                <option value="other">Other</option>
              </select>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setReasonFilter('');
                }}
              >
                Clear Filters
              </Button>
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
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : transfersError ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400">
                  Failed to load transfers. Please try again.
                </p>
                <Button
                  onClick={() => fetchTransfers()}
                  variant="outline"
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            ) : filteredTransfers.length === 0 ? (
              <div className="text-center py-12">
                <ArrowRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No transfers found
                </p>
                {canCreate && (
                  <Button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="mt-4"
                  >
                    Create First Transfer
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransfers.map((transfer) => (
                  <Card key={transfer._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                              {transfer.product.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                              {getStatusIcon(transfer.status)}
                              <span className="ml-1 capitalize">{transfer.status}</span>
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">SKU:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {transfer.product.sku}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {formatNumber(transfer.quantity)} {transfer.product.unit}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">From:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {transfer.fromBranch.name}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">To:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {transfer.toBranch.name}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Reason:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                                {transfer.reason.replace('_', ' ')}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Created:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {formatDate(transfer.createdAt)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Created By:</span>
                              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                {transfer.createdBy.name}
                              </span>
                            </div>
                            {transfer.completedAt && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Completed:</span>
                                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                  {formatDate(transfer.completedAt)}
                                </span>
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
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewTransfer(transfer)}
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          
                          {transfer.status === 'pending' && (canEdit || canDelete) && (
                            <>
                              {canEdit && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditTransfer(transfer)}
                                  title="Edit Transfer"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                              )}
                              
                              {canDelete && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelTransfer(transfer)}
                                  disabled={isDeleting}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                                  title="Cancel Transfer"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
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
