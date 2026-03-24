import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  Utensils,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChefHat,
  Bell,
  CreditCard,
  Shield,
  Monitor,
  Armchair,
} from 'lucide-react';
import TrialBanner from './TrialBanner';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isSubscriptionActive = user?.role === 'superadmin' ||
    (['active', 'trial'].includes(user?.restaurant?.subscriptionStatus));

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: Receipt, label: 'Bills', path: '/admin/bills' },
    { icon: Utensils, label: 'Menu', path: '/admin/menu' },
    { icon: Package, label: 'Inventory', path: '/admin/inventory' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: CreditCard, label: 'Subscription', path: '/admin/subscription' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const superadminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/superadmin' },
    { icon: Utensils, label: 'Restaurants', path: '/superadmin/restaurants' },
    { icon: CreditCard, label: 'Subscriptions', path: '/superadmin/subscriptions' },
    { icon: ShoppingBag, label: 'Users', path: '/superadmin/users' },
    { icon: BarChart3, label: 'Reports', path: '/superadmin/reports' },
    { icon: Settings, label: 'Settings', path: '/superadmin/settings' },
  ];

  let menuItems = user?.role === 'superadmin' ? superadminMenuItems : adminMenuItems;

  // Filter menu items if subscription is not active (for admins only)
  if (user?.role === 'admin' && !isSubscriptionActive) {
    menuItems = adminMenuItems.filter(item =>
      ['Subscription', 'Settings', 'Policy'].includes(item.label)
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${isMobile
          ? `fixed inset-y-0 left-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`
          : sidebarOpen ? 'w-64' : 'w-20'
          } bg-dark text-white transition-all duration-300 flex flex-col shadow-xl z-20`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg">{user?.role === 'superadmin' ? 'ZenRestro' : user?.restaurant?.name || 'Admin'}</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                  >
                    <Icon size={20} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-gray-700">
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'w-full' : ''}`}>
        <TrialBanner />
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
