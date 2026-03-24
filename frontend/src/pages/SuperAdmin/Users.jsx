import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Trash2, Edit2, Plus, Search, Eye, EyeOff, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    restaurantId: '',
    isActive: true,
  });
  const [restaurants, setRestaurants] = useState([]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlRestaurantId = queryParams.get('restaurantId');
  const urlRole = queryParams.get('role');

  useEffect(() => {
    fetchUsers();
    fetchRestaurants();
    
    if (urlRestaurantId || urlRole) {
      setFormData(prev => ({
        ...prev,
        restaurantId: urlRestaurantId || '',
        role: urlRole || 'admin'
      }));
      setShowForm(true);
    }
  }, [location.search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/all-users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Mock data if API fails
      setUsers([
        {
          _id: '1',
          name: 'Demo Admin',
          email: 'admin@demo.com',
          role: 'admin',
          restaurantId: 'demo-restaurant',
          isActive: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/auth/users/${editingId}`, formData);
        alert('User updated successfully');
      } else {
        await api.post('/auth/register', formData);
        alert('User created successfully');
      }
      setFormData({ name: '', email: '', password: '', role: 'admin', restaurantId: '', isActive: true });
      setEditingId(null);
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      const message = error.response?.data?.message || 'Failed to save user';
      alert(message);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      restaurantId: user.restaurantId || '',
      isActive: user.isActive !== undefined ? user.isActive : true,
    });
    setEditingId(user._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/auth/users/${id}`);
        alert('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await api.put(`/auth/users/${id}/toggle-status`);
      setUsers(users.map(u => u._id === id ? { ...u, isActive: response.data.isActive } : u));
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to toggle status');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-2">Manage all platform users and admins</p>
          </div>
          <button
            onClick={() => {
              setFormData({ name: '', email: '', password: '', role: 'admin', restaurantId: '', isActive: true });
              setEditingId(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
          >
            <Plus size={20} />
            Add User
          </button>
          <button
            onClick={() => fetchUsers()}
            className="p-2 text-gray-400 hover:text-primary transition"
            title="Refresh Users"
          >
            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-col md:flex-row">
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
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Roles</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 border-2 border-primary">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingId}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Restaurant</label>
                <select
                  name="restaurantId"
                  value={formData.restaurantId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">None (Super Admin Access)</option>
                  {restaurants.map(r => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active Member (User can login)
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-orange-600 transition font-medium"
                >
                  {editingId ? 'Update User' : 'Create User'}
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

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Restaurant</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.restaurantId ? restaurants.find(r => r._id === user.restaurantId)?.name || 'N/A' : 'Platform'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight transition-all active:scale-95 ${
                            user.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                          }`}
                          title={`Click to ${user.isActive ? 'Deactivate' : 'Activate'}`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
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
                      No users found
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

export default Users;
