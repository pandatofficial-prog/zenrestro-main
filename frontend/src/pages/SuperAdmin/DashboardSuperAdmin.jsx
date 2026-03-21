import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building2, Users, TrendingUp, Activity } from 'lucide-react';
import { reportsAPI } from '../../services/api';
import Layout from '../../components/Layout';

const DashboardSuperAdmin = () => {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalAdmins: 0,
    totalOrders: 0,
    totalRevenue: 0,
    ordersToday: 0,
    recentOrders: [],
    recentRestaurants: [],
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchDashboardStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchDashboardStats(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      
      const response = await reportsAPI.getSuperSummary();
      const data = response.data;
      
      setStats({
        totalRestaurants: data.totalRestaurants,
        totalAdmins: data.totalAdmins, 
        totalOrders: data.totalOrders,
        totalRevenue: data.totalRevenue,
        ordersToday: data.ordersToday,
        recentOrders: data.recentOrders,
        recentRestaurants: data.recentRestaurants,
      });

      setChartData(data.chartData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <Icon size={40} color={color} className="opacity-20" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SuperAdmin Dashboard</h1>
          <p className="text-gray-600 mt-2">Platform overview and management</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Building2}
            title="Total Restaurants"
            value={stats.totalRestaurants}
            color="#FF6B35"
          />
          <StatCard
            icon={Users}
            title="Active Admins"
            value={stats.totalAdmins}
            color="#16C79A"
          />
          <StatCard
            icon={Activity}
            title="Total Orders (Today)"
            value={stats.ordersToday}
            color="#F59E0B"
          />
          <StatCard
            icon={TrendingUp}
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            color="#8B5CF6"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Orders Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#FF6B35" name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#16C79A" name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders Across Platform */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Platform Orders</h2>
              <span className="text-xs text-gray-400">Updates every 30s</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentOrders?.length > 0 ? (
                    stats.recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.restaurantId?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{order.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">No recent orders</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* New Restaurants */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recently Added Restaurants</h2>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {stats.recentRestaurants?.length > 0 ? (
                    stats.recentRestaurants.map((restaurant) => (
                      <li key={restaurant._id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                              <Building2 size={20} className="text-primary" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{restaurant.name}</p>
                            <p className="text-sm text-gray-500 truncate">{restaurant.address}</p>
                          </div>
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-4 text-center text-sm text-gray-500">No new restaurants</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/superadmin/restaurants"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition text-center"
            >
              <Building2 className="inline mb-2" size={24} color="#FF6B35" />
              <p className="font-semibold text-gray-900">Manage Restaurants</p>
              <p className="text-gray-600 text-sm">Add, edit or manage restaurants</p>
            </a>
            <a
              href="/superadmin/users"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition text-center"
            >
              <Users className="inline mb-2" size={24} color="#16C79A" />
              <p className="font-semibold text-gray-900">Manage Users</p>
              <p className="text-gray-600 text-sm">Manage admins and permissions</p>
            </a>
            <a
              href="/superadmin/reports"
              className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition text-center"
            >
              <TrendingUp className="inline mb-2" size={24} color="#F59E0B" />
              <p className="font-semibold text-gray-900">Platform Reports</p>
              <p className="text-gray-600 text-sm">View detailed analytics</p>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardSuperAdmin;
