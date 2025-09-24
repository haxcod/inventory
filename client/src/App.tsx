import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ConfirmationProvider } from './context/ConfirmationContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthInitializer } from './components/AuthInitializer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TeamDashboardPage from './pages/TeamDashboardPage';
import ProductsPage from './pages/ProductsPage';
import BillingPage from './pages/BillingPage';
import InvoicesPage from './pages/InvoicesPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import BranchesPage from './pages/BranchesPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage';
import ViewProductPage from './pages/ViewProductPage';
import TransferPage from './pages/TransferPage';

function App() {
  return (
        <ErrorBoundary>
          <ConfirmationProvider>
            <AuthInitializer />
            <BrowserRouter>
          <div className="min-h-screen">
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/team-dashboard" 
            element={
              <ProtectedRoute>
                <TeamDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products/add" 
            element={
              <ProtectedRoute>
                <AddProductPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products/edit/:id" 
            element={
              <ProtectedRoute>
                <EditProductPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products/view/:id" 
            element={
              <ProtectedRoute>
                <ViewProductPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/billing" 
            element={
              <ProtectedRoute>
                <BillingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoices" 
            element={
              <ProtectedRoute>
                <InvoicesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payments" 
            element={
              <ProtectedRoute>
                <PaymentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/branches" 
            element={
              <ProtectedRoute>
                <BranchesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transfers" 
            element={
              <ProtectedRoute>
                <TransferPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
            },
          }}
        />
          </div>
        </BrowserRouter>
      </ConfirmationProvider>
    </ErrorBoundary>
  );
}

export default App;
