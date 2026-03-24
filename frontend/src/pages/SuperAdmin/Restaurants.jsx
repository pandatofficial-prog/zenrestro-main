import { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, Search, CheckCircle, RefreshCw, Utensils, UserPlus, FileText } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    taxRate: 18,
    subscriptionPlan: 'Free Trial',
    subscriptionStatus: 'trial',
    subscriptionExpires: new Date(+new Date() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    gstin: '',
    isGstVerified: false,
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      alert('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/restaurants/${editingId}`, formData);
        alert('Restaurant updated successfully');
      } else {
        await api.post('/restaurants', formData);
        alert('Restaurant created successfully');
      }
      setFormData({ 
        name: '', 
        address: '', 
        phone: '', 
        email: '', 
        taxRate: 18,
        subscriptionPlan: 'Free Trial',
        subscriptionStatus: 'trial',
        subscriptionExpires: new Date(+new Date() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        gstin: '',
        isGstVerified: false,
      });
      setEditingId(null);
      setShowForm(false);
      fetchRestaurants();
    } catch (error) {
      console.error('Error saving restaurant:', error);
      alert('Failed to save restaurant');
    }
  };

  const handleEdit = (restaurant) => {
    setFormData({
      ...restaurant,
      subscriptionExpires: restaurant.subscriptionExpires ? new Date(restaurant.subscriptionExpires).toISOString().split('T')[0] : '',
      gstin: restaurant.gstin || '',
      isGstVerified: restaurant.isGstVerified || false,
    });
    setEditingId(restaurant._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await api.delete(`/restaurants/${id}`);
        alert('Restaurant deleted successfully');
        fetchRestaurants();
      } catch (error) {
        console.error('Error deleting restaurant:', error);
        alert('Failed to delete restaurant');
      }
    }
  };

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restaurants Management</h1>
            <p className="text-gray-600 mt-2">Create and manage all restaurants on the platform</p>
          </div>
          <button
            onClick={() => {
              setFormData({ 
                name: '', 
                address: '', 
                phone: '', 
                email: '', 
                taxRate: 18,
                subscriptionPlan: 'Free Trial',
                subscriptionStatus: 'trial',
                subscriptionExpires: new Date(+new Date() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                gstin: '',
                isGstVerified: false,
              });
              setEditingId(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            <Plus size={20} />
            Add Restaurant
          </button>
          <button
            onClick={() => fetchRestaurants()}
            className="p-2 text-gray-400 hover:text-primary transition"
            title="Refresh Restaurants"
          >
            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 border-2 border-primary">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Restaurant' : 'Add New Restaurant'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {/* Subscription Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                  <select
                    name="subscriptionPlan"
                    value={formData.subscriptionPlan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Free Trial">Free Trial</option>
                    <option value="ZenRestro Plan">ZenRestro Plan</option>
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="subscriptionStatus"
                    value={formData.subscriptionStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="trial">Trialing</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    name="subscriptionExpires"
                    value={formData.subscriptionExpires}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {/* GST Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    name="isGstVerified"
                    id="isGstVerified"
                    checked={formData.isGstVerified}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="isGstVerified" className="text-sm font-medium text-gray-700">GST Verified</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-orange-600 transition font-medium"
                >
                  {editingId ? 'Update Restaurant' : 'Create Restaurant'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Restaurants Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plan</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Expiry</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRestaurants.length > 0 ? (
                  filteredRestaurants.map(restaurant => (
                    <tr key={restaurant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span>{restaurant.name}</span>
                          {restaurant.isGstVerified && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md w-fit font-bold flex items-center gap-1 mt-1">
                              <CheckCircle size={10} /> VERIFIED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{restaurant.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          restaurant.subscriptionStatus === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' :
                          restaurant.subscriptionStatus === 'Trial' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {restaurant.subscriptionStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          restaurant.subscriptionPlan === 'ZenRestro Plan' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                          'bg-gray-50 text-gray-600 border border-gray-100'
                        }`}>
                          {restaurant.subscriptionPlan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium">
                            {restaurant.planExpiryDate ? new Date(restaurant.planExpiryDate).toLocaleDateString() : 
                             restaurant.trialExpiryDate ? new Date(restaurant.trialExpiryDate).toLocaleDateString() : 
                             new Date(restaurant.subscriptionExpires).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {restaurant.planExpiryDate ? 'Plan Exp' : 'Trial Exp'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => window.location.href = `/superadmin/users?restaurantId=${restaurant._id}&role=admin`}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                          title="Create Admin for this Restaurant"
                        >
                          <UserPlus size={16} /> Admin
                        </button>
                        <button
                          onClick={() => handleEdit(restaurant)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(restaurant._id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No restaurants found
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

export default Restaurants;
