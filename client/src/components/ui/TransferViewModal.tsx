import React from "react";
import { XMarkIcon, ArrowRightIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "./Button";
import { formatNumber, formatDate } from "../../lib/utils";
import type { Transfer } from "../../types";

interface TransferWithDetails extends Omit<Transfer, 'product' | 'fromBranch' | 'toBranch' | 'createdBy' | 'completedBy'> {
  product: {
    _id: string;
    name: string;
    sku: string;
    unit: string;
    price: number;
    category: string;
    brand?: string;
  };
  fromBranch: {
    _id: string;
    name: string;
    address?: string;
  };
  toBranch: {
    _id: string;
    name: string;
    address?: string;
  };
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
}

interface TransferViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: TransferWithDetails | null;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <ClockIcon className="h-4 w-4" />;
    case 'completed':
      return <CheckCircleIcon className="h-4 w-4" />;
    case 'cancelled':
      return <XCircleIcon className="h-4 w-4" />;
    default:
      return <ClockIcon className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

export const TransferViewModal: React.FC<TransferViewModalProps> = ({
  isOpen,
  onClose,
  transfer,
}) => {
  if (!isOpen || !transfer) return null;

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
                Transfer Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View transfer information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Product Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Product Name:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {transfer.product?.name || 'Unknown Product'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">SKU:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {transfer.product?.sku || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Category:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {transfer.product?.category || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Brand:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {transfer.product?.brand || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Transfer Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Transfer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Quantity:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatNumber(transfer.quantity)} {transfer.product?.unit || 'units'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(transfer.status)}`}>
                    {getStatusIcon(transfer.status)}
                    <span className="capitalize">{transfer.status}</span>
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">From Branch:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {transfer.fromBranch?.name || 'Unknown Branch'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">To Branch:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {transfer.toBranch?.name || 'Unknown Branch'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Reason:</span>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {transfer.reason.replace('_', ' ')}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Created By:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {transfer.createdBy?.name || 'Unknown User'}
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Created:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(transfer.createdAt)}
                </p>
              </div>
              {transfer.completedAt && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Completed:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(transfer.completedAt)}
                  </p>
                </div>
              )}
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Last Updated:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(transfer.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {transfer.notes && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Notes
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {transfer.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
