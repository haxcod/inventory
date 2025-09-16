import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import type { User } from '../types';
import { formatDate } from '../lib/utils';
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
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user',
    branch: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Mock data for now
      const mockUsers: User[] = [
        {
          _id: '1',
          name: 'John Smith',
          email: 'john@inventorypro.com',
          password: 'hashedpassword',
          role: 'admin',
          permissions: ['read', 'write', 'delete', 'admin'],
          branch: 'main',
          isActive: true,
          lastLogin: new Date('2024-01-15'),
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          _id: '2',
          name: 'Jane Doe',
          email: 'jane@inventorypro.com',
          password: 'hashedpassword',
          role: 'user',
          permissions: ['read', 'write'],
          branch: 'north',
          isActive: true,
          lastLogin: new Date('2024-01-14'),
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-14'),
        },
        {
          _id: '3',
          name: 'Bob Johnson',
          email: 'bob@inventorypro.com',
          password: 'hashedpassword',
          role: 'user',
          permissions: ['read'],
          branch: 'south',
          isActive: false,
          lastLogin: new Date('2024-01-10'),
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-12'),
        },
        {
          _id: '4',
          name: 'Alice Brown',
          email: 'alice@inventorypro.com',
          password: 'hashedpassword',
          role: 'admin',
          permissions: ['read', 'write', 'delete', 'admin'],
          branch: 'main',
          isActive: true,
          lastLogin: new Date('2024-01-15'),
          createdAt: new Date('2024-01-08'),
          updatedAt: new Date('2024-01-15'),
        },
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleCreateUser = async () => {
    try {
      // Mock API call
      const userData = {
        ...newUser,
        permissions: newUser.role === 'admin' ? ['read', 'write', 'delete', 'admin'] : ['read', 'write'],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log('Creating user:', userData);
      setShowNewUser(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'user',
        branch: '',
      });
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
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
              Users
            </h1>
            <p className="mt-2 text-sm sm:text-base" style={{color: 'hsl(var(--muted-foreground))'}}>
              Manage user accounts and permissions
            </p>
          </div>
          <Button onClick={() => setShowNewUser(true)} className="w-full sm:w-auto">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

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
                    {users.length}
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
                    {users.filter(u => u.role === 'admin').length}
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
                    {users.filter(u => u.isActive).length}
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
                    {users.filter(u => u.role === 'user').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New User Form */}
        {showNewUser && (
          <Card>
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>
                Create a new user account with appropriate permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  <select
                    id="userRole"
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))'}}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="userBranch">Branch</Label>
                  <select
                    id="userBranch"
                    value={newUser.branch}
                    onChange={(e) => setNewUser(prev => ({ ...prev, branch: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))'}}
                  >
                    <option value="">Select Branch</option>
                    <option value="main">Main Branch</option>
                    <option value="north">North Branch</option>
                    <option value="south">South Branch</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={handleCreateUser}>Create User</Button>
                <Button variant="outline" onClick={() => setShowNewUser(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
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

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user._id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-bold text-base sm:text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold">{user.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <EnvelopeIcon className="h-4 w-4" style={{color: 'hsl(var(--muted-foreground))'}} />
                          <span className="text-xs sm:text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {user.branch && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {typeof user.branch === 'string' ? user.branch : user.branch.name}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs sm:text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Created: {formatDate(user.createdAt)}</span>
                      </div>
                      {user.lastLogin && (
                        <div className="flex items-center gap-1">
                          <span>Last login: {formatDate(user.lastLogin)}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
                      <p className="text-sm font-medium">Permissions:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.permissions.map((permission, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
