// Role-based access control utilities
import type { User } from '../types';

// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

// Check if user is team member (non-admin users are team members)
export const isTeam = (user: User | null): boolean => {
  return user?.role === 'user';
};

// Get user's branch ID
export const getUserBranchId = (user: User | null): string | null => {
  if (!user?.branch) return null;
  return typeof user.branch === 'object' ? user.branch._id : user.branch;
};

// Get user's branch name
export const getUserBranchName = (user: User | null): string | null => {
  if (!user?.branch) return null;
  return typeof user.branch === 'object' ? user.branch.name : user.branch;
};

// Check if user can access all branches (admin only)
export const canAccessAllBranches = (user: User | null): boolean => {
  return isAdmin(user);
};

// Check if user can access specific branch
export const canAccessBranch = (user: User | null, branchId: string): boolean => {
  if (isAdmin(user)) return true; // Admin can access all branches
  if (isTeam(user)) return getUserBranchId(user) === branchId; // Team can only access their branch
  return false;
};

// Navigation items for different roles
export const getNavigationItems = (user: User | null) => {
  const baseItems = [
    { name: 'Dashboard', href: isAdmin(user) ? '/dashboard' : '/team-dashboard', icon: 'HomeIcon', adminOnly: false },
    { name: 'Products', href: '/products', icon: 'CubeIcon', adminOnly: false },
    { name: 'Transfers', href: '/transfers', icon: 'ArrowRightIcon', adminOnly: false },
    { name: 'Billing', href: '/billing', icon: 'ShoppingCartIcon', adminOnly: false },
    { name: 'Invoices', href: '/invoices', icon: 'DocumentTextIcon', adminOnly: false },
    { name: 'Payments', href: '/payments', icon: 'DocumentTextIcon', adminOnly: false },
    { name: 'Reports', href: '/reports', icon: 'ChartBarIcon', adminOnly: false },
  ];

  const adminOnlyItems = [
    { name: 'Branches', href: '/branches', icon: 'BuildingOfficeIcon', adminOnly: true },
    { name: 'Users', href: '/users', icon: 'UserGroupIcon', adminOnly: true },
    { name: 'Settings', href: '/settings', icon: 'CogIcon', adminOnly: true },
  ];

  if (isAdmin(user)) {
    return [...baseItems, ...adminOnlyItems];
  } else {
    return baseItems;
  }
};

// Get role-specific dashboard data
export const getDashboardConfig = (user: User | null) => {
  if (isAdmin(user)) {
    return {
      title: 'Admin Dashboard',
      subtitle: 'Complete system overview and management',
      showAllBranches: true,
      showBranchSelector: true,
      showSystemStats: true,
    };
  } else {
    return {
      title: 'Team Dashboard',
      subtitle: `Overview for ${getUserBranchName(user) || 'your branch'}`,
      showAllBranches: false,
      showBranchSelector: false,
      showSystemStats: false,
    };
  }
};
