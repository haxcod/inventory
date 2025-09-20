import React, { useState, useEffect, useCallback } from "react";
import { XMarkIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Button } from "./Button";
import { Input } from "./Input";
import { Label } from "./Label";
import type { Product, Branch } from "../../types";
import { formatCurrency } from "../../lib/utils";
import apiService from "../../lib/api";

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

const TRANSFER_REASONS = [
  { value: "restock", label: "Restock" },
  { value: "demand", label: "High Demand" },
  { value: "rebalance", label: "Stock Rebalancing" },
  { value: "emergency", label: "Emergency Transfer" },
  { value: "other", label: "Other" },
];

export const ProductTransferModal: React.FC<ProductTransferModalProps> = ({
  isOpen,
  onClose,
  product,
  onTransfer,
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [transferData, setTransferData] = useState<TransferData>({
    productId: "",
    fromBranch: "",
    toBranch: "",
    quantity: 1,
    reason: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const fetchBranches = useCallback(async () => {
    setBranchesLoading(true);
    setError(null);
    try {
      const response = await apiService.branches.getAll();
      if (response.data?.success) {
        const branchData = response.data.data.branches;

        // Ensure we always set an array
        const branchArray = Array.isArray(branchData) ? branchData : [];
        setBranches(branchArray);
      } else {
        throw new Error(response.data?.message || "Failed to fetch branches");
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      setError("Failed to load branches. Please try again.");
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && product) {
      const branchId = getBranchId(product.branch);
      setTransferData({
        productId: product._id,
        fromBranch: branchId,
        toBranch: "",
        quantity: 1,
        reason: "",
        notes: "",
      });
      setError(null);
      fetchBranches();
    } else if (!isOpen) {
      // Reset state when modal closes
      setError(null);
      setBranches([]);
      setTransferData({
        productId: "",
        fromBranch: "",
        toBranch: "",
        quantity: 1,
        reason: "",
        notes: "",
      });
    }
  }, [isOpen, product, fetchBranches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) {
      setError("Product information is missing");
      return;
    }

    if (transferData.quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    if (transferData.quantity > product.stock) {
      setError(`Quantity cannot exceed available stock (${product.stock})`);
      return;
    }

    if (!transferData.toBranch) {
      setError("Please select a destination branch");
      return;
    }

    if (!transferData.reason) {
      setError("Please select a reason for transfer");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onTransfer(transferData);
      onClose();
    } catch (error) {
      console.error("Error transferring product:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to transfer product. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(numValue, product?.stock || 0));
    setTransferData((prev) => ({ ...prev, quantity: clampedValue }));
  };

  // Helper function to get branch ID from branch data
  const getBranchId = (branchData: string | any): string => {
    if (!branchData) return "";
    if (typeof branchData === "string") return branchData;
    if (typeof branchData === "object" && branchData._id) return branchData._id;
    return "";
  };
  const getBranchName = (branchData: string | any): string => {
    if (!branchData) return "Unknown Branch";

    // If branchData is already an object with a name property
    if (typeof branchData === "object" && branchData.name) {
      return String(branchData.name);
    }

    // If branchData is a string ID, find the branch in the array
    if (typeof branchData === "string") {
      // Ensure branches is an array before using find
      if (!Array.isArray(branches)) return String(branchData);
      const branch = branches.find((b) => b && b._id === branchData);
      return branch && typeof branch.name === "string"
        ? branch.name
        : String(branchData);
    }

    return "Unknown Branch";
  };

  if (!isOpen || !product) return null;

  // Ensure branches is always an array before filtering
  const branchesArray = Array.isArray(branches) ? branches : [];
  const productBranchId = getBranchId(product.branch);
  const availableBranches = branchesArray.filter(
    (branch) => branch && branch._id !== productBranchId
  );
  const fromBranchName = getBranchName(product.branch);
  const isFormValid =
    transferData.toBranch &&
    transferData.reason &&
    transferData.quantity > 0 &&
    transferData.quantity <= product.stock;

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
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {String(product.name || "Unknown Product")}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">SKU:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {String(product.sku || "")}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Current Stock:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {String(product.stock)} {String(product.unit || "")}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Price:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {formatCurrency(product.price)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Current Branch:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {String(fromBranchName)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-6">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Transfer Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From Branch */}
            <div>
              <Label
                htmlFor="fromBranch"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                From Branch
              </Label>
              <select
                id="fromBranch"
                value={transferData.fromBranch}
                disabled
                className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                aria-describedby="fromBranch-help"
              >
                <option value={productBranchId}>
                  {String(fromBranchName)}
                </option>
              </select>
              <p
                id="fromBranch-help"
                className="text-xs text-gray-500 dark:text-gray-400 mt-1"
              >
                Current location of the product
              </p>
            </div>

            {/* To Branch */}
            <div>
              <Label
                htmlFor="toBranch"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                To Branch *
              </Label>
              <select
                id="toBranch"
                value={transferData.toBranch}
                onChange={(e) =>
                  setTransferData((prev) => ({
                    ...prev,
                    toBranch: e.target.value,
                  }))
                }
                required
                disabled={branchesLoading || isLoading}
                className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                aria-describedby="toBranch-help"
              >
                <option value="">
                  {branchesLoading
                    ? "Loading branches..."
                    : "Select destination branch"}
                </option>
                {availableBranches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <p
                id="toBranch-help"
                className="text-xs text-gray-500 dark:text-gray-400 mt-1"
              >
                {availableBranches.length === 0 && !branchesLoading
                  ? "No other branches available"
                  : "Choose where to transfer the product"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quantity */}
            <div>
              <Label
                htmlFor="quantity"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Quantity *
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.stock}
                value={transferData.quantity.toString()}
                onChange={(e) => handleQuantityChange(e.target.value)}
                required
                disabled={isLoading}
                className="mt-2"
                aria-describedby="quantity-help"
              />
              <p
                id="quantity-help"
                className="text-xs text-gray-500 dark:text-gray-400 mt-1"
              >
                Available: {String(product.stock)} {String(product.unit || "")}
              </p>
            </div>

            {/* Reason */}
            <div>
              <Label
                htmlFor="reason"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Reason *
              </Label>
              <select
                id="reason"
                value={transferData.reason}
                onChange={(e) =>
                  setTransferData((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                required
                disabled={isLoading}
                className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                aria-describedby="reason-help"
              >
                <option value="">Select reason</option>
                {TRANSFER_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
              <p
                id="reason-help"
                className="text-xs text-gray-500 dark:text-gray-400 mt-1"
              >
                Why is this transfer needed?
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label
              htmlFor="notes"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300"
            >
              Notes
            </Label>
            <textarea
              id="notes"
              value={transferData.notes || ""}
              onChange={(e) =>
                setTransferData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Additional notes about this transfer..."
              disabled={isLoading}
              className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              rows={3}
              maxLength={500}
              aria-describedby="notes-help"
            />
            <p
              id="notes-help"
              className="text-xs text-gray-500 dark:text-gray-400 mt-1"
            >
              Optional: Add any additional details (max 500 characters)
            </p>
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
              disabled={isLoading || !isFormValid}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Transferring...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
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
