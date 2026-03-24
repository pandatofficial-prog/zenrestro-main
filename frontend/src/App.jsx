import { useLocation, BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ZenRestroLanding from './pages/ZenRestroLanding';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Bills from './pages/Bills';
import Menu from './pages/Menu';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import DashboardSuperAdmin from './pages/SuperAdmin/DashboardSuperAdmin';
import Restaurants from './pages/SuperAdmin/Restaurants';
import Users from './pages/SuperAdmin/Users';
import Subscriptions from './pages/SuperAdmin/Subscriptions';
import ReportsSuperAdmin from './pages/SuperAdmin/Reports';
import SettingsSuperAdmin from './pages/SuperAdmin/Settings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Subscription from './pages/admin/Subscription';
// Policy feature removed
// KDS and Tables features removed

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'superadmin' ? '/superadmin' : '/admin'} replace />;
  }

  // Subscription Check for Admins
  if (user.role === 'admin') {
    const isSubscriptionPage = location.pathname === '/admin/subscription';
    const isSettingsPage = location.pathname === '/admin/settings';

    // Only 'active' and 'trial' are considered valid statuses
    const isValid = ['active', 'trial'].includes(user.restaurant?.subscriptionStatus);

    if (!isValid && !isSubscriptionPage && !isSettingsPage) {
      return <Navigate to="/admin/subscription" replace />;
    }
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'superadmin' ? '/superadmin' : '/admin'} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<ZenRestroLanding />} />

      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* Restaurant Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bills"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Bills />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/menu"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Menu />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inventory"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Inventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/subscription"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Subscription />
          </ProtectedRoute>
        }
      />
// Policy route removed
// KDS and Tables routes removed

      {/* Super Admin Routes */}
      <Route
        path="/superadmin"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <DashboardSuperAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <DashboardSuperAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/restaurants"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Restaurants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/subscriptions"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Subscriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/users"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/reports"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <ReportsSuperAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/superadmin/settings"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <SettingsSuperAdmin />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;


