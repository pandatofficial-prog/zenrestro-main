import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { restaurantsAPI } from '../services/api';
import Layout from '../components/Layout';
import { Save, Building, Phone, Mail, MapPin, CheckCircle, UserCircle, User, Lock } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    gstin: '',
  });

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    gstin: '',
    password: '',
  });

  const [isGstVerified, setIsGstVerified] = useState(false);

  useEffect(() => {
    if (user?.restaurant) {
      setForm({
        name: user.restaurant.name || '',
        address: user.restaurant.address || '',
        phone: user.restaurant.phone || '',
        email: user.restaurant.email || '',
        taxRate: user.restaurant.taxRate || 18,
        gstin: user.restaurant.gstin || '',
      });
      setIsGstVerified(user.restaurant.isGstVerified || false);
    }
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gstin: user.gstin || '',
        password: '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Promise.all([
        restaurantsAPI.update(user.restaurantId, form),
        api.put('/auth/profile', profile)
      ]);
      alert('Settings and Profile saved successfully!');
      setProfile(prev => ({ ...prev, password: '' }));
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`Failed to save settings: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark">Settings</h1>
            <p className="text-gray-500">Manage your restaurant and personal profile</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition shadow-lg disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Section */}
          <div className="card h-fit">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              My Account Profile
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <User size={14} /> Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Mail size={14} /> Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Phone size={14} /> Personal Phone
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Building size={14} /> Personal GST No.
                </label>
                <input
                  type="text"
                  value={profile.gstin}
                  onChange={(e) => setProfile({ ...profile, gstin: e.target.value.toUpperCase() })}
                  className="input uppercase"
                />
              </div>
              <div className="pt-2 border-t">
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Lock size={14} /> New Password
                </label>
                <input
                  type="password"
                  value={profile.password}
                  onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                  className="input"
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>
          </div>

          {/* Restaurant Information Section */}
          <div className="card h-fit">
            <h3 className="font-semibold text-lg mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                Restaurant Information
              </div>
              {isGstVerified && (
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle size={12} /> Verified
                </span>
              )}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">GSTIN</label>
                <input
                  type="text"
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                  className="input uppercase"
                  placeholder="22AAAAA0000A1Z5"
                />
                <p className="text-xs text-gray-500 mt-1">Your registered GST number</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) })}
                  className="input"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">GST rate for billing</p>
              </div>
            </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
