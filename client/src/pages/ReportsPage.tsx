import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import type { SelectOption } from '../components/ui/Select';
import { formatCurrency } from '../lib/utils';
import { 
  ChartBarIcon,
  DocumentArrowDownIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ReportData {
  sales: any[];
  products: any[];
  revenue: any[];
  profitLoss: any[];
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    sales: [],
    products: [],
    revenue: [],
    profitLoss: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [period, setPeriod] = useState('monthly');

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
    fetchReportData();
  }, [selectedReport, period]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for different reports
      const mockData = {
        sales: [
          { name: 'Jan', sales: 120000, orders: 45 },
          { name: 'Feb', sales: 150000, orders: 52 },
          { name: 'Mar', sales: 180000, orders: 68 },
          { name: 'Apr', sales: 160000, orders: 58 },
          { name: 'May', sales: 200000, orders: 75 },
          { name: 'Jun', sales: 220000, orders: 82 }
        ],
        products: [
          { name: 'Electronics', value: 35, count: 120 },
          { name: 'Clothing', value: 25, count: 85 },
          { name: 'Books', value: 20, count: 65 },
          { name: 'Home & Garden', value: 20, count: 70 }
        ],
        revenue: [
          { name: 'Q1', revenue: 450000, profit: 90000 },
          { name: 'Q2', revenue: 580000, profit: 116000 },
          { name: 'Q3', revenue: 620000, profit: 124000 },
          { name: 'Q4', revenue: 700000, profit: 140000 }
        ],
        profitLoss: [
          { name: 'Jan', revenue: 120000, expenses: 80000, profit: 40000 },
          { name: 'Feb', revenue: 150000, expenses: 95000, profit: 55000 },
          { name: 'Mar', revenue: 180000, expenses: 110000, profit: 70000 },
          { name: 'Apr', revenue: 160000, expenses: 100000, profit: 60000 },
          { name: 'May', revenue: 200000, expenses: 120000, profit: 80000 },
          { name: 'Jun', revenue: 220000, expenses: 130000, profit: 90000 }
        ]
      };

      setReportData(mockData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const renderSalesReport = () => (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-black">
          <CardTitle className="text-xl font-bold text-foreground">Sales Trend</CardTitle>
          <CardDescription className="text-muted-foreground">Monthly sales performance over time</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Sales']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:to-black">
            <CardTitle className="text-xl font-bold text-foreground">Sales by Orders</CardTitle>
            <CardDescription className="text-muted-foreground">Number of orders per month</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.sales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="orders" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-900 dark:to-black">
            <CardTitle className="text-xl font-bold text-foreground">Product Categories</CardTitle>
            <CardDescription className="text-muted-foreground">Distribution of products by category</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.products}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                      {reportData.products.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Profit</CardTitle>
          <CardDescription>Quarterly revenue and profit analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                <Bar dataKey="profit" fill="#10B981" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProfitLossReport = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Statement</CardTitle>
          <CardDescription>Monthly profit and loss analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reportData.profitLoss}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Expenses"
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStockReport = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Stock Analysis</CardTitle>
          <CardDescription>Product stock levels and categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.products}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                      {reportData.products.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
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
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                <DocumentArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                <PrinterIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Print</span>
                <span className="sm:hidden">Print</span>
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
                  className="mt-2 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-xs sm:text-sm font-semibold text-foreground">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="mt-2 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        {selectedReport === 'sales' && renderSalesReport()}
        {selectedReport === 'revenue' && renderRevenueReport()}
        {selectedReport === 'profitLoss' && renderProfitLossReport()}
        {selectedReport === 'stock' && renderStockReport()}

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
                      {formatCurrency(reportData.sales.reduce((sum, item) => sum + item.sales, 0))}
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
                    <span className="text-white font-bold text-xl">₹</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Revenue
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                      {formatCurrency(reportData.revenue.reduce((sum, item) => sum + item.revenue, 0))}
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
                    <span className="text-white font-bold text-xl">+</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Profit
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                      {formatCurrency(reportData.profitLoss.reduce((sum, item) => sum + item.profit, 0))}
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
                    <span className="text-white font-bold text-xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Total Products
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                      {reportData.products.reduce((sum, item) => sum + item.count, 0)}
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
