import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import type { Branch } from '../types';
import { formatDate } from '../lib/utils';
import apiService from '../lib/api';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  BuildingOfficeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewBranch, setShowNewBranch] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    manager: '',
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      // Real API call
      const response = await apiService.branches.getAll();
      if (response.data.success) {
        setBranches(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch branches');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBranches = (Array.isArray(branches) ? branches : []).filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.manager?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateBranch = async () => {
    try {
      // Real API call
      const branchData = {
        ...newBranch,
        isActive: true,
      };
      
      const response = await apiService.branches.create(branchData);
      if (response.data.success) {
        setShowNewBranch(false);
        setNewBranch({
          name: '',
          address: '',
          phone: '',
          email: '',
          manager: '',
        });
        // Refresh branches list
        fetchBranches();
      } else {
        throw new Error(response.data.message || 'Failed to create branch');
      }
    } catch (error) {
      console.error('Error creating branch:', error);
    }
  };

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
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-semibold text-foreground">
                  Search Branches
                </Label>
                <div className="relative mt-2">
                  <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, address, manager, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 sm:pl-12 h-10 sm:h-12 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>

        {/* New Branch Form */}
        {showNewBranch && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Branch</CardTitle>
              <CardDescription>
                Create a new branch location for your business
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                <div>
                  <Label htmlFor="manager">Manager</Label>
                  <Input
                    id="manager"
                    value={newBranch.manager}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, manager: e.target.value }))}
                    placeholder="Enter manager name"
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
              <div className="mt-4 flex gap-2">
                <Button onClick={handleCreateBranch}>Create Branch</Button>
                <Button variant="outline" onClick={() => setShowNewBranch(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
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
                    placeholder="Search by name, address, manager, or email..."
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
                  {branch.manager && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Manager:</span>
                      <span className="text-sm font-semibold text-foreground">{branch.manager}</span>
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
                  >
                    <TrashIcon className="h-4 w-4" />
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
