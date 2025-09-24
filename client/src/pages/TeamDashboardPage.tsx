import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useDashboard } from "../hooks/useStores";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  ShoppingCartIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency, formatNumber } from "../lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { apiService } from "../lib/api";
import { getUserBranchName } from "../lib/roles";

export default function TeamDashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { 
    dashboardData, 
    isLoading, 
    error, 
    setData, 
    setLoading, 
    setError, 
    clearCache, 
    isCacheValid 
  } = useDashboard();

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      // Team users get branch-specific data
      const response = await apiService.dashboard.getData({ 
        period: "monthly"
      });

      if (response.data.success && response.data.data) {
        setData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch dashboard data');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching dashboard data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, setLoading, setError, setData]);

  useEffect(() => {
    if (isAuthenticated && (!isCacheValid || !dashboardData)) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isCacheValid, dashboardData, fetchDashboardData]);

  const shouldShowLoading = (!dashboardData && isLoading);

  if (shouldShowLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16" style={{borderBottom: '2px solid hsl(var(--primary))'}}></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <CardContent>
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={() => { clearCache(); fetchDashboardData(); }} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16" style={{borderBottom: '2px solid hsl(var(--primary))'}}></div>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, salesData, productData } = dashboardData;
  const branchName = getUserBranchName(user);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Team Dashboard
              </h1>
              <p className="mt-2 text-blue-100 dark:text-gray-300 text-sm sm:text-base">
                Overview for {branchName || 'your branch'}
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Team Access
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-200" />
              <div className="text-right">
                <div className="text-sm text-blue-200">Branch</div>
                <div className="font-semibold">{branchName || 'Not Assigned'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <CubeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalProducts)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.productGrowth > 0 ? (
                  <span className="text-green-600 flex items-center">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    +{stats.productGrowth}% from last month
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                    {stats.productGrowth}% from last month
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <ExclamationTriangleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{formatNumber(stats.lowStockItems)}</div>
              <p className="text-xs text-muted-foreground">
                Items need restocking
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Sales</CardTitle>
              <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlySales)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.salesGrowth > 0 ? (
                  <span className="text-green-600 flex items-center">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    +{stats.salesGrowth}% from last month
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                    {stats.salesGrowth}% from last month
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
              <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.pendingTransfers)}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Chart */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Sales Trend - {branchName}</CardTitle>
              <CardDescription>Monthly sales performance for your branch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Sales']} />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Product Categories */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Product Categories - {branchName}</CardTitle>
              <CardDescription>Distribution of products by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for your branch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => navigate('/products')}
                className="h-20 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <CubeIcon className="h-6 w-6" />
                <span className="text-sm">View Products</span>
              </Button>
              <Button 
                onClick={() => navigate('/products/add')}
                className="h-20 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CubeIcon className="h-6 w-6" />
                <span className="text-sm">Add Product</span>
              </Button>
              <Button 
                onClick={() => navigate('/transfers')}
                className="h-20 flex flex-col items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <ChartBarIcon className="h-6 w-6" />
                <span className="text-sm">Transfers</span>
              </Button>
              <Button 
                onClick={() => navigate('/billing')}
                className="h-20 flex flex-col items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                <span className="text-sm">Billing</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
