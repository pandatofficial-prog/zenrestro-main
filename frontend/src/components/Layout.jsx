import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
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
  UserPlus,
} from 'lucide-react';
import api from '../services/api';
import TrialBanner from './TrialBanner';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Real-time badge for Superadmin leads
  const { data: pendingCount } = useQuery({
    queryKey: ['pendingTrialCount'],
    queryFn: async () => {
      const res = await api.get('/trial-requests');
      return res.data.filter(r => r.status === 'pending').length;
    },
    enabled: user?.role === 'superadmin',
    refetchInterval: 60000, 
  });

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
    { icon: UserPlus, label: 'Trial Requests', path: '/superadmin/trial-requests' },
    { icon: Settings, label: 'Settings', path: '/superadmin/settings' },
  ];

  let menuItems = user?.role === 'superadmin' ? superadminMenuItems : adminMenuItems;

  if (user?.role === 'admin' && !isSubscriptionActive) {
    menuItems = adminMenuItems.filter(item =>
      ['Subscription', 'Settings'].includes(item.label)
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${isMobile ? `fixed inset-y-0 left-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}` : sidebarOpen ? 'w-64' : 'w-20'} bg-[#0f172a] text-white transition-all duration-300 flex flex-col shadow-xl z-20`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <ChefHat className="w-6 h-6 text-black" />
            </div>
            {sidebarOpen && <span className="font-black text-xl tracking-tighter uppercase">{user?.role === 'superadmin' ? 'ZenRestro' : 'Admin'}</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-green-500 text-black font-bold shadow-lg shadow-green-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={isActive ? 'text-black' : 'text-slate-500 group-hover:text-green-500'} />
                      {sidebarOpen && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
                    </div>
                    {sidebarOpen && item.label === 'Trial Requests' && pendingCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-red-500/20">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center font-black text-slate-300">{user?.name?.charAt(0)}</div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate text-slate-200">{user?.name}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{user?.role}</p>
                </div>
              </div>
            )}
            <button onClick={handleLogout} className="p-2 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-500 transition-colors" title="Logout"><LogOut size={22} /></button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <TrialBanner />
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><Menu size={22} /></button>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Restaurant</p>
              <p className="text-sm font-bold text-slate-700">{user?.restaurant?.name || 'ZenRestro HQ'}</p>
            </div>
            <button className="p-2 bg-slate-50 text-slate-400 hover:text-primary rounded-xl relative transition-all group">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 lg:p-10 bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
