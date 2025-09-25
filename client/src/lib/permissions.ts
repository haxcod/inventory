// Permission utility functions for frontend
import type { User } from '../types';

// Check if user has a specific permission
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Check if user has the specific permission
  return user.permissions && user.permissions.includes(permission);
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (user: User | null, permissions: string[]): boolean => {
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Check if user has any of the permissions
  return permissions.some(permission => hasPermission(user, permission));
};

// Check if user has all of the specified permissions
export const hasAllPermissions = (user: User | null, permissions: string[]): boolean => {
  if (!user) return false;
  
  // Admin has all permissions
  if (user.role === 'admin') return true;
  
  // Check if user has all of the permissions
  return permissions.every(permission => hasPermission(user, permission));
};

// Check if user has a specific role
export const hasRole = (user: User | null, role: string | string[]): boolean => {
  if (!user) return false;
  
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
};

// Permission constants
export const PERMISSIONS = {
  // Products
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_VIEW_DETAILS: 'products.view.details',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_DELETE: 'products.delete',
  
  // Billing
  BILLING_VIEW: 'billing.view',
  BILLING_CREATE: 'billing.create',
  BILLING_EDIT: 'billing.edit',
  BILLING_DELETE: 'billing.delete',
  
  // Transfers
  TRANSFERS_VIEW: 'transfers.view',
  TRANSFERS_CREATE: 'transfers.create',
  TRANSFERS_EDIT: 'transfers.edit',
  TRANSFERS_DELETE: 'transfers.delete',
  
  // Payments
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_CREATE: 'payments.create',
  PAYMENTS_EDIT: 'payments.edit',
  PAYMENTS_DELETE: 'payments.delete',
  
  // Invoices
  INVOICES_VIEW: 'invoices.view',
  INVOICES_CREATE: 'invoices.create',
  INVOICES_EDIT: 'invoices.edit',
  INVOICES_DELETE: 'invoices.delete',
  
  // Reports
  REPORTS_VIEW: 'reports.view',
  REPORTS_CREATE: 'reports.create',
  
  // Users (Admin only)
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  
  // Branches (Admin only)
  BRANCHES_VIEW: 'branches.view',
  BRANCHES_CREATE: 'branches.create',
  BRANCHES_EDIT: 'branches.edit',
  BRANCHES_DELETE: 'branches.delete',
  
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  
  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
} as const;
