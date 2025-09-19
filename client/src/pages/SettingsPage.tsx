import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import type { SelectOption } from '../components/ui/Select';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import apiService from '../lib/api';
import { 
  CogIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  SwatchIcon as PaletteIcon,
  CircleStackIcon as DatabaseIcon,
  DocumentTextIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    invoiceAlerts: true,
    paymentAlerts: true,
  });
  const [systemSettings, setSystemSettings] = useState({
    companyName: 'InventoryPro',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
  });

  const themeOptions: SelectOption[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ];

  const currencyOptions: SelectOption[] = [
    { value: 'INR', label: 'INR (₹)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' }
  ];

  const timezoneOptions: SelectOption[] = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
    { value: 'America/New_York', label: 'America/New_York' },
    { value: 'Europe/London', label: 'Europe/London' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo' }
  ];

  const dateFormatOptions: SelectOption[] = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
  ];

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'appearance', name: 'Appearance', icon: PaletteIcon },
    { id: 'system', name: 'System', icon: CogIcon },
    { id: 'data', name: 'Data & Privacy', icon: DatabaseIcon },
  ];

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Real API call
      const response = await apiService.users.update(user?._id || '', profileData);
      if (response.data.success) {
        toast.success('Profile updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Real API call
      const response = await apiService.users.update(user?._id || '', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (response.data.success) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setIsLoading(true);
    
    try {
      // Real API call
      const response = await apiService.users.update(user?._id || '', {
        preferences: { notifications: notificationSettings }
      });
      if (response.data.success) {
        toast.success('Notification settings updated');
      } else {
        throw new Error(response.data.message || 'Failed to update notification settings');
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemUpdate = async () => {
    setIsLoading(true);
    
    try {
      // Real API call
      const response = await apiService.users.update(user?._id || '', {
        systemSettings: systemSettings
      });
      if (response.data.success) {
        toast.success('System settings updated');
      } else {
        throw new Error(response.data.message || 'Failed to update system settings');
      }
    } catch (error) {
      console.error('Error updating system settings:', error);
      toast.error('Failed to update system settings');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileTab = () => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-black">
        <CardTitle className="text-lg sm:text-xl font-bold text-foreground">Profile Information</CardTitle>
        <CardDescription className="text-muted-foreground">
          Update your personal information and contact details
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name" className="text-xs sm:text-xs sm:text-sm font-semibold text-foreground">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
                className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter your phone number"
                className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Address</Label>
              <Input
                id="address"
                value={profileData.address}
                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your address"
                className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {isLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-gray-900 dark:to-black">
          <CardTitle className="text-lg sm:text-xl font-bold text-foreground">Change Password</CardTitle>
          <CardDescription className="text-muted-foreground">
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <Label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-red-500 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
                className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-red-500 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-red-500 rounded-xl"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:to-black">
          <CardTitle className="text-lg sm:text-xl font-bold text-foreground">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-muted-foreground">
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-semibold text-foreground">SMS Authentication</p>
              <p className="text-sm text-muted-foreground">
                Receive verification codes via SMS
              </p>
            </div>
            <Button variant="outline" className="border-2 border-green-200 hover:border-green-400 hover:bg-green-50">
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-900 dark:to-black">
        <CardTitle className="text-lg sm:text-xl font-bold text-foreground">Notification Preferences</CardTitle>
        <CardDescription className="text-muted-foreground">
          Choose how you want to be notified about important events
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-semibold text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.emailNotifications}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
              className="h-5 w-5 text-purple-600 focus:ring-purple-500 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-semibold text-foreground">Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in browser
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.pushNotifications}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
              className="h-5 w-5 text-purple-600 focus:ring-purple-500 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-semibold text-foreground">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive notifications via SMS
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.smsNotifications}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
              className="h-5 w-5 text-purple-600 focus:ring-purple-500 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-semibold text-foreground">Low Stock Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified when stock is running low
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.lowStockAlerts}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, lowStockAlerts: e.target.checked }))}
              className="h-5 w-5 text-purple-600 focus:ring-purple-500 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-semibold text-foreground">Invoice Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified about new invoices
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.invoiceAlerts}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, invoiceAlerts: e.target.checked }))}
              className="h-5 w-5 text-purple-600 focus:ring-purple-500 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
            <div>
              <p className="font-semibold text-foreground">Payment Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified about payments
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.paymentAlerts}
              onChange={(e) => setNotificationSettings(prev => ({ ...prev, paymentAlerts: e.target.checked }))}
              className="h-5 w-5 text-purple-600 focus:ring-purple-500 rounded"
            />
          </div>
        </div>
        
        <div className="mt-8">
          <Button 
            onClick={handleNotificationUpdate} 
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {isLoading ? 'Updating...' : 'Update Notifications'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderAppearanceTab = () => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-black">
        <CardTitle className="text-lg sm:text-xl font-bold text-foreground">Appearance Settings</CardTitle>
        <CardDescription className="text-muted-foreground">
          Customize the look and feel of your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <Label htmlFor="theme" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Theme</Label>
            <Select
              id="theme"
              options={themeOptions}
              value={theme}
              onChange={(value) => setTheme(value as 'light' | 'dark')}
              placeholder="Select theme"
              className="mt-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSystemTab = () => (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-black">
        <CardTitle className="text-lg sm:text-xl font-bold text-foreground">System Settings</CardTitle>
        <CardDescription className="text-muted-foreground">
          Configure system-wide settings for your organization
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="companyName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Company Name</Label>
              <Input
                id="companyName"
                value={systemSettings.companyName}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Enter company name"
                className="mt-2 h-12 text-lg border-2 border-gray-200 focus:border-orange-500 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="currency" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Currency</Label>
              <Select
                id="currency"
                options={currencyOptions}
                value={systemSettings.currency}
                onChange={(value) => setSystemSettings(prev => ({ ...prev, currency: value }))}
                placeholder="Select currency"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="timezone" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Timezone</Label>
              <Select
                id="timezone"
                options={timezoneOptions}
                value={systemSettings.timezone}
                onChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}
                placeholder="Select timezone"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="dateFormat" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date Format</Label>
              <Select
                id="dateFormat"
                options={dateFormatOptions}
                value={systemSettings.dateFormat}
                onChange={(value) => setSystemSettings(prev => ({ ...prev, dateFormat: value }))}
                placeholder="Select date format"
                className="mt-2"
              />
            </div>
          </div>
          
          <div className="mt-8">
            <Button 
              onClick={handleSystemUpdate} 
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {isLoading ? 'Updating...' : 'Update System Settings'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:to-black">
          <CardTitle className="text-lg sm:text-xl font-bold text-foreground">Data Export</CardTitle>
        <CardDescription className="text-muted-foreground">
          Export your data for backup or migration purposes
        </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-2 border-2 border-green-200 hover:border-green-400 hover:bg-green-50"
            >
              <DocumentTextIcon className="h-6 w-6 text-green-600" />
              <span className="font-semibold text-green-600">Export All Data</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-2 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
            >
              <DatabaseIcon className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-blue-600">Export Products</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-2 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
            >
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              <span className="font-semibold text-purple-600">Export Invoices</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-gray-900 dark:to-black">
          <CardTitle className="text-lg sm:text-xl font-bold text-foreground">Data Deletion</CardTitle>
        <CardDescription className="text-muted-foreground">
          Permanently delete your account and all associated data
        </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="p-6 border-2 border-red-200 rounded-xl bg-red-50 dark:bg-red-900/20">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <TrashIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Danger Zone
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
                <Button 
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-600 to-slate-600 dark:from-gray-900 dark:to-black rounded-xl p-4 sm:p-6 text-white">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Settings & Preferences
            </h1>
            <p className="mt-2 text-gray-100 dark:text-gray-300 text-sm sm:text-base">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'security' && renderSecurityTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
            {activeTab === 'appearance' && renderAppearanceTab()}
            {activeTab === 'system' && renderSystemTab()}
            {activeTab === 'data' && renderDataTab()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
