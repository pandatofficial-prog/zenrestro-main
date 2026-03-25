import { lazy, Suspense } from 'react';
import { useLocation, BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import ZenRestroLanding from './pages/ZenRestroLanding';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Lazy load all feature pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Orders = lazy(() => import('./pages/Orders'));
const Bills = lazy(() => import('./pages/Bills'));
const Menu = lazy(() => import('./pages/Menu'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const DashboardSuperAdmin = lazy(() => import('./pages/SuperAdmin/DashboardSuperAdmin'));
const Restaurants = lazy(() => import('./pages/SuperAdmin/Restaurants'));
const Users = lazy(() => import('./pages/SuperAdmin/Users'));
const Subscriptions = lazy(() => import('./pages/SuperAdmin/Subscriptions'));
const ReportsSuperAdmin = lazy(() => import('./pages/SuperAdmin/Reports'));
const SettingsSuperAdmin = lazy(() => import('./pages/SuperAdmin/Settings'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Subscription = lazy(() => import('./pages/admin/Subscription'));
const RequestTrial = lazy(() => import('./pages/RequestTrial'));
const TrialRequests = lazy(() => import('./pages/SuperAdmin/TrialRequests'));

// Loading component for Suspense
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900">
    <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mb-4 shadow-xl shadow-green-500/10" />
    <span className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">ZenRestro Loading...</span>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

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
  const hasToken = !!localStorage.getItem('token');

  // If there's no token in localStorage, we can skip the full "loading" spinner 
  // to make the Login form appear instantly for new guests.
  if (loading && hasToken) return <PageLoader />;

  if (user) {
    return <Navigate to={user.role === 'superadmin' ? '/superadmin' : '/admin'} replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<ZenRestroLanding />} />

        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/request-trial" element={<PublicRoute><RequestTrial /></PublicRoute>} />

        {/* Restaurant Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><Orders /></ProtectedRoute>} />
        <Route path="/admin/bills" element={<ProtectedRoute allowedRoles={['admin']}><Bills /></ProtectedRoute>} />
        <Route path="/admin/menu" element={<ProtectedRoute allowedRoles={['admin']}><Menu /></ProtectedRoute>} />
        <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><Inventory /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
        <Route path="/admin/subscription" element={<ProtectedRoute allowedRoles={['admin']}><Subscription /></ProtectedRoute>} />

        {/* Super Admin Routes */}
        <Route path="/superadmin" element={<ProtectedRoute allowedRoles={['superadmin']}><DashboardSuperAdmin /></ProtectedRoute>} />
        <Route path="/superadmin/dashboard" element={<ProtectedRoute allowedRoles={['superadmin']}><DashboardSuperAdmin /></ProtectedRoute>} />
        <Route path="/superadmin/restaurants" element={<ProtectedRoute allowedRoles={['superadmin']}><Restaurants /></ProtectedRoute>} />
        <Route path="/superadmin/subscriptions" element={<ProtectedRoute allowedRoles={['superadmin']}><Subscriptions /></ProtectedRoute>} />
        <Route path="/superadmin/users" element={<ProtectedRoute allowedRoles={['superadmin']}><Users /></ProtectedRoute>} />
        <Route path="/superadmin/reports" element={<ProtectedRoute allowedRoles={['superadmin']}><ReportsSuperAdmin /></ProtectedRoute>} />
        <Route path="/superadmin/settings" element={<ProtectedRoute allowedRoles={['superadmin']}><SettingsSuperAdmin /></ProtectedRoute>} />
        <Route path="/superadmin/trial-requests" element={<ProtectedRoute allowedRoles={['superadmin']}><TrialRequests /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
