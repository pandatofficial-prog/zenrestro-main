import { useState } from 'react';
import { ChefHat, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-dark">Forgot Password?</h1>
            <p className="text-gray-500 mt-1">Enter your email to reset your password</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@restaurant.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {resetToken && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs font-bold text-blue-700 mb-2 uppercase">Demo Mode: Reset Link</p>
              <Link 
                to={`/reset-password?token=${resetToken}`}
                className="text-sm text-blue-600 hover:underline break-all"
              >
                Click here to reset your password
              </Link>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-primary hover:text-orange-600 font-medium transition">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
