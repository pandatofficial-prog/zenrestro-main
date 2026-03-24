import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Check, AlertCircle, Calendar, Zap, Shield, Crown, ArrowUpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Layout from '../../components/Layout';

const Subscription = () => {
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await api.get('/subscription/status');
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!window.confirm('Upgrade to ZenRestro Plan for ₹4999 (15 Months)?')) return;
    
    setProcessing(true);
    try {
      await api.post('/subscription/upgrade');
      alert('Congratulations! Your ZenRestro Plan is now active for 15 months.');
      await refreshUser();
      fetchStatus();
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Upgrade failed. Please contact support.');
    } finally {
      setProcessing(false);
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

  const isExpired = status?.status === 'expired';
  const isActive = status?.status === 'active';

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest">
                Account Status
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                {isActive ? 'Subscription Active' : isExpired ? 'Subscription Expired' : 'Free Trial Active'}
              </h1>
              <p className="text-gray-500 text-lg max-w-md">
                Manage your billing, plan details, and premium access features.
              </p>
            </div>

            <div className={`p-8 rounded-3xl border-2 flex flex-col items-center gap-2 text-center min-w-[240px] ${
              isActive ? 'bg-green-50 border-green-200 text-green-700' :
              isExpired ? 'bg-red-50 border-red-200 text-red-700' :
              'bg-primary/10 border-primary/20 text-primary'
            }`}>
              {isActive ? (
                <Crown size={48} className="mb-2" />
              ) : isExpired ? (
                <AlertCircle size={48} className="mb-2" />
              ) : (
                <Zap size={48} className="mb-2" />
              )}
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                Current Plan
              </span>
              <span className="text-2xl font-black">
                {status?.plan === 'ZenRestro Plan' ? 'ZenRestro Plan' : '7-Day Free Trial'}
              </span>
              <span className="text-sm font-bold bg-white/50 px-3 py-1 rounded-full border border-current/10">
                Expires: {new Date(isActive ? status?.planExpiryDate : status?.trialExpiryDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* The ZenRestro Plan Card */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Why choose ZenRestro Plan?</h2>
              <p className="text-gray-500">Everything you need to run a modern digital restaurant.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Cloud-based Billing & POS',
                'Advanced Inventory Tracking',
                'Detailed Sales Reports',
                'Table & Order Management',
                'Multi-user Access',
                'Secure Data Backup'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-50 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-dark rounded-[2.5rem] shadow-2xl p-10 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[80px] -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-2">
                  <div className="inline-block bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-primary/20">
                    🎁 3 Months FREE
                  </div>
                  <h3 className="text-3xl font-black">ZenRestro Plan</h3>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-black text-primary">₹4999</span>
                    <span className="text-gray-400 font-bold">/year</span>
                  </div>
                  <p className="text-primary font-bold flex items-center gap-2">
                    <Calendar size={18} />
                    Total 15 Months Access
                  </p>
                </div>

                <ul className="space-y-4 py-4 border-y border-white/10">
                  <li className="flex items-center gap-3 text-gray-300 font-medium">
                    <Check size={18} className="text-primary" />
                    Complete POS Access
                  </li>
                  <li className="flex items-center gap-3 text-gray-300 font-medium">
                    <Check size={18} className="text-primary" />
                    Dedicated Support
                  </li>
                </ul>

                <button
                  onClick={handleUpgrade}
                  disabled={processing || isActive}
                  className={`w-full py-5 rounded-2xl font-black text-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
                    isActive 
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-orange-600 shadow-xl shadow-primary/20'
                  }`}
                >
                  {processing ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isActive ? (
                    <>
                      <Shield size={22} />
                      Active Plan
                    </>
                  ) : (
                    <>
                      <ArrowUpCircle size={22} />
                      Upgrade Now
                    </>
                  )}
                </button>
                
                <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                  Secure 256-bit SSL Payment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Shortcut */}
        <div className="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400">
              <Shield size={24} />
            </div>
            <div>
              <p className="font-bold text-gray-900 font-inter">Transparency first.</p>
              <p className="text-xs text-gray-500">Read our service and subscription policies.</p>
            </div>
          </div>
          <Link 
            to="/admin/policy" 
            className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:gap-3 transition-all underline underline-offset-4"
          >
            Read Our Policy
            <ArrowUpCircle className="rotate-90" size={14} />
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Subscription;
