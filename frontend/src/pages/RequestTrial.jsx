import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { ChefHat, Phone, MapPin, Building2, User, CheckCircle2, ArrowRight, Loader2, Mail } from 'lucide-react';

const RequestTrial = () => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    phone: '',
    email: '',
    city: '',
    businessType: 'Restaurant'
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.restaurantName.trim()) return 'Restaurant name is required';
    if (!formData.ownerName.trim()) return 'Owner name is required';
    if (!formData.phone.trim() || formData.phone.length < 10) return 'Valid phone number is required';
    if (!formData.email.trim() || !formData.email.includes('@')) return 'Valid email is required';
    if (!formData.city.trim()) return 'City is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);

    try {
      // Ensure the endpoint matches what we expect
      await axios.post('http://localhost:5000/api/trial-requests', formData);
      setSuccess(true);
      toast.success('Request submitted successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-6 font-sans">
        <Toaster position="top-right" />
        <div className="max-w-md w-full bg-[#111111] border border-white/5 rounded-[2.5rem] p-12 text-center shadow-2xl animate-fadeIn">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Request Received!</h2>
          <p className="text-gray-400 font-medium leading-relaxed mb-10">
            Our expert team will contact you on <span className="text-white font-bold">{formData.phone}</span> within 2 hours to set up your account.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 text-green-500 font-bold hover:underline">
            Back to Home <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-6 font-sans selection:bg-green-500/30 overflow-hidden relative">
      <Toaster position="top-right" />
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-green-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Branding & Value Proposition */}
        <div className="hidden lg:block space-y-10 pr-12">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/20 group-hover:scale-110 transition-transform">
              <ChefHat className="text-black w-8 h-8" />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter uppercase">ZenRestro</span>
          </Link>

          <h2 className="text-6xl font-black text-white tracking-tight leading-[1.1]">
            Scale Your <br/><span className="text-green-500">Restaurant</span> Faster.
          </h2>
          
          <div className="space-y-8">
            <BenefitItem icon={<CheckCircle2/>} title="Zero-Setup Infrastructure" desc="We handle the heavy lifting. Your account will be live in 15 mins." />
            <BenefitItem icon={<CheckCircle2/>} title="WhatsApp Daily Reports" desc="Wake up to your sales data directly on your phone." />
            <BenefitItem icon={<CheckCircle2/>} title="24/7 Priority Support" desc="Never worry about tech issues during your peak hours." />
          </div>

          <div className="flex items-center gap-4 p-6 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-3xl">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0B0B0B] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white uppercase">{i}</div>)}
            </div>
            <p className="text-gray-400 text-sm font-bold tracking-tight">Joined by 450+ restaurants from India this month.</p>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="bg-[#111111] border border-white/10 rounded-[2.5rem] p-8 md:p-14 shadow-2xl relative overflow-hidden group">
          {/* Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 blur-[100px] pointer-events-none group-hover:bg-green-500/30 transition-all" />
          
          <div className="mb-12">
            <div className="lg:hidden mb-10 flex justify-center">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-xl shadow-green-500/20">
                <ChefHat className="text-black w-7 h-7" />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 text-center lg:text-left">Request Trial</h1>
            <p className="text-gray-400 font-medium text-sm md:text-lg text-center lg:text-left">Fill details and we'll set up your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <InputField icon={<Building2 />} label="Restaurant Name" name="restaurantName" value={formData.restaurantName} onChange={handleChange} placeholder="e.g. Royal Cafe" required />
              <InputField icon={<User />} label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="e.g. John Doe" required />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField icon={<Phone />} label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. +91 98765..." required />
              <InputField icon={<Mail />} label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. john@example.com" required />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InputField icon={<MapPin />} label="City" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" required />
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] ml-2">Business Type</label>
                <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full bg-[#0B0B0B] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold hover:border-green-500/30 transition-all outline-none cursor-pointer appearance-none">
                  <option value="Cafe">Cafe</option>
                  <option value="Restaurant">Restaurant</option>
                  <option value="Cloud Kitchen">Cloud Kitchen</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black font-black text-xl rounded-3xl shadow-2xl shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-4 mt-6 btn-shimmer"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Submit Request <ArrowRight/></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const BenefitItem = ({ icon, title, desc }) => (
  <div className="flex gap-5 group">
    <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-black transition-all">
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
      <p className="text-gray-500 font-medium text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const InputField = ({ label, icon, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] ml-2">{label}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <input
        {...props}
        className="w-full bg-[#0B0B0B] border border-white/5 rounded-2xl pl-14 pr-5 py-4 text-white font-bold focus:border-green-500 focus:ring-1 focus:ring-green-500/20 outline-none transition-all placeholder:text-gray-700"
      />
    </div>
  </div>
);

export default RequestTrial;
