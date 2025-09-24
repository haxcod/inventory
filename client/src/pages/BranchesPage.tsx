import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import type { Branch } from '../types';
import { formatDate } from '../lib/utils';
import { useBranches } from '../hooks/useStores';
import { useConfirmations } from '../hooks/useConfirmations';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  BuildingOfficeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function BranchesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewBranch, setShowNewBranch] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const { confirmDelete } = useConfirmations();
  const { branches, fetchBranches, isLoading, error: branchesError, createBranch, removeBranch } = useBranches();

  // Load data using the same pattern as other pages
  useEffect(() => {
    console.log('🔍 BranchesPage useEffect - branches.length:', branches.length);
    
    // Only fetch branches if we don't have branches yet
    if (branches.length === 0) {
      console.log('📥 Fetching branches...');
      fetchBranches();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches.length]); // fetchBranches is stable from Zustand

  const filteredBranches = (Array.isArray(branches) ? branches : []).filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && branch.isActive) ||
      (statusFilter === 'inactive' && !branch.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateBranch = useCallback(async () => {
    const branchData = {
      ...newBranch,
      isActive: true,
    };
    
    try {
      await createBranch(branchData);
      
      // Reset form on success
      setNewBranch({
        name: '',
        address: '',
        phone: '',
        email: '',
      });
      setShowNewBranch(false);
    } catch (error) {
      console.error('Failed to create branch:', error);
    }
  }, [newBranch, createBranch]);

  const handleDeleteBranch = useCallback((branch: Branch) => {
    confirmDelete(branch.name, async () => {
      try {
        await removeBranch(branch._id);
      } catch (error) {
        console.error('Failed to delete branch:', error);
      }
    });
  }, [confirmDelete, removeBranch]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16" style={{borderBottom: '2px solid hsl(var(--primary))'}}></div>
        </div>
      </DashboardLayout>
    );
  }

  if (branchesError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center max-w-md">
            <CardContent>
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Branches</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{branchesError}</p>
              <Button onClick={() => fetchBranches()} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading if still loading
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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gray-900 dark:to-black rounded-xl p-4 sm:p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Branches
              </h1>
              <p className="mt-2 text-blue-100 dark:text-gray-300 text-sm sm:text-base">
                Manage your business branches and locations
              </p>
            </div>
            <Button 
              onClick={() => setShowNewBranch(true)} 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-blue-400 w-full sm:w-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Branch
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-semibold text-foreground">
                  Search Branches
                </Label>
                <div className="relative mt-2">
                  <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, address, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="lg"
                    className="pl-10 sm:pl-12"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="statusFilter" className="text-sm font-semibold text-foreground">
                  Filter by Status
                </Label>
                <Select
                  id="statusFilter"
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' }
                  ]}
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  placeholder="Filter by status"
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
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>
                    Total Branches
                  </p>
                  <p className="text-2xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
                    {(Array.isArray(branches) ? branches : []).length}
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
                    Active Branches
                  </p>
                  <p className="text-2xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
                    {(Array.isArray(branches) ? branches : []).filter(b => b.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <span className="text-red-600 font-bold">✗</span>
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>
                    Inactive Branches
                  </p>
                  <p className="text-2xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
                    {(Array.isArray(branches) ? branches : []).filter(b => !b.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium" style={{color: 'hsl(var(--muted-foreground))'}}>
                    Total Branches
                  </p>
                  <p className="text-2xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
                    {(Array.isArray(branches) ? branches : []).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Branch Modal */}
        {showNewBranch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blurred Background */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowNewBranch(false)}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Add New Branch
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Create a new branch location for your business
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewBranch(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="branchName">Branch Name</Label>
                  <Input
                    id="branchName"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter branch name"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newBranch.address}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter full address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newBranch.email}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
                <div className="mt-6 flex justify-end gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setShowNewBranch(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateBranch}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Branch'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Branches</Label>
                <div className="relative mt-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{color: 'hsl(var(--muted-foreground))'}} />
                  <Input
                    id="search"
                    placeholder="Search by name, address, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredBranches.map((branch) => (
            <Card key={branch._id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="pb-4 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <BuildingOfficeIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors">
                          {branch.name}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground mt-1">
                          {branch.address}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold self-start ${
                    branch.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 p-4 sm:p-6">
                <div className="space-y-3">
                  {branch.phone && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                      <span className="text-sm font-semibold text-foreground">{branch.phone}</span>
                    </div>
                  )}
                  {branch.email && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Email:</span>
                      <span className="text-sm font-semibold text-foreground truncate max-w-[150px]">{branch.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Created:</span>
                    <span className="text-sm font-semibold text-foreground">{formatDate(branch.createdAt)}</span>
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
                    onClick={() => handleDeleteBranch(branch)}
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

        {/* No Branches Found */}
        {filteredBranches.length === 0 && !isLoading && (
          <div className="text-center py-10">
            <p className="text-lg text-gray-500 dark:text-gray-400">No branches found matching your criteria.</p>
            <Button 
              onClick={() => setShowNewBranch(true)} 
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Add New Branch
            </Button>
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}
