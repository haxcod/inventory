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
import { isAdmin } from "../lib/roles";
import { Navigate } from "react-router-dom";

export default function DashboardPage() {
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

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.dashboard.getData({ period: "monthly" });
      
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

  // Load data only if not cached or cache is invalid
  useEffect(() => {
    if (isAuthenticated && (!isCacheValid || !dashboardData)) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isCacheValid, dashboardData, fetchDashboardData]);

  // Redirect team users to team dashboard
  if (isAuthenticated && !isAdmin(user)) {
    return <Navigate to="/team-dashboard" replace />;
  }

  // Show loading only if we don't have cached data and are actually loading
  const shouldShowLoading = (!dashboardData && isLoading);

  if (shouldShowLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div
            className="animate-spin rounded-full h-16 w-16"
            style={{ borderBottom: "2px solid hsl(var(--primary))" }}
          ></div>
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Error Loading Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <Button
                onClick={() => {
                  clearCache();
                  fetchDashboardData();
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
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
          <div
            className="animate-spin rounded-full h-16 w-16"
            style={{ borderBottom: "2px solid hsl(var(--primary))" }}
          ></div>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, salesData, productData } = dashboardData;

  const statCards = [
    {
      title: "Total Sales",
      value: formatCurrency(stats.totalSales),
      growth: stats.salesGrowth,
      icon: ShoppingCartIcon,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Total Products",
      value: formatNumber(stats.totalProducts),
      growth: stats.productGrowth,
      icon: CubeIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Total Invoices",
      value: formatNumber(stats.totalInvoices),
      growth: stats.invoiceGrowth,
      icon: ChartBarIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      growth: stats.revenueGrowth,
      icon: CurrencyDollarIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900",
    },
  ];

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Admin Dashboard 🚀
              </h1>
              <p className="mt-2 text-purple-100 dark:text-gray-300 text-sm sm:text-base">
                Complete system overview and management
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Admin Access
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-blue-200 dark:text-gray-400">
                Last updated
              </p>
              <p className="text-sm sm:text-lg font-semibold">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start min-w-0 flex-1">
                    <div
                      className={`p-3 sm:p-4 rounded-xl ${stat.bgColor} dark:opacity-90 shadow-lg flex-shrink-0`}
                    >
                      <stat.icon
                        className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`}
                      />
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {stat.title}
                      </p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mt-1">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:flex-shrink-0 ml-2 sm:block">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        stat.growth > 0
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {stat.growth > 0 ? (
                        <ArrowUpIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                      ) : (
                        <ArrowDownIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                      )}
                      <span>{Math.abs(stat.growth)}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <p className="text-xs text-muted-foreground">vs last month</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Sales Chart */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-black p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                    Daily Sales
                  </CardTitle>
                  <CardDescription className="mt-1 text-muted-foreground text-sm">
                    Sales performance over the last 7 days
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">Sales</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: "#e0e0e0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: "#e0e0e0" }}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatCurrency(value),
                        "Sales",
                      ]}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                      connectNulls={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Product Categories Chart */}
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-900 dark:to-black p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-foreground">
                    Product Categories
                  </CardTitle>
                  <CardDescription className="mt-1 text-muted-foreground text-sm">
                    Distribution of products by category
                  </CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  {productData.length} categories
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="totalProducts"
                    >
                      {productData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        `${value} products`,
                        "Count",
                      ]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
            <CardTitle className="text-xl font-bold text-foreground">
              Quick Actions
            </CardTitle>
            <CardDescription className="mt-1 text-muted-foreground">
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button
                className="h-24 flex flex-col items-center justify-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => navigate("/billing")}
              >
                <ShoppingCartIcon className="h-10 w-10" />
                <span className="font-semibold text-lg">New Sale</span>
                <span className="text-sm text-green-100">Create invoice</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => navigate("/products")}
              >
                <CubeIcon className="h-10 w-10 text-blue-600" />
                <span className="font-semibold text-lg text-blue-600">
                  Add Product
                </span>
                <span className="text-sm text-muted-foreground">
                  Manage inventory
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => navigate("/reports")}
              >
                <ChartBarIcon className="h-10 w-10 text-purple-600" />
                <span className="font-semibold text-lg text-purple-600">
                  View Reports
                </span>
                <span className="text-sm text-muted-foreground">
                  Analytics & insights
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

