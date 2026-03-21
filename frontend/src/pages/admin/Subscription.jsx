import { useState, useEffect } from 'react';
import { CreditCard, Check, AlertCircle, Calendar, Zap, Shield, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Layout from '../../components/Layout';

const Subscription = () => {
  const { user, refreshUser } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly', 'half-yearly', 'annual'

  const plans = [
    {
      name: 'Free Trial',
      price: { monthly: '₹0', 'half-yearly': '₹0', 'annual': '₹0' },
      period: { monthly: '/ 7 days', 'half-yearly': '/ 7 days', 'annual': '/ 7 days' },
      features: ['Access to dashboard', 'Menu management', 'Basic inventory', 'Basic reporting', 'Max 50 orders total', '1 admin user', 'Email support only'],
      icon: Shield,
      color: 'gray',
      popular: false
    },
    {
      name: 'Basic',
      price: { monthly: '₹2499', 'half-yearly': '₹14499', 'annual': '₹29999' },
      period: { monthly: '/ month', 'half-yearly': '/ 6 months', 'annual': '/ year' },
      features: ['Unlimited orders', 'Inventory management', 'Menu management', 'Order & Billing system', 'Sales reports', 'Up to 3 admin users', 'Basic analytics', 'Email + Chat support (24hr)'],
      icon: Zap,
      color: 'blue',
      popular: true
    },
    {
      name: 'Premium',
      price: { monthly: '₹4999', 'half-yearly': '₹29499', 'annual': '₹59999' },
      period: { monthly: '/ month', 'half-yearly': '/ 6 months', 'annual': '/ year' },
      features: ['Everything in Basic', 'Unlimited users', 'Advanced analytics', 'Customer insights', 'Inventory automation', 'Custom branding', 'Priority feature updates', 'Dedicated account manager', 'Email, Chat + Phone support (6hr)'],
      icon: Crown,
      color: 'purple',
      popular: false
    }
  ];

  useEffect(() => {
    fetchSubscription();
    // Auto-refresh every 10 seconds to sync with Superadmin updates
    const interval = setInterval(() => {
      fetchSubscription();
      refreshUser();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await api.get(`/restaurants/${user.restaurantId}`);
      setRestaurant(response.data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setProcessing(true);
    try {
      const newExpiry = new Date();
      
      // Add time based on billing cycle
      if (billingCycle === 'monthly') {
        newExpiry.setMonth(newExpiry.getMonth() + 1);
      } else if (billingCycle === 'half-yearly') {
        newExpiry.setMonth(newExpiry.getMonth() + 6);
      } else if (billingCycle === 'annual') {
        newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      }

      await api.put(`/restaurants/${user.restaurantId}`, {
        subscriptionPlan: selectedPlan.name,
        subscriptionStatus: 'active',
        subscriptionExpires: newExpiry,
        billingCycle: billingCycle
      });

      alert(`Payment Successful! Your ${selectedPlan.name} plan is now active.`);
      setShowPaymentModal(false);
      await refreshUser();
      fetchSubscription();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
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

  const isExpired = new Date(restaurant?.subscriptionExpires) < new Date();

  return (
    <Layout>
      <div className="space-y-8 animate-fadeIn">
        {/* Current Status Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription & Billing</h1>
              <p className="text-gray-500">Manage your plan and billing information</p>
            </div>
            <div className={`px-6 py-3 rounded-xl flex items-center gap-3 ${
              isExpired ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'
            }`}>
              <div className={`w-3 h-3 rounded-full animate-pulse ${isExpired ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Current Status</p>
                <p className={`font-bold ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                  {restaurant?.subscriptionPlan || 'Free Trial'} - {isExpired ? 'Expired' : 'Active'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
              <Calendar className="text-primary" size={24} />
              <div>
                <p className="text-xs text-gray-500">Valid Until</p>
                <p className="font-bold">{new Date(restaurant?.subscriptionExpires).toLocaleDateString()}</p>
              </div>
            </div>
            {/* Add more info cards here if needed */}
          </div>

          {isExpired && (
            <div className="mt-6 bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <p className="text-sm text-red-700 font-medium">
                Your {restaurant?.subscriptionPlan} has expired. Please upgrade or renew your plan to continue using Aapki Rasoi without interruption.
              </p>
            </div>
          )}
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center my-8">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200 inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${billingCycle === 'monthly' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('half-yearly')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${billingCycle === 'half-yearly' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
            >
              6 Months
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${billingCycle === 'annual' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Annual <span className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">+1 Mo Free</span>
            </button>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = (restaurant?.subscriptionPlan || 'Free Trial') === plan.name;
            
            return (
              <div key={plan.name} className={`bg-white rounded-2xl shadow-lg p-8 border-2 transition-all duration-300 hover:-translate-y-2 relative ${
                plan.popular ? 'border-primary shadow-xl scale-105 z-10' : (isCurrent ? 'border-gray-900' : 'border-transparent hover:border-gray-200')
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                    Most Popular
                  </div>
                )}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  plan.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  plan.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price[billingCycle]}</span>
                  <span className="text-gray-500 font-medium">{plan.period[billingCycle]}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => plan.name !== 'Free Trial' && handlePay(plan)}
                  disabled={(isCurrent && !isExpired) || plan.name === 'Free Trial'}
                  className={`w-full py-4 rounded-xl font-bold transition-all border-2 ${
                    plan.name === 'Free Trial' 
                      ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                      : (plan.popular 
                          ? 'bg-primary border-primary text-white hover:bg-orange-600 hover:border-orange-600 shadow-lg shadow-orange-100' 
                          : 'bg-white border-gray-200 text-gray-900 hover:border-gray-900')
                  }`}
                >
                  {plan.name === 'Free Trial' ? 'Trial Plan' : (isCurrent && !isExpired ? 'Current Plan' : isCurrent ? 'Renew Plan' : 'Upgrade Now')}
                </button>
              </div>
            );
          })}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
              <div className="p-8 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 text-center">Checkout</h2>
                <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <div className="p-8">
                <div className="bg-gray-50 rounded-2xl p-6 mb-8 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Plan to activate</p>
                    <p className="text-xl font-bold text-gray-900">{selectedPlan?.name} ({billingCycle})</p>
                  </div>
                  <p className="text-2xl font-extrabold text-primary">{selectedPlan?.price[billingCycle]}</p>
                </div>
                
                <div className="space-y-4">
                  <p className="font-bold text-gray-900">Select Payment Method</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="flex flex-col items-center gap-3 p-6 border-2 border-primary rounded-2xl bg-orange-50 transition">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                        <CreditCard size={20} />
                      </div>
                      <span className="font-bold text-sm">Credit/Debit Card</span>
                    </button>
                    <button className="flex flex-col items-center gap-3 p-6 border-2 border-gray-100 rounded-2xl hover:bg-gray-50 transition grayscale active:grayscale-0">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-900">
                        <span className="font-bold">UPI</span>
                      </div>
                      <span className="font-bold text-sm">UPI Payment</span>
                    </button>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={processPayment}
                      disabled={processing}
                      className="w-full bg-dark text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                      {processing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        `Pay ${selectedPlan?.price[billingCycle]} Now`
                      )}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4 px-8">
                      By clicking "Pay Now", you agree to our Terms of Service and Privacy Policy. This is a secure 256-bit SSL encrypted payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Subscription;
