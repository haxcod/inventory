import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import type { Product, Branch } from '../../types';
import { formatCurrency } from '../../lib/utils';
import apiService from '../../lib/api';

interface ProductTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onTransfer: (transferData: TransferData) => Promise<void>;
}

interface TransferData {
  productId: string;
  fromBranch: string;
  toBranch: string;
  quantity: number;
  reason: string;
  notes?: string;
}

export const ProductTransferModal: React.FC<ProductTransferModalProps> = ({
  isOpen,
  onClose,
  product,
  onTransfer,
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [transferData, setTransferData] = useState<TransferData>({
    productId: '',
    fromBranch: '',
    toBranch: '',
    quantity: 1,
    reason: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setTransferData({
        productId: product._id,
        fromBranch: product.branch,
        toBranch: '',
        quantity: 1,
        reason: '',
        notes: '',
      });
      fetchBranches();
    }
  }, [isOpen, product]);

  const fetchBranches = async () => {
    try {
      // Real API call
      const response = await apiService.branches.getAll();
      if (response.data.success) {
        setBranches(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch branches');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || transferData.quantity <= 0 || transferData.quantity > product.stock) {
      return;
    }

    setIsLoading(true);
    try {
      await onTransfer(transferData);
      onClose();
    } catch (error) {
      console.error('Error transferring product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  const availableBranches = branches.filter(branch => branch._id !== product.branch);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <ArrowRightIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Transfer Product
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Move product between branches
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">SKU:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {product.sku}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Current Stock:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {product.stock} {product.unit}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Price:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {formatCurrency(product.price)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Current Branch:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {branches.find(b => b._id === product.branch)?.name || product.branch}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From Branch */}
            <div>
              <Label htmlFor="fromBranch" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                From Branch
              </Label>
              <select
                id="fromBranch"
                value={transferData.fromBranch}
                onChange={(e) => setTransferData(prev => ({ ...prev, fromBranch: e.target.value }))}
                disabled
                className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
              >
                <option value={product.branch}>
                  {branches.find(b => b._id === product.branch)?.name || product.branch}
                </option>
              </select>
            </div>

            {/* To Branch */}
            <div>
              <Label htmlFor="toBranch" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                To Branch *
              </Label>
              <select
                id="toBranch"
                value={transferData.toBranch}
                onChange={(e) => setTransferData(prev => ({ ...prev, toBranch: e.target.value }))}
                required
                className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select destination branch</option>
                {availableBranches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quantity */}
            <div>
              <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Quantity *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.stock}
                value={transferData.quantity}
                onChange={(e) => setTransferData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                required
                className="mt-2"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Available: {product.stock} {product.unit}
              </p>
            </div>

            {/* Reason */}
            <div>
              <Label htmlFor="reason" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Reason *
              </Label>
              <select
                id="reason"
                value={transferData.reason}
                onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
                required
                className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select reason</option>
                <option value="restock">Restock</option>
                <option value="demand">High Demand</option>
                <option value="rebalance">Stock Rebalancing</option>
                <option value="emergency">Emergency Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Notes
            </Label>
            <textarea
              id="notes"
              value={transferData.notes}
              onChange={(e) => setTransferData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this transfer..."
              className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !transferData.toBranch || !transferData.reason || transferData.quantity <= 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Transferring...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ArrowRightIcon className="h-4 w-4" />
                  Transfer Product
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
