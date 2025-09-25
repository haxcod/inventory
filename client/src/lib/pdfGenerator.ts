import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import type { Invoice, Product, Branch, User } from '../types';

interface InvoiceWithDetails extends Omit<Invoice, 'items' | 'branch' | 'createdBy'> {
  items: Array<{
    product: Product;
    quantity: number;
    price: number;
    discount: number;
    total: number;
  }>;
  branch: Branch;
  createdBy: User;
}

export class ModernPDFGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private colors = {
    primary: { r: 37, g: 99, b: 235 },      // Modern blue
    success: { r: 16, g: 185, b: 129 },     // Green
    warning: { r: 245, g: 101, b: 101 },    // Orange-red
    gray: { r: 107, g: 114, b: 128 },       // Gray
    lightGray: { r: 249, g: 250, b: 251 },  // Very light gray
    darkGray: { r: 55, g: 65, b: 81 },      // Dark gray
    white: { r: 255, g: 255, b: 255 }
  };

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.getWidth(); // 210mm
    this.pageHeight = this.pdf.internal.pageSize.getHeight(); // 297mm
    this.margin = 15;
    this.currentY = this.margin;
  }

  private async addHeader(invoice: InvoiceWithDetails) {
    // Modern header with gradient-like effect using overlapping rectangles
    this.pdf.setFillColor(this.colors.primary.r, this.colors.primary.g, this.colors.primary.b);
    this.pdf.rect(0, 0, this.pageWidth, 50, 'F');
    
    // Company branding section
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(28);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('InventoryPro', this.margin, 25);
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Professional Inventory Management', this.margin, 35);
    
    // Invoice number - right side
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    const invoiceNumberText = `#${invoice.invoiceNumber}`;
    const invoiceNumberWidth = this.pdf.getTextWidth(invoiceNumberText);
    this.pdf.text(invoiceNumberText, this.pageWidth - this.margin - invoiceNumberWidth, 30);
    
    // Invoice title - right aligned
    this.pdf.setFontSize(36);
    this.pdf.setFont('helvetica', 'bold');
    const invoiceWidth = this.pdf.getTextWidth('INVOICE');
    this.pdf.text('INVOICE', this.pageWidth - this.margin - invoiceWidth, 45);
    
    this.currentY = 65;
  }


  private async addCompanyInfo(invoice: InvoiceWithDetails) {
    const leftColX = this.margin;
    const rightColX = this.pageWidth / 2 + 10;
    const sectionY = this.currentY;
    
    // QR Code positioned on the left side
    try {
      const qrData = {
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        date: invoice.createdAt,
        status: invoice.paymentStatus
      };
      
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 80,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // QR Code positioned on the left side
      const qrX = leftColX;
      const qrY = sectionY;
      
      // QR Code background (white)
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.roundedRect(qrX, qrY, 30, 30, 2, 2, 'F');
      
      // Add QR code
      this.pdf.addImage(qrCodeDataURL, 'PNG', qrX + 2, qrY + 2, 26, 26);
      
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
    
    // From section - positioned to the right of QR code
    const fromX = leftColX + 40; // Position to the right of QR code
    const fromWidth = 80; // Width for FROM section
    this.pdf.setTextColor(this.colors.darkGray.r, this.colors.darkGray.g, this.colors.darkGray.b);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    const fromText = 'FROM';
    const fromTextWidth = this.pdf.getTextWidth(fromText);
    this.pdf.text(fromText, fromX + fromWidth - fromTextWidth, sectionY);
    
    // Underline
    this.pdf.setDrawColor(this.colors.primary.r, this.colors.primary.g, this.colors.primary.b);
    this.pdf.setLineWidth(2);
    this.pdf.line(fromX + fromWidth - fromTextWidth, sectionY + 2, fromX + fromWidth, sectionY + 2);
    
    let fromY = sectionY + 12;
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    const branchNameWidth = this.pdf.getTextWidth(invoice.branch.name);
    this.pdf.text(invoice.branch.name, fromX + fromWidth - branchNameWidth, fromY);
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(this.colors.gray.r, this.colors.gray.g, this.colors.gray.b);
    
    if (invoice.branch.address) {
      fromY += 6;
      const addressLines = this.pdf.splitTextToSize(invoice.branch.address, fromWidth);
      addressLines.forEach((line: string) => {
        const lineWidth = this.pdf.getTextWidth(line);
        this.pdf.text(line, fromX + fromWidth - lineWidth, fromY);
        fromY += 5;
      });
    }
    
    if (invoice.branch.phone) {
      fromY += 4;
      const phoneText = `Phone: ${invoice.branch.phone}`;
      const phoneWidth = this.pdf.getTextWidth(phoneText);
      this.pdf.text(phoneText, fromX + fromWidth - phoneWidth, fromY);
    }
    
    if (invoice.branch.email) {
      fromY += 6;
      const emailText = `Email: ${invoice.branch.email}`;
      const emailWidth = this.pdf.getTextWidth(emailText);
      this.pdf.text(emailText, fromX + fromWidth - emailWidth, fromY);
    }
    
    // Bill To section
    const billToWidth = 80; // Width for BILL TO section
    this.pdf.setTextColor(this.colors.darkGray.r, this.colors.darkGray.g, this.colors.darkGray.b);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    const billToText = 'BILL TO';
    const billToTextWidth = this.pdf.getTextWidth(billToText);
    this.pdf.text(billToText, rightColX + billToWidth - billToTextWidth, sectionY);
    
    // Underline
    this.pdf.setDrawColor(this.colors.primary.r, this.colors.primary.g, this.colors.primary.b);
    this.pdf.setLineWidth(2);
    this.pdf.line(rightColX + billToWidth - billToTextWidth, sectionY + 2, rightColX + billToWidth, sectionY + 2);
    
    let billToY = sectionY + 12;
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    const customerName = invoice.customer?.name || 'Walk-in Customer';
    const customerNameWidth = this.pdf.getTextWidth(customerName);
    this.pdf.text(customerName, rightColX + billToWidth - customerNameWidth, billToY);
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(this.colors.gray.r, this.colors.gray.g, this.colors.gray.b);
    
    if (invoice.customer?.email) {
      billToY += 6;
      const emailText = `Email: ${invoice.customer.email}`;
      const emailWidth = this.pdf.getTextWidth(emailText);
      this.pdf.text(emailText, rightColX + billToWidth - emailWidth, billToY);
    }
    
    if (invoice.customer?.phone) {
      billToY += 6;
      const phoneText = `Phone: ${invoice.customer.phone}`;
      const phoneWidth = this.pdf.getTextWidth(phoneText);
      this.pdf.text(phoneText, rightColX + billToWidth - phoneWidth, billToY);
    }
    
    if (invoice.customer?.address) {
      billToY += 6;
      const addressLines = this.pdf.splitTextToSize(invoice.customer.address, billToWidth);
      addressLines.forEach((line: string) => {
        const lineWidth = this.pdf.getTextWidth(line);
        this.pdf.text(line, rightColX + billToWidth - lineWidth, billToY);
        billToY += 5;
      });
    }
    
    this.currentY = Math.max(fromY, billToY) + 20; // Reduced spacing for A4
  }

  private addItemsTable(invoice: InvoiceWithDetails) {
    const tableStartY = this.currentY;
    const rowHeight = 16; // Reduced from 20 for better A4 fit
    const headerHeight = 12; // Reduced from 15
    
    // Table header with modern gradient effect
    this.pdf.setFillColor(this.colors.darkGray.r, this.colors.darkGray.g, this.colors.darkGray.b);
    this.pdf.rect(this.margin, tableStartY, this.pageWidth - (2 * this.margin), headerHeight, 'F');
    
    // Column widths and positions (responsive)
    const totalWidth = this.pageWidth - (2 * this.margin);
    const colWidths = [
      totalWidth * 0.4,   // Description - 40%
      totalWidth * 0.12,  // Qty - 12%
      totalWidth * 0.16,  // Rate - 16%
      totalWidth * 0.16,  // Discount - 16%
      totalWidth * 0.16   // Amount - 16%
    ];
    
    let colX = this.margin;
    const colPositions = [colX];
    for (let i = 0; i < colWidths.length - 1; i++) {
      colX += colWidths[i];
      colPositions.push(colX);
    }
    
    // Header text
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'bold');
    
    this.pdf.text('DESCRIPTION', colPositions[0] + 5, tableStartY + 10);
    this.pdf.text('QTY', colPositions[1] + 5, tableStartY + 10);
    this.pdf.text('RATE', colPositions[2] + 5, tableStartY + 10);
    this.pdf.text('DISCOUNT', colPositions[3] + 5, tableStartY + 10);
    this.pdf.text('AMOUNT', colPositions[4] + 5, tableStartY + 10);
    
    this.currentY = tableStartY + headerHeight;
    
    // Table rows
    invoice.items.forEach((item, index) => {
      const isEven = index % 2 === 0;
      
      // Alternating row colors
      if (isEven) {
        this.pdf.setFillColor(this.colors.lightGray.r, this.colors.lightGray.g, this.colors.lightGray.b);
        this.pdf.rect(this.margin, this.currentY, this.pageWidth - (2 * this.margin), rowHeight, 'F');
      }
      
      // Row border
      this.pdf.setDrawColor(230, 230, 230);
      this.pdf.setLineWidth(0.2);
      this.pdf.line(this.margin, this.currentY + rowHeight, this.pageWidth - this.margin, this.currentY + rowHeight);
      
      this.pdf.setTextColor(this.colors.darkGray.r, this.colors.darkGray.g, this.colors.darkGray.b);
      
      // Product name (with text wrapping)
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      const productNameLines = this.pdf.splitTextToSize(item.product.name, colWidths[0] - 10);
      this.pdf.text(productNameLines[0], colPositions[0] + 5, this.currentY + 8);
      
      // SKU
      if (item.product.sku) {
        this.pdf.setFontSize(9);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.gray.r, this.colors.gray.g, this.colors.gray.b);
        this.pdf.text(`SKU: ${item.product.sku}`, colPositions[0] + 5, this.currentY + 14);
      }
      
      // Reset color for other columns
      this.pdf.setTextColor(this.colors.darkGray.r, this.colors.darkGray.g, this.colors.darkGray.b);
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      
      // Center-align quantity
      const qtyText = item.quantity.toString();
      const qtyWidth = this.pdf.getTextWidth(qtyText);
      this.pdf.text(qtyText, colPositions[1] + (colWidths[1] - qtyWidth) / 2, this.currentY + 10);
      
      // Right-align monetary values
      const rateText = `Rs.${item.price.toFixed(2)}`;
      const rateWidth = this.pdf.getTextWidth(rateText);
      this.pdf.text(rateText, colPositions[2] + colWidths[2] - rateWidth - 5, this.currentY + 10);
      
      const discountText = `Rs.${item.discount.toFixed(2)}`;
      const discountWidth = this.pdf.getTextWidth(discountText);
      this.pdf.text(discountText, colPositions[3] + colWidths[3] - discountWidth - 5, this.currentY + 10);
      
      const totalText = `Rs.${item.total.toFixed(2)}`;
      const totalWidth = this.pdf.getTextWidth(totalText);
      this.pdf.text(totalText, colPositions[4] + colWidths[4] - totalWidth - 5, this.currentY + 10);
      
      this.currentY += rowHeight;
    });
    
    // Table border
    this.pdf.setDrawColor(this.colors.gray.r, this.colors.gray.g, this.colors.gray.b);
    this.pdf.setLineWidth(1);
    this.pdf.rect(this.margin, tableStartY, this.pageWidth - (2 * this.margin), this.currentY - tableStartY);
    
    this.currentY += 15; // Reduced spacing for A4
  }

  private addTotals(invoice: InvoiceWithDetails) {
    const totalsWidth = 120; // Increased width for better formatting
    const totalsX = this.pageWidth - this.margin - totalsWidth;
    const totalsY = this.currentY;
    
    // Calculate totals
    const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 0.12; // 12% tax
    const tax = subtotal * taxRate;
    const discountAmount = invoice.discount || 0;
    const total = subtotal + tax - discountAmount;
    
     // Modern totals card
     this.pdf.setFillColor(this.colors.white.r, this.colors.white.g, this.colors.white.b);
     this.pdf.roundedRect(totalsX, totalsY, totalsWidth, 60, 5, 5, 'F');
     
     // Card border
     this.pdf.setDrawColor(this.colors.primary.r, this.colors.primary.g, this.colors.primary.b);
     this.pdf.setLineWidth(2);
     this.pdf.roundedRect(totalsX, totalsY, totalsWidth, 60, 5, 5, 'S');
    
    this.pdf.setTextColor(this.colors.darkGray.r, this.colors.darkGray.g, this.colors.darkGray.b);
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    let rowY = totalsY + 15;
    
    // Subtotal
    this.pdf.text('Subtotal:', totalsX + 10, rowY);
    const subtotalText = `Rs.${subtotal.toFixed(2)}`;
    const subtotalWidth = this.pdf.getTextWidth(subtotalText);
    this.pdf.text(subtotalText, totalsX + totalsWidth - subtotalWidth - 10, rowY);
    
    rowY += 10;
    
    // Tax
    this.pdf.text(`Tax (${(taxRate * 100)}%):`, totalsX + 10, rowY);
    const taxText = `Rs.${tax.toFixed(2)}`;
    const taxWidth = this.pdf.getTextWidth(taxText);
    this.pdf.text(taxText, totalsX + totalsWidth - taxWidth - 10, rowY);
    
    rowY += 10;
    
    // Discount (if applicable)
    if (discountAmount > 0) {
      this.pdf.text('Discount:', totalsX + 10, rowY);
      const discountText = `-Rs.${discountAmount.toFixed(2)}`;
      const discountWidth = this.pdf.getTextWidth(discountText);
      this.pdf.text(discountText, totalsX + totalsWidth - discountWidth - 10, rowY);
      rowY += 10;
    }
    
    // Separator line
    this.pdf.setDrawColor(this.colors.gray.r, this.colors.gray.g, this.colors.gray.b);
    this.pdf.setLineWidth(1);
    this.pdf.line(totalsX + 10, rowY + 2, totalsX + totalsWidth - 10, rowY + 2);
    
    rowY += 12;
    
    // Total
    this.pdf.setFillColor(this.colors.primary.r, this.colors.primary.g, this.colors.primary.b);
    this.pdf.rect(totalsX + 5, rowY - 8, totalsWidth - 10, 18, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('TOTAL:', totalsX + 10, rowY);
    
    const totalText = `Rs.${total.toFixed(2)}`;
    const totalTextWidth = this.pdf.getTextWidth(totalText);
    this.pdf.text(totalText, totalsX + totalsWidth - totalTextWidth - 10, rowY);
    
     this.currentY = totalsY + 70; // Increased height for better fit
  }


  private addFooter(invoice: InvoiceWithDetails) {
    // Reserve space for footer at bottom of A4 page
    const footerY = this.pageHeight - 35; // 35mm from bottom
    const footerContentY = this.pageHeight - 25; // 25mm from bottom for content
    
    // Ensure we don't overlap with existing content
    if (this.currentY > footerY - 20) {
      this.currentY = footerY - 20; // Move content up if too close to footer
    }
    
    // Notes section (only if there's space)
    if (invoice.notes && this.currentY < footerY - 30) {
      this.pdf.setTextColor(this.colors.darkGray.r, this.colors.darkGray.g, this.colors.darkGray.b);
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Notes:', this.margin, this.currentY);
      
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.gray.r, this.colors.gray.g, this.colors.gray.b);
      
      const notesLines = this.pdf.splitTextToSize(invoice.notes, this.pageWidth - (2 * this.margin));
      this.pdf.text(notesLines, this.margin, this.currentY + 6);
      
      this.currentY += notesLines.length * 4 + 12;
    }
    
    // Footer separator line
    this.pdf.setDrawColor(this.colors.primary.r, this.colors.primary.g, this.colors.primary.b);
    this.pdf.setLineWidth(1);
    this.pdf.line(this.margin, footerY - 10, this.pageWidth - this.margin, footerY - 10);
    
    // Footer content
    this.pdf.setTextColor(this.colors.gray.r, this.colors.gray.g, this.colors.gray.b);
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    
    this.pdf.text('Thank you for your business!', this.margin, footerContentY);
    
    const generatedText = `Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })}`;
    const generatedWidth = this.pdf.getTextWidth(generatedText);
    this.pdf.text(generatedText, this.pageWidth - this.margin - generatedWidth, footerContentY);
  }

  private checkPageFit() {
    // Check if current content fits within A4 page
    const availableHeight = this.pageHeight - this.margin - 50; // Reserve 50mm for footer
    const contentHeight = this.currentY - this.margin;
    
    if (contentHeight > availableHeight) {
      console.warn('Content exceeds A4 page height, adjusting layout...');
      // Reduce spacing or font sizes if needed
      return false;
    }
    return true;
  }

  async generatePDF(invoice: InvoiceWithDetails): Promise<Blob> {
    try {
      // Reset position
      this.currentY = this.margin;
      
      // Add all sections with proper spacing
      await this.addHeader(invoice);
      await this.addCompanyInfo(invoice);
      
      // Check if we have enough space for items table
      if (!this.checkPageFit()) {
        console.log('Adjusting layout for A4 constraints...');
      }
      
      this.addItemsTable(invoice);
      
      // Check space before totals
      if (!this.checkPageFit()) {
        console.log('Content approaching page limit, adjusting...');
      }
      
      this.addTotals(invoice);
      
      // Add footer
      this.addFooter(invoice);
      
      return this.pdf.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  async downloadPDF(invoice: InvoiceWithDetails, filename?: string) {
    try {
      const pdfBlob = await this.generatePDF(invoice);
      
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `invoice-${invoice.invoiceNumber}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw new Error('Failed to download PDF');
    }
  }

  async printPDF(invoice: InvoiceWithDetails) {
    try {
      const pdfBlob = await this.generatePDF(invoice);
      
      const url = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Error printing PDF:', error);
      throw new Error('Failed to print PDF');
    }
  }
}

// Export utility functions
export const generateInvoicePDF = async (invoice: InvoiceWithDetails): Promise<Blob> => {
  const generator = new ModernPDFGenerator();
  return generator.generatePDF(invoice);
};

export const downloadInvoicePDF = async (invoice: InvoiceWithDetails, filename?: string) => {
  const generator = new ModernPDFGenerator();
  return generator.downloadPDF(invoice, filename);
};

export const printInvoicePDF = async (invoice: InvoiceWithDetails) => {
  const generator = new ModernPDFGenerator();
  return generator.printPDF(invoice);
};