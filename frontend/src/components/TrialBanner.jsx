import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowUpCircle, Clock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const TrialBanner = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

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

  if (loading || !status || user?.role !== 'admin' || status.status === 'active') {
    return null;
  }

  const isExpired = status.status === 'expired';

  return (
    <div className={`w-full px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-sm font-medium animate-fadeIn ${
      isExpired 
        ? 'bg-red-600 text-white' 
        : 'bg-orange-500 text-white shadow-md'
    }`}>
      <div className="flex items-center gap-2">
        {isExpired ? (
          <AlertCircle size={18} className="animate-pulse" />
        ) : (
          <Clock size={18} />
        )}
        <span>
          {isExpired 
            ? 'Your trial has expired. Access to core features is restricted.' 
            : `7 Days Free Trial Active - ${status.daysLeft} days remaining`}
        </span>
      </div>
      
      <button
        onClick={() => navigate('/admin/subscription')}
        className={`px-4 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
          isExpired
            ? 'bg-white text-red-600 hover:bg-gray-100'
            : 'bg-white text-orange-600 hover:bg-gray-100 shadow-sm'
        }`}
      >
        <ArrowUpCircle size={14} />
        Upgrade to ₹4999 Plan
      </button>
    </div>
  );
};

export default TrialBanner;
