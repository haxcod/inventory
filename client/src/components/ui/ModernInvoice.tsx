import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PrinterIcon, ArrowDownTrayIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import type { Invoice, Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

// QR Code Display Component
function QRCodeDisplay({ invoiceNumber }: { invoiceNumber: string }) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(invoiceNumber, {
      width: 60,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then(setQrCodeDataURL);
  }, [invoiceNumber]);

  if (!qrCodeDataURL) return <div className="w-full h-full bg-gray-200 animate-pulse rounded"></div>;

  return <img src={qrCodeDataURL} alt="QR Code" className="w-full h-full" />;
}

interface ModernInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  products: Product[];
}

export function ModernInvoice({ isOpen, onClose, invoice, products }: ModernInvoiceProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = async () => {
    setIsPrinting(true);
    
    try {
      // Generate QR code for print
      const qrCodeDataURL = await QRCode.toDataURL(invoice.invoiceNumber.toString(), {
        width: 100,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Create a temporary element with QR code
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; z-index: 9999;">
          <img src="${qrCodeDataURL}" alt="QR Code" style="width: 80px; height: 80px;" />
          <p style="font-size: 10px; text-align: center; margin: 5px 0;">Invoice QR Code</p>
        </div>
      `;
      document.body.appendChild(tempDiv);
      
      // Print
      window.print();
      
      // Remove temporary element
      document.body.removeChild(tempDiv);
      
    } catch (error) {
      console.error('Error generating QR code for print:', error);
      window.print(); // Fallback to regular print
    } finally {
      setTimeout(() => setIsPrinting(false), 1000);
    }
  };

  const handleDownload = async () => {
    if (!invoiceRef.current) return;
    
    setIsGeneratingPDF(true);
    
    try {
      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(invoice.invoiceNumber.toString(), {
        width: 100,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add QR code to PDF
      pdf.addImage(qrCodeDataURL, 'PNG', pageWidth - 30, 20, 20, 20);
      
      // Add invoice header
      pdf.setFontSize(24);
      pdf.setTextColor(59, 130, 246); // Blue color
      pdf.text('INVOICE', 20, 30);
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 40);
      pdf.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, 45);
      pdf.text(`Status: ${invoice.paymentStatus.toUpperCase()}`, 20, 50);
      
      // Company info
      pdf.setFontSize(14);
      pdf.text('InventoryPro', 20, 70);
      pdf.setFontSize(10);
      pdf.text('123 Business Street', 20, 75);
      pdf.text('City, State 12345', 20, 80);
      pdf.text('Phone: +1 (555) 123-4567', 20, 85);
      pdf.text('Email: info@inventorypro.com', 20, 90);
      
      // Customer info
      pdf.setFontSize(14);
      pdf.text('Bill To:', 120, 70);
      pdf.setFontSize(10);
      pdf.text(invoice.customer?.name || 'Walk-in Customer', 120, 75);
      if (invoice.customer?.email) pdf.text(invoice.customer.email, 120, 80);
      if (invoice.customer?.phone) pdf.text(invoice.customer.phone, 120, 85);
      if (invoice.customer?.address) pdf.text(invoice.customer.address, 120, 90);
      
      // Items table
      let yPosition = 110;
      pdf.setFontSize(12);
      pdf.text('Items', 20, yPosition);
      yPosition += 10;
      
      // Table headers
      pdf.setFontSize(10);
      pdf.text('Item', 20, yPosition);
      pdf.text('Qty', 80, yPosition);
      pdf.text('Price', 100, yPosition);
      pdf.text('Total', 140, yPosition);
      yPosition += 5;
      
      // Draw line
      pdf.line(20, yPosition, 180, yPosition);
      yPosition += 10;
      
      // Table rows
      invoice.items.forEach((item) => {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.text(typeof item.product === 'string' ? item.product : item.product.name, 20, yPosition);
        pdf.text(item.quantity.toString(), 80, yPosition);
        pdf.text(formatCurrency(item.price), 100, yPosition);
        pdf.text(formatCurrency(item.total), 140, yPosition);
        yPosition += 8;
      });
      
      // Totals
      yPosition += 10;
      pdf.line(20, yPosition, 180, yPosition);
      yPosition += 10;
      
      const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.12;
      const total = subtotal + tax;
      
      pdf.text(`Subtotal: ${formatCurrency(subtotal)}`, 120, yPosition);
      yPosition += 8;
      pdf.text(`Tax (12%): ${formatCurrency(tax)}`, 120, yPosition);
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.text(`Total: ${formatCurrency(total)}`, 120, yPosition);
      
      // Payment method
      yPosition += 15;
      pdf.setFontSize(10);
      pdf.text(`Payment Method: ${invoice.paymentMethod.toUpperCase()}`, 20, yPosition);
      
      // Notes
      if (invoice.notes) {
        yPosition += 15;
        pdf.text('Notes:', 20, yPosition);
        yPosition += 8;
        pdf.text(invoice.notes, 20, yPosition);
      }
      
      // Footer
      pdf.setFontSize(8);
      pdf.text('Thank you for your business!', 20, pageHeight - 20);
      pdf.text('Generated by InventoryPro', pageWidth - 60, pageHeight - 20);
      
      // Save PDF
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = () => {
    // TODO: Implement sharing functionality
    console.log('Sharing invoice...');
  };

  const getProductDetails = (productName: string | Product) => {
    if (typeof productName === 'string') {
      return products.find(p => p.name === productName) || null;
    }
    return productName;
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.12; // 12% tax
  const total = subtotal + tax;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-lg p-4">
      <div ref={invoiceRef} className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Invoice</h1>
              <p className="text-blue-100">#{invoice.invoiceNumber}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-blue-100">QR Code</p>
                <div className="w-16 h-16 bg-white rounded-lg p-2">
                  <QRCodeDisplay invoiceNumber={invoice.invoiceNumber} />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <XMarkIcon className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Company & Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">From</h3>
              <div className="space-y-2">
                <p className="text-xl font-bold text-gray-900 dark:text-white">InventoryPro</p>
                <p className="text-gray-600 dark:text-gray-300">123 Business Street</p>
                <p className="text-gray-600 dark:text-gray-300">City, State 12345</p>
                <p className="text-gray-600 dark:text-gray-300">Phone: +1 (555) 123-4567</p>
                <p className="text-gray-600 dark:text-gray-300">Email: info@inventorypro.com</p>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bill To</h3>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {invoice.customer?.name || 'Walk-in Customer'}
                </p>
                {invoice.customer?.email && (
                  <p className="text-gray-600 dark:text-gray-300">{invoice.customer.email}</p>
                )}
                {invoice.customer?.phone && (
                  <p className="text-gray-600 dark:text-gray-300">{invoice.customer.phone}</p>
                )}
                {invoice.customer?.address && (
                  <p className="text-gray-600 dark:text-gray-300">{invoice.customer.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Invoice Date</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(invoice.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Payment Method</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {invoice.paymentMethod.replace('_', ' ')}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                invoice.paymentStatus === 'paid' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {invoice.paymentStatus.charAt(0).toUpperCase() + invoice.paymentStatus.slice(1)}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Item</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Description</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Qty</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => {
                    const product = getProductDetails(item.product);
                    return (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900 dark:text-white">{typeof item.product === 'string' ? item.product : item.product.name}</div>
                          {product?.sku && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                          {product?.description || 'No description'}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{formatCurrency(item.price)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-sm">
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-300">Tax (12%):</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-gray-200 dark:border-gray-600">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h4>
              <p className="text-gray-600 dark:text-gray-300">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-wrap gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </Button>
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PrinterIcon className="h-4 w-4" />
            {isPrinting ? 'Printing...' : 'Print'}
          </Button>
        </div>
      </div>
    </div>
  );
}
