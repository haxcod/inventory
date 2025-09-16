import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import type { Branch } from '../types';
import { formatDate } from '../lib/utils';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  BuildingOfficeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon
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
      // Mock data for now
      const mockBranches: Branch[] = [
        {
          _id: '1',
          name: 'Main Branch',
          address: '123 Main Street, Downtown, City 12345',
          phone: '+1-555-0123',
          email: 'main@inventorypro.com',
          manager: 'John Smith',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          _id: '2',
          name: 'North Branch',
          address: '456 North Avenue, Uptown, City 12346',
          phone: '+1-555-0124',
          email: 'north@inventorypro.com',
          manager: 'Jane Doe',
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          _id: '3',
          name: 'South Branch',
          address: '789 South Boulevard, Midtown, City 12347',
          phone: '+1-555-0125',
          email: 'south@inventorypro.com',
          manager: 'Bob Johnson',
          isActive: false,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
        },
      ];

      setBranches(mockBranches);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.manager?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateBranch = async () => {
    try {
      // Mock API call
      const branchData = {
        ...newBranch,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log('Creating branch:', branchData);
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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{color: 'hsl(var(--foreground))'}}>
              Branches
            </h1>
            <p className="mt-2 text-sm sm:text-base" style={{color: 'hsl(var(--muted-foreground))'}}>
              Manage your business branches and locations
            </p>
          </div>
          <Button onClick={() => setShowNewBranch(true)} className="w-full sm:w-auto">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Branch
          </Button>
        </div>

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
                    {branches.length}
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
                    {branches.filter(b => b.isActive).length}
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
                    {branches.filter(b => !b.isActive).length}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBranches.map((branch) => (
            <Card key={branch._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BuildingOfficeIcon className="h-5 w-5" />
                      {branch.name}
                    </CardTitle>
                    <CardDescription>
                      {branch.isActive ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-red-600">Inactive</span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-4 w-4 mt-1" style={{color: 'hsl(var(--muted-foreground))'}} />
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Address</p>
                      <p className="text-xs sm:text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
                        {branch.address}
                      </p>
                    </div>
                  </div>

                  {branch.phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4" style={{color: 'hsl(var(--muted-foreground))'}} />
                      <div>
                        <p className="text-xs sm:text-sm font-medium">Phone</p>
                        <p className="text-xs sm:text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
                          {branch.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {branch.email && (
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="h-4 w-4" style={{color: 'hsl(var(--muted-foreground))'}} />
                      <div>
                        <p className="text-xs sm:text-sm font-medium">Email</p>
                        <p className="text-xs sm:text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
                          {branch.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {branch.manager && (
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" style={{color: 'hsl(var(--muted-foreground))'}} />
                      <div>
                        <p className="text-sm font-medium">Manager</p>
                        <p className="text-xs sm:text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
                          {branch.manager}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <p className="text-xs" style={{color: 'hsl(var(--muted-foreground))'}}>
                      Created: {formatDate(branch.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBranches.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <BuildingOfficeIcon className="h-12 w-12 mx-auto mb-4" style={{color: 'hsl(var(--muted-foreground))'}} />
              <p style={{color: 'hsl(var(--muted-foreground))'}}>
                {searchTerm ? 'No branches found matching your search.' : 'No branches available.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
