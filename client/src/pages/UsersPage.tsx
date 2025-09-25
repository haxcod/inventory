import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import type { User } from '../types';
import { formatDate } from '../lib/utils';
import { useUsers, useBranches } from '../hooks/useStores';
import { useConfirmations } from '../hooks/useConfirmations';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  UserGroupIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showNewUser, setShowNewUser] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<{_id: string, name: string, address: string, manager?: string} | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'team' as 'admin' | 'team',
    branch: 'main',
  });

  const { confirmDelete } = useConfirmations();
  const { users, fetchUsers, isLoading, error: usersError, createUser, removeUser } = useUsers();
  const { branches, fetchBranches } = useBranches();

  // Load data using the same pattern as other pages
  useEffect(() => {
    console.log('🔍 UsersPage useEffect - users.length:', users.length, 'branches.length:', branches.length);
    
    // Only fetch users if we don't have users yet
    if (users.length === 0) {
      console.log('📥 Fetching users...');
      fetchUsers();
    }
    
    // Only fetch branches if we don't have branches yet
    if (branches.length === 0) {
      console.log('📥 Fetching branches...');
      fetchBranches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users.length, branches.length]); // fetchUsers and fetchBranches are stable from Zustand

  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  const handleCreateUser = useCallback(async () => {
    const userData = {
      ...newUser,
      permissions: newUser.role === 'admin' ? ['read', 'write', 'delete', 'admin'] : ['read', 'write'],
      isActive: true,
      branch: selectedBranch?._id || (newUser.branch === 'main' ? null : newUser.branch),
    };
    
    try {
      await createUser(userData);
      
      // Reset form on success
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'team',
        branch: 'main',
      });
      setSelectedBranch(null);
      setShowNewUser(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  }, [newUser, selectedBranch, createUser]);

  const handleDeleteUser = useCallback((user: User) => {
    confirmDelete(user.name, async () => {
      try {
        await removeUser(user._id);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    });
  }, [confirmDelete, removeUser]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16" style={{borderBottom: '2px solid hsl(var(--primary))'}}></div>
        </div>
      </DashboardLayout>
    );
  }

  if (usersError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <CardContent>
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Users</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{usersError}</p>
              <Button onClick={() => fetchUsers()} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading if no data yet
  if (isLoading || !users) {
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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-900 dark:to-black rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Users
              </h1>
              <p className="mt-2 text-blue-100 dark:text-gray-300 text-sm sm:text-base">
                Manage user accounts and permissions
              </p>
            </div>
            <Button 
              onClick={() => setShowNewUser(true)} 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-blue-400 w-full sm:w-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-semibold text-foreground">
                  Search Users
                </Label>
                <div className="relative mt-2">
                  <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="lg"
                    className="pl-10 sm:pl-12"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="roleFilter" className="text-sm font-semibold text-foreground">
                  Filter by Role
                </Label>
                <Select
                  id="roleFilter"
                  options={[
                    { value: 'all', label: 'All Roles' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'user', label: 'User' }
                  ]}
                  value={roleFilter}
                  onChange={(value) => setRoleFilter(value)}
                  placeholder="Filter by role"
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>
                    Total Users
                  </p>
                  <p className="text-2xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
                    {(Array.isArray(users) ? users : []).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>
                    Admins
                  </p>
                  <p className="text-2xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
                    {(Array.isArray(users) ? users : []).filter(u => u.role === 'admin').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>
                    Active Users
                  </p>
                  <p className="text-2xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
                    {(Array.isArray(users) ? users : []).filter(u => u.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>
                    Regular Users
                  </p>
                  <p className="text-2xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
                    {(Array.isArray(users) ? users : []).filter(u => u.role === 'team').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New User Modal */}
        {showNewUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blurred Background */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowNewUser(false)}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Add New User
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Create a new user account with appropriate permissions
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewUser(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userName">Full Name</Label>
                  <Input
                    id="userName"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="userEmail">Email</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="userPassword">Password</Label>
                  <Input
                    id="userPassword"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <Label htmlFor="userRole">Role</Label>
                  <Select
                    id="userRole"
                    options={[
                      { value: 'team', label: 'Team' },
                      { value: 'admin', label: 'Admin' }
                    ]}
                    value={newUser.role}
                    onChange={(value) => setNewUser(prev => ({ ...prev, role: value as 'admin' | 'team' }))}
                    placeholder="Select role"
                    className="mt-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="userBranch">Branch</Label>
                  <Select
                    id="userBranch"
                    options={[
                      { value: 'main', label: 'Main Branch' },
                      ...(Array.isArray(branches) ? branches.map(branch => ({
                        value: branch._id,
                        label: branch.name
                      })) : [])
                    ]}
                    value={selectedBranch?._id || 'main'}
                    onChange={(value) => {
                      if (value === 'main') {
                        setSelectedBranch(null);
                        setNewUser(prev => ({ ...prev, branch: 'main' }));
                      } else {
                        const branch = branches?.find(b => b._id === value);
                        if (branch) {
                          setSelectedBranch(branch);
                          setNewUser(prev => ({ ...prev, branch: branch.name }));
                        }
                      }
                    }}
                    placeholder="Select branch"
                    className="mt-2"
                  />
                </div>
              </div>
                <div className="mt-6 flex justify-end gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setShowNewUser(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateUser}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Users</Label>
                <div className="relative mt-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{color: 'hsl(var(--muted-foreground))'}} />
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))'}}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredUsers.map((user) => (
            <Card key={user._id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="pb-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors">
                          {user.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold self-start ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <CardDescription className="text-muted-foreground mt-2 text-sm">
                  {user.branch ? (typeof user.branch === 'string' ? user.branch : user.branch.name) : 'No branch assigned'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Role:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Created:</span>
                    <span className="text-sm font-semibold text-foreground">{formatDate(user.createdAt)}</span>
                  </div>
                  {user.lastLogin && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Last Login:</span>
                      <span className="text-sm font-semibold text-foreground">{formatDate(user.lastLogin)}</span>
                    </div>
                  )}
                  <div className="mt-2">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.map((permission: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-400 transition-all duration-200"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-200"
                    onClick={() => handleDeleteUser(user)}
                    disabled={isLoading}
                  >
                    <TrashIcon className="h-4 w-4" />
                    {isLoading ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Users Found */}

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <UserGroupIcon className="h-12 w-12 mx-auto mb-4" style={{color: 'hsl(var(--muted-foreground))'}} />
              <p style={{color: 'hsl(var(--muted-foreground))'}}>
                {searchTerm ? 'No users found matching your search.' : 'No users available.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

    </DashboardLayout>
  );
}
