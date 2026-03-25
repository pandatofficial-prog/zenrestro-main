import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { reportsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  Utensils,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Layout from '../components/Layout';

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // React Query Fetchers
  const { data: restaurant, isLoading: isRestaurantLoading } = useQuery({
    queryKey: ['restaurant', user.restaurantId],
    queryFn: async () => {
      const res = await api.get(`/restaurants/${user.restaurantId}`);
      return res.data;
    },
  });

  const { data: dashboardData, isLoading: isDataLoading, isRefetching } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const [summaryRes, todayRes, ordersRes, weeklyRes, topItemsRes] = await Promise.all([
        reportsAPI.getSummary(),
        ordersAPI.getTodayStats(),
        ordersAPI.getAll({ limit: 5 }),
        reportsAPI.getWeekly(),
        reportsAPI.getTopItems({ limit: 5 }),
      ]);
      setLastUpdated(new Date());
      return {
        stats: summaryRes.data,
        todayStats: todayRes.data,
        recentOrders: ordersRes.data.orders,
        weeklyData: weeklyRes.data?.dailyData || [],
        topItems: topItemsRes.data || [],
      };
    },
    refetchInterval: 15000, // Auto-refresh every 15 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => ordersAPI.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboardStats']);
    },
  });

  const handleStatusUpdate = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      preparing: 'badge-preparing',
      ready: 'badge-ready',
      delivered: 'badge-delivered',
      cancelled: 'badge-cancelled',
    };
    return badges[status] || 'badge-pending';
  };

  if (isDataLoading || isRestaurantLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-gray-500 animate-pulse text-sm font-bold uppercase tracking-widest">Optimizing Dashboard...</p>
        </div>
      </Layout>
    );
  }

  const { stats, todayStats, recentOrders, weeklyData, topItems } = dashboardData;
  const isExpired = restaurant?.subscriptionExpires && new Date(restaurant.subscriptionExpires) < new Date();
  const isTrial = restaurant?.subscriptionStatus === 'trial';

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {/* Alerts */}
        {isExpired && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3 text-red-800 font-bold">
              <AlertTriangle size={24} />
              <p>Subscription Expired! Please renew to avoid service interruption.</p>
            </div>
            <Link to="/admin/subscription" className="bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-bold">Renew Now</Link>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3 uppercase">
              Dashboard
              {isRefetching && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </h1>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Last synced: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => queryClient.invalidateQueries(['dashboardStats'])}
            className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all text-sm uppercase tracking-wider shadow-lg shadow-black/10"
          >
            <RefreshCw size={18} className={isRefetching ? 'animate-spin' : ''} />
            Instant Sync
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card icon={<ShoppingBag />} label="Today's Orders" value={todayStats?.totalOrders} accent="orange" sub={`${todayStats?.byType?.dine_in || 0} Dine In`} />
          <Card icon={<DollarSign />} label="Today's Revenue" value={formatCurrency(todayStats?.potentialRevenue)} accent="green" sub={`Paid: ${formatCurrency(todayStats?.paidRevenue)}`} />
          <Card icon={<Clock />} label="In Progress" value={(todayStats?.pendingOrders || 0) + (todayStats?.preparingOrders || 0)} accent="blue" sub={`${todayStats?.pendingOrders || 0} pending, ${todayStats?.preparingOrders || 0} prep`} />
          <Card icon={<AlertTriangle />} label="Low Stock" value={stats?.lowStockCount} accent="red" sub="Needs Attention" />
        </div>

        {/* Charts & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-widest mb-6">7-Day Revenue Trend</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickFormatter={(str) => {
                    const d = new Date(str);
                    return `${d.getDate()}/${d.getMonth()+1}`;
                  }} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                  <YAxis tickFormatter={(val) => `₹${val}`} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-widest mb-6">Top Items (Week)</h3>
            <div className="space-y-4">
              {topItems.length > 0 ? topItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xs">#{idx+1}</div>
                    <div>
                      <p className="font-bold text-slate-700 text-sm line-clamp-1">{item.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.quantity} sold</p>
                    </div>
                  </div>
                  <span className="font-black text-green-600 text-sm">{formatCurrency(item.revenue)}</span>
                </div>
              )) : <p className="text-center text-slate-400 text-sm py-12">No data yet.</p>}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-widest">Recent Orders</h3>
            <Link to="/admin/orders" className="text-green-600 font-bold text-xs uppercase tracking-widest hover:underline">View Ledger</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Order</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Table</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 font-black text-slate-800 text-sm">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-600 capitalize">{order.orderType.replace('_', ' ')}</td>
                    <td className="px-6 py-5 text-sm text-slate-600 font-black">{order.tableNumber || '--'}</td>
                    <td className="px-6 py-5 text-sm font-black text-slate-900">{formatCurrency(order.total)}</td>
                    <td className="px-6 py-5">
                      <select 
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className={`text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 border-none ring-1 ring-slate-100 ${getStatusBadge(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const Card = ({ icon, label, value, accent, sub }) => (
  <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm group hover:scale-[1.02] transition-all">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-3xl font-black text-slate-800 tracking-tighter">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xl shadow-${accent}-500/20 bg-${accent}-500`}>
        {icon}
      </div>
    </div>
    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{sub}</div>
  </div>
);

export default Dashboard;
