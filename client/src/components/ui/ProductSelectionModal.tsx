import React, { useState, useEffect } from "react";
import { XMarkIcon, MagnifyingGlassIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Button } from "./Button";
import { Input } from "./Input";
import { Label } from "./Label";
import type { Product } from "../../types";
import { formatCurrency, formatNumber } from "../../lib/utils";

interface ProductSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onProductSelect: (product: Product) => void;
}

export const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
  isOpen,
  onClose,
  products,
  onProductSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState("");


  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
    onClose();
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      (product.brand && product.brand.toLowerCase().includes(searchLower))
    );
  });

  // Only show products with stock > 0
  const availableProducts = filteredProducts.filter(product => product.stock > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <ArrowRightIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Select Product to Transfer
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose a product to transfer between branches
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <Label htmlFor="search" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Search Products
          </Label>
          <div className="relative mt-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by name, SKU, category, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products List */}
        <div className="p-6">
          {availableProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <ArrowRightIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No products found' : 'No products available'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm 
                  ? 'Try adjusting your search terms.' 
                  : 'No products with available stock found.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableProducts.map((product) => (
                <div
                  key={product._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600"
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {product.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {product.sku}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="font-medium">{product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Brand:</span>
                      <span className="font-medium">{product.brand || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-medium">{formatCurrency(product.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stock:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {formatNumber(product.stock)} {product.unit}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <ArrowRightIcon className="h-4 w-4 mr-1" />
                      Transfer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
