import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subscription/admin/all');
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      alert('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status, expiryDate) => {
    const isExpired = new Date(expiryDate) < new Date();
    
    if (isExpired || status === 'expired') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
          <AlertCircle size={12} /> Expired
        </span>
      );
    }
    if (status === 'trial') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
          <Clock size={12} /> Trial
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
        <CheckCircle size={12} /> Active
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const totalRevenue = filteredSubscriptions.reduce((acc, sub) => acc + (sub.amount || 0), 0);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Billing</h1>
            <p className="text-gray-600 mt-2">Track SaaS revenue and restaurant subscription history</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Revenue</p>
              <p className="text-2xl font-black text-gray-900">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search restaurant or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="trial">Trial</option>
            </select>
          </div>
          <button
            onClick={fetchSubscriptions}
            className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition border border-gray-200"
          >
            <Calendar size={18} /> Refresh Data
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Restaurant & Owner</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan & Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubscriptions.length > 0 ? (
                  filteredSubscriptions.map((sub) => {
                    const isExpired = new Date(sub.expiryDate) < new Date();
                    return (
                      <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{sub.restaurantName}</span>
                            <span className="text-sm text-gray-500">{sub.ownerName}</span>
                            <span className="text-xs text-gray-400 font-mono">{sub.phoneNumber}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className={`font-bold ${sub.amount > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                              ₹{sub.amount}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded w-fit mt-1">
                              {sub.planName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(sub.paymentDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm ${isExpired ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                            {new Date(sub.expiryDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(sub.status, sub.expiryDate)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <CreditCard size={48} className="text-gray-200" />
                        <p>No subscription records found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Subscriptions;
