import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import type { SelectOption } from '../components/ui/Select';
import { formatCurrency } from '../lib/utils';
import { apiService } from '../lib/api';
import { useApi } from '../hooks/useApi';
import { 
  ChartBarIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [period, setPeriod] = useState('monthly');
  const [isExporting, setIsExporting] = useState(false);

  // Get the appropriate API function based on selected report type
  const getReportApiFunction = useMemo(() => {
    switch (selectedReport) {
      case 'sales':
        return apiService.reports.sales;
      case 'revenue':
        return apiService.reports.sales; // Revenue uses same endpoint as sales
      case 'profitLoss':
        return apiService.reports.profitLoss;
      case 'stock':
        return apiService.reports.stock;
      default:
        return apiService.reports.sales;
    }
  }, [selectedReport]);

  // Use API hook for reports
  const {
    data: reportDataResponse,
    loading: isLoading,
    error: reportsError,
    execute: fetchReports
  } = useApi(getReportApiFunction, {
    onSuccess: () => {
      console.log('Reports loaded successfully');
    },
    onError: (error: string) => {
      console.error('Failed to load reports:', error);
    }
  });

  // Extract the actual report data from the API response
  const reportData = reportDataResponse || null;
  
  // Debug: Log the report data to see what we're receiving
  console.log('Report data received:', reportData);

  const reportTypeOptions: SelectOption[] = [
    { value: 'sales', label: 'Sales Report' },
    { value: 'revenue', label: 'Revenue Report' },
    { value: 'profitLoss', label: 'Profit & Loss' },
    { value: 'stock', label: 'Stock Report' }
  ];

  const periodOptions: SelectOption[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  useEffect(() => {
    const params: Record<string, string> = {};
    
    // Add date range parameters for reports that support them
    if (['sales', 'revenue', 'profitLoss'].includes(selectedReport)) {
      if (dateRange.startDate) params.dateFrom = dateRange.startDate;
      if (dateRange.endDate) params.dateTo = dateRange.endDate;
      if (selectedReport === 'profitLoss') {
        if (dateRange.startDate) params.startDate = dateRange.startDate;
        if (dateRange.endDate) params.endDate = dateRange.endDate;
      }
    }
    
    // Add period parameter for sales/revenue reports
    if (['sales', 'revenue'].includes(selectedReport)) {
      params.period = period;
    }
    
    fetchReports(params);
  }, [selectedReport, period, dateRange, fetchReports]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Format month from YYYY-MM format
  const formatMonth = (monthString: string) => {
    if (!monthString) return '';
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      let worksheetData: Array<Record<string, string | number>> = [];
      let fileName = '';
      
      switch (selectedReport) {
        case 'sales':
        case 'revenue':
          worksheetData = (Array.isArray(reportData?.chartData) ? reportData?.chartData : []).map(item => ({
            'Date': formatDate(item.date),
            'Revenue': item.revenue,
            'Orders': item.count
          }));
          fileName = selectedReport === 'sales' ? 'Sales_Report' : 'Revenue_Report';
          break;
        case 'profitLoss':
          worksheetData = (Array.isArray(reportData?.chartData) ? reportData?.chartData : []).map(item => ({
            'Month': formatMonth(item.month),
            'Revenue': item.revenue,
            'Expenses': item.expenses,
            'Profit': item.profit
          }));
          fileName = 'Profit_Loss_Report';
          break;
        case 'stock':
          worksheetData = (Array.isArray(reportData?.categoryStats) ? reportData?.categoryStats : []).map(item => ({
            'Category': item.category,
            'Count': item.count,
            'Total Stock': item.totalStock,
            'Total Value': item.totalValue
          }));
          fileName = 'Stock_Report';
          break;
        default:
          worksheetData = [];
      }

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data');
      
      const timestamp = new Date().toISOString().split('T')[0];
      const finalFileName = `${fileName}_${timestamp}.xlsx`;
      
      XLSX.writeFile(workbook, finalFileName);
      
      console.log('Excel file exported successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const printReport = async () => {
    try {
      setIsExporting(true);
      
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to print the report.');
        return;
      }

      // Get summary data safely
      const summary = reportData?.summary || {};

      const printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${getReportTitle()} - ${new Date().toLocaleDateString()}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              color: black;
              line-height: 1.6;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #3B82F6;
              padding-bottom: 20px;
            }
            .print-header h1 {
              color: #3B82F6;
              margin: 0;
              font-size: 28px;
            }
            .print-header p {
              color: #666;
              margin: 5px 0 0 0;
              font-size: 16px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin: 20px 0;
            }
            .stat-item {
              text-align: center;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 8px;
              background: white;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #3B82F6;
            }
            .stat-label {
              color: #666;
              font-size: 14px;
              margin-top: 5px;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .data-table th,
            .data-table td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            .data-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .data-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>${getReportTitle()}</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Period: ${period.charAt(0).toUpperCase() + period.slice(1)}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">${formatCurrency(summary.totalRevenue || 0)}</div>
              <div class="stat-label">Total Revenue</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${summary.totalInvoices || summary.totalProducts || 0}</div>
              <div class="stat-label">${selectedReport === 'stock' ? 'Total Products' : 'Total Orders'}</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${formatCurrency(summary.netProfit || summary.averageOrderValue || 0)}</div>
              <div class="stat-label">${selectedReport === 'profitLoss' ? 'Net Profit' : 'Average Order Value'}</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${summary.profitMargin || summary.lowStockProducts || 0}${summary.profitMargin ? '%' : ''}</div>
              <div class="stat-label">${selectedReport === 'profitLoss' ? 'Profit Margin' : selectedReport === 'stock' ? 'Low Stock Items' : 'Growth Rate'}</div>
            </div>
          </div>

          ${generateReportTable()}
        </body>
        </html>
      `;

      printWindow.document.write(printHTML);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
      
    } catch (error) {
      console.error('Error printing report:', error);
      alert('Error printing report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateReportTable = () => {
    if (selectedReport === 'sales' || selectedReport === 'revenue') {
      return `
        <h3>${selectedReport === 'sales' ? 'Sales' : 'Revenue'} Performance</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Revenue</th>
              <th>Orders</th>
            </tr>
          </thead>
          <tbody>
            ${(Array.isArray(reportData?.chartData) ? reportData?.chartData : []).map(item => `
              <tr>
                <td>${formatDate(item.date)}</td>
                <td>${formatCurrency(item.revenue)}</td>
                <td>${item.count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (selectedReport === 'profitLoss') {
      return `
        <h3>Monthly Profit & Loss Statement</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Revenue</th>
              <th>Expenses</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            ${(Array.isArray(reportData?.chartData) ? reportData?.chartData : []).map(item => `
              <tr>
                <td>${formatMonth(item.month)}</td>
                <td>${formatCurrency(item.revenue)}</td>
                <td>${formatCurrency(item.expenses)}</td>
                <td>${formatCurrency(item.profit)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (selectedReport === 'stock') {
      return `
        <h3>Stock Analysis by Category</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Product Count</th>
              <th>Total Stock</th>
              <th>Total Value</th>
            </tr>
          </thead>
          <tbody>
            ${(Array.isArray(reportData?.categoryStats) ? reportData?.categoryStats : []).map(item => `
              <tr>
                <td>${item.category}</td>
                <td>${item.count}</td>
                <td>${item.totalStock}</td>
                <td>${formatCurrency(item.totalValue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
    return '';
  };

  const getReportTitle = () => {
    switch (selectedReport) {
      case 'sales': return 'Sales Report';
      case 'revenue': return 'Revenue Report';
      case 'profitLoss': return 'Profit & Loss Report';
      case 'stock': return 'Stock Report';
      default: return 'Business Report';
    }
  };

  const renderSalesReport = () => (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-black">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5" />
            Sales Trend
          </CardTitle>
          <CardDescription className="text-muted-foreground">Monthly sales performance over time</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={Array.isArray(reportData?.chartData) ? reportData?.chartData : []}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickFormatter={formatDate}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickFormatter={(value) => formatCurrency(value).replace('₹', '₹')}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  labelFormatter={(label) => `Date: ${formatDate(label)}`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:to-black">
            <CardTitle className="text-xl font-bold text-foreground">Order Volume</CardTitle>
            <CardDescription className="text-muted-foreground">Number of orders per period</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Array.isArray(reportData?.chartData) ? reportData?.chartData : []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickFormatter={formatDate}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Orders']}
                    labelFormatter={(label) => `Date: ${formatDate(label)}`}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-900 dark:to-black">
            <CardTitle className="text-xl font-bold text-foreground">Payment Methods</CardTitle>
            <CardDescription className="text-muted-foreground">Distribution by payment method</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Array.isArray(reportData?.paymentMethodStats) ? reportData?.paymentMethodStats : []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ method, count }) => `${method} (${count})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(Array.isArray(reportData?.paymentMethodStats) ? reportData?.paymentMethodStats : []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, 'Count']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRevenueReport = () => (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:to-black">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <CurrencyDollarIcon className="h-5 w-5" />
            Revenue Trend
          </CardTitle>
          <CardDescription className="text-muted-foreground">Revenue performance analysis</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Array.isArray(reportData?.chartData) ? reportData?.chartData : []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickFormatter={formatDate}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickFormatter={(value) => formatCurrency(value).replace('₹', '₹')}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  labelFormatter={(label) => `Date: ${formatDate(label)}`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-black">
            <CardTitle className="text-xl font-bold text-foreground">Revenue Growth</CardTitle>
            <CardDescription className="text-muted-foreground">Monthly revenue comparison</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Array.isArray(reportData?.chartData) ? reportData?.chartData : []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickFormatter={formatDate}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickFormatter={(value) => formatCurrency(value).replace('₹', '₹')}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={(label) => `Date: ${formatDate(label)}`}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="revenue" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-900 dark:to-black">
            <CardTitle className="text-xl font-bold text-foreground">Payment Methods</CardTitle>
            <CardDescription className="text-muted-foreground">Revenue by payment method</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Array.isArray(reportData?.paymentMethodStats) ? reportData?.paymentMethodStats : []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ method, revenue }) => `${method} (${formatCurrency(revenue)})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {(Array.isArray(reportData?.paymentMethodStats) ? reportData?.paymentMethodStats : []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProfitLossReport = () => (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-black">
          <CardTitle className="text-xl font-bold text-foreground">Profit & Loss Statement</CardTitle>
          <CardDescription className="text-muted-foreground">Monthly profit and loss analysis</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Array.isArray(reportData?.chartData) ? reportData?.chartData : []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickFormatter={formatMonth}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickFormatter={(value) => formatCurrency(value).replace('₹', '₹')}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  labelFormatter={(label) => `Month: ${formatMonth(label)}`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Revenue"
                  dot={{ fill: '#3B82F6', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Expenses"
                  dot={{ fill: '#EF4444', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Profit"
                  dot={{ fill: '#10B981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards for Profit/Loss */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-300">
              {formatCurrency(reportData?.summary?.totalRevenue || 0)}
            </div>
            <div className="text-sm text-green-700 dark:text-green-400 mt-2">Total Revenue</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-300">
              {formatCurrency(reportData?.summary?.totalExpenses || 0)}
            </div>
            <div className="text-sm text-red-700 dark:text-red-400 mt-2">Total Expenses</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
              {formatCurrency(reportData?.summary?.netProfit || 0)}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-400 mt-2">Net Profit</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Margin: {reportData?.summary?.profitMargin || 0}%
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStockReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-900 dark:to-black">
            <CardTitle className="text-xl font-bold text-foreground">Stock by Category</CardTitle>
            <CardDescription className="text-muted-foreground">Product distribution across categories</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Array.isArray(reportData?.categoryStats) ? reportData?.categoryStats : []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, count }) => `${category} (${count})`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(Array.isArray(reportData?.categoryStats) ? reportData?.categoryStats : []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, 'Products']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-gray-900 dark:to-black">
            <CardTitle className="text-xl font-bold text-foreground">Stock Value Analysis</CardTitle>
            <CardDescription className="text-muted-foreground">Total stock value by category</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Array.isArray(reportData?.categoryStats) ? reportData?.categoryStats : []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                    tickFormatter={(value) => formatCurrency(value).replace('₹', '₹')}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Stock Value']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="totalValue" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
              {reportData?.summary?.totalProducts || 0}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-400 mt-2">Total Products</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">
              {reportData?.summary?.lowStockProducts || 0}
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-400 mt-2">Low Stock Items</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-300">
              {reportData?.summary?.outOfStockProducts || 0}
            </div>
            <div className="text-sm text-red-700 dark:text-red-400 mt-2">Out of Stock</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-300">
              {formatCurrency(reportData?.summary?.totalStockValue || 0)}
            </div>
            <div className="text-sm text-green-700 dark:text-green-400 mt-2">Total Stock Value</div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock & Out of Stock Tables */}
      {reportData?.lowStockProducts?.length > 0 && (
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-black">
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
              Low Stock Alert
            </CardTitle>
            <CardDescription className="text-muted-foreground">Products running low on stock</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Product Name</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Current Stock</th>
                    <th className="text-left p-2">Min Stock</th>
                    <th className="text-left p-2">Cost Price</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.lowStockProducts.slice(0, 10).map((product, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-2 font-medium">{product.name}</td>
                      <td className="p-2">{product.category}</td>
                      <td className="p-2 text-yellow-600 font-medium">{product.stock}</td>
                      <td className="p-2">{product.minStock}</td>
                      <td className="p-2">{formatCurrency(product.costPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (reportsError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <CardContent>
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Reports</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{reportsError}</p>
              <Button onClick={() => fetchReports({ period })} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-gray-900 dark:to-black rounded-xl p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Reports & Analytics
              </h1>
              <p className="mt-2 text-purple-100 dark:text-gray-300 text-sm sm:text-base">
                Comprehensive insights and analytics for your business
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                onClick={exportToExcel}
                disabled={isExporting}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DocumentArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Excel'}</span>
                <span className="sm:hidden">{isExporting ? 'Exporting...' : 'Excel'}</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={printReport}
                disabled={isExporting}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PrinterIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{isExporting ? 'Preparing...' : 'Print'}</span>
                <span className="sm:hidden">{isExporting ? 'Preparing...' : 'Print'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Report Type Selector */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="reportType" className="text-xs sm:text-sm font-semibold text-foreground">Report Type</Label>
                <Select
                  id="reportType"
                  options={reportTypeOptions}
                  value={selectedReport}
                  onChange={setSelectedReport}
                  placeholder="Select report type"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="period" className="text-xs sm:text-sm font-semibold text-foreground">Period</Label>
                <Select
                  id="period"
                  options={periodOptions}
                  value={period}
                  onChange={setPeriod}
                  placeholder="Select period"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="startDate" className="text-xs sm:text-sm font-semibold text-foreground">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-xs sm:text-sm font-semibold text-foreground">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {selectedReport === 'sales' && renderSalesReport()}
              {selectedReport === 'revenue' && renderRevenueReport()}
              {selectedReport === 'profitLoss' && renderProfitLossReport()}
              {selectedReport === 'stock' && renderStockReport()}
            </>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <ChartBarIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Sales
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                      {formatCurrency(reportData?.summary?.totalRevenue || 0)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                    <CurrencyDollarIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Revenue
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                      {formatCurrency(reportData?.summary?.totalRevenue || 0)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Net Profit
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                      {formatCurrency(reportData?.summary?.netProfit || reportData?.summary?.averageOrderValue || 0)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Orders
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                      {reportData?.summary?.totalInvoices || reportData?.summary?.totalProducts || 0}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}