import { useState, useEffect } from 'react';
import { Save, AlertCircle, User, Lock, Mail, Phone, Building2, UserCircle } from 'lucide-react';
import api from '../../services/api';
import Layout from '../../components/Layout';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    defaultTaxRate: 18,
    platformCharge: 2.5,
    minOrderValue: 100,
    maxOrderValue: 10000,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    platformName: 'ZenRestro',
    supportEmail: 'support@zenrestro.com',
    supportPhone: '+91-XXXXXXXXXX',
    platformGSTIN: '',
  });
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    gstin: '',
    password: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [settingsRes, profileRes] = await Promise.all([
        api.get('/settings'),
        api.get('/auth/me')
      ]);
      
      setSettings(prev => ({
        ...prev,
        ...settingsRes.data
      }));

      setProfile({
        name: profileRes.data.name || '',
        email: profileRes.data.email || '',
        phone: profileRes.data.phone || '',
        gstin: profileRes.data.gstin || '',
        password: '',
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await Promise.all([
        api.put('/settings', settings),
        api.put('/auth/profile', profile)
      ]);
      alert('Profile and Platform settings saved successfully');
      setProfile(prev => ({ ...prev, password: '' })); // Clear password field
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`Failed to save settings: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
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

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Platform & Profile Settings</h1>
            <p className="text-gray-600 mt-2">Manage your personal profile and global platform configuration</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition shadow-lg disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

        {/* My Profile Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UserCircle className="text-primary" size={24} />
              My Account Profile
            </h2>
            <p className="text-sm text-gray-500 mt-1">Manage your personal login credentials and identification</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User size={16} /> Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail size={16} /> Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone size={16} /> Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Building2 size={16} /> Personal/Business GST No.
                </label>
                <input
                  type="text"
                  value={profile.gstin}
                  onChange={(e) => setProfile({ ...profile, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none uppercase"
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <div className="max-w-md space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock size={16} /> Change Password
                </label>
                <input
                  type="password"
                  value={profile.password}
                  onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Enter new password to change"
                />
                <p className="text-xs text-gray-500 italic">Leave blank to keep current password</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow">
          {/* Platform Information */}
          <div className="border-b border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                  <input
                    type="text"
                    name="platformName"
                    value={settings.platformName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-semibold">Platform GSTIN</label>
                  <input
                    type="text"
                    name="platformGSTIN"
                    value={settings.platformGSTIN}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                    placeholder="Platform GST Number"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                    <input
                      type="email"
                      name="supportEmail"
                      value={settings.supportEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
                    <input
                      type="tel"
                      name="supportPhone"
                      value={settings.supportPhone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="border-b border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Financial Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Tax Rate (%)</label>
                  <input
                    type="number"
                    name="defaultTaxRate"
                    value={settings.defaultTaxRate}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default tax rate for all restaurants</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform Charge (%)</label>
                  <input
                    type="number"
                    name="platformCharge"
                    value={settings.platformCharge}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">Commission taken per order</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Value (₹)</label>
                  <input
                    type="number"
                    name="minOrderValue"
                    value={settings.minOrderValue}
                    onChange={handleInputChange}
                    min="0"
                    step="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Order Value (₹)</label>
                  <input
                    type="number"
                    name="maxOrderValue"
                    value={settings.maxOrderValue}
                    onChange={handleInputChange}
                    min="0"
                    step="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="border-b border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Notification Settings</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-gray-700">Enable Email Notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={settings.smsNotifications}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-gray-700">Enable SMS Notifications</span>
                </label>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="border-b border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">System Settings</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-gray-700">Maintenance Mode</span>
                </label>
                <p className="text-xs text-gray-500 ml-7">When enabled, only superadmins can access the platform</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={() => fetchSettings()}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Discard Changes
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Backup & Recovery */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Backup & Recovery</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium">
              Export Database Backup
            </button>
            <button className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium">
              View Backup History
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
