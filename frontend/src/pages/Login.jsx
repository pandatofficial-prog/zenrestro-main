import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Eye, EyeOff, Loader2, Phone, Mail } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto focus on email field
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user?.role === 'superadmin') {
        navigate('/superadmin');
      } else if (user) {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#f8fafc] to-[#e2e8f0] px-4 py-12 font-sans">
      <div className="w-full max-w-[400px] space-y-6">
        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 border border-white">
          {/* Top Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight leading-none">ZenRestro</h1>
            <p className="text-[13px] text-gray-600 font-semibold mt-2 tracking-wide">Smart Restaurant POS System</p>
          </div>

          {/* Message Area */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm flex items-start gap-3 animate-shake">
              <span className="font-bold shrink-0">Error:</span> {error}
            </div>
          )}

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onKeyDown={handleEmailKeyDown}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl border border-gray-300 bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none transition-all duration-200 placeholder:text-gray-400 text-gray-800"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs font-bold text-orange-600 hover:text-red-600 transition-colors uppercase tracking-wider"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-300 bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none transition-all duration-200 placeholder:text-gray-400 text-gray-800"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-[0_10px_20px_rgba(249,115,22,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 text-white font-black rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center space-y-3 px-4">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4 text-[12px] font-semibold text-gray-600 bg-white/50 py-2 px-4 rounded-full backdrop-blur-sm shadow-sm border border-white">
              <a href="tel:+918130325781" className="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
                <Phone size={14} className="text-orange-500" /> +91 81303 25781
              </a>
              <span className="text-gray-300">|</span>
              <a href="mailto:support@zenrestro.com" className="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
                <Mail size={14} className="text-orange-500" /> support@zenrestro.com
              </a>
            </div>
            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">
              &copy; 2026 ZenRestro. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
