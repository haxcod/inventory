import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { hasPermission, PERMISSIONS } from '../../lib/permissions';
import {
  HomeIcon,
  CubeIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  SunIcon,
  MoonIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon, 
    permission: PERMISSIONS.DASHBOARD_VIEW 
  },
  { 
    name: 'Products', 
    href: '/products', 
    icon: CubeIcon, 
    permission: PERMISSIONS.PRODUCTS_VIEW 
  },
  { 
    name: 'Transfers', 
    href: '/transfers', 
    icon: ArrowRightIcon, 
    permission: PERMISSIONS.TRANSFERS_VIEW 
  },
  { 
    name: 'Billing', 
    href: '/billing', 
    icon: ShoppingCartIcon, 
    permission: PERMISSIONS.BILLING_VIEW 
  },
  { 
    name: 'Invoices', 
    href: '/invoices', 
    icon: DocumentTextIcon, 
    permission: PERMISSIONS.INVOICES_VIEW 
  },
  { 
    name: 'Payments', 
    href: '/payments', 
    icon: DocumentTextIcon, 
    permission: PERMISSIONS.PAYMENTS_VIEW 
  },
  { 
    name: 'Reports', 
    href: '/reports', 
    icon: ChartBarIcon, 
    permission: PERMISSIONS.REPORTS_VIEW 
  },
  { 
    name: 'Branches', 
    href: '/branches', 
    icon: BuildingOfficeIcon, 
    permission: PERMISSIONS.BRANCHES_VIEW 
  },
  { 
    name: 'Users', 
    href: '/users', 
    icon: UserGroupIcon, 
    permission: PERMISSIONS.USERS_VIEW 
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: CogIcon, 
    permission: PERMISSIONS.SETTINGS_VIEW 
  },
];

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const filteredNavigation = navigation.filter(item => {
    return hasPermission(user, item.permission);
  });

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white"
          >
            {isMobileMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">InventoryPro</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">{user?.name || 'Admin User'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-56 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:block',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'lg:top-0 top-16',
          'border-r border-gray-200 dark:border-gray-700'
        )}
        style={{
          backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
          color: theme === 'dark' ? '#e5e7eb' : '#374151'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo - Hidden on mobile */}
          <div className="hidden lg:flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">InventoryPro</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {filteredNavigation.map(item => {
              // More robust active state detection
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'sidebar-button group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 cursor-pointer',
                    isActive 
                      ? 'sidebar-button-active border-l-4' 
                      : 'sidebar-button-inactive'
                  )}
                  style={{
                    backgroundColor: isActive 
                      ? 'transparent' 
                      : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon 
                    className="mr-3 h-5 w-5 transition-colors duration-200"
                    style={{
                      color: isActive 
                        ? (theme === 'dark' ? '#ffffff' : '#111827')
                        : theme === 'dark' ? '#d1d5db' : '#6b7280'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#2563eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = theme === 'dark' ? '#d1d5db' : '#6b7280';
                      }
                    }}
                  />
                  <span 
                    className="flex-1 font-semibold transition-colors duration-200"
                    style={{
                      color: isActive 
                        ? (theme === 'dark' ? '#ffffff' : '#111827')
                        : theme === 'dark' ? '#e5e7eb' : '#374151'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = theme === 'dark' ? '#ffffff' : '#2563eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = theme === 'dark' ? '#e5e7eb' : '#374151';
                      }
                    }}
                  >
                    {item.name}
                  </span>
                  {isActive && (
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: theme === 'dark' ? '#ffffff' : '#111827'
                      }}
                    ></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-600 dark:bg-blue-500">
                <span className="text-sm font-medium text-white">{user?.name?.charAt(0) || 'A'}</span>
              </div>
              <div className="ml-3">
                <p 
                  className="text-sm font-medium"
                  style={{
                    color: theme === 'dark' ? '#ffffff' : '#111827'
                  }}
                >
                  {user?.name || 'Admin User'}
                </p>
                <p 
                  className="text-xs"
                  style={{
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280'
                  }}
                >
                  {user?.role || 'admin'}
                </p>
                {user?.branch && (
                  <p 
                    className="text-xs mt-1"
                    style={{
                      color: theme === 'dark' ? '#6b7280' : '#9ca3af'
                    }}
                  >
                    {typeof user.branch === 'object' ? user.branch.name : user.branch}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="transition-colors duration-200"
                style={{
                  color: theme === 'dark' ? '#d1d5db' : '#4b5563',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="transition-colors duration-200"
                style={{
                  color: theme === 'dark' ? '#d1d5db' : '#4b5563',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f2937' : '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 lg:hidden top-16 mobile-overlay" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}
    </>
  );
}
