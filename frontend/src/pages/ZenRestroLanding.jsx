import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  CheckCircle2,
  Menu,
  X,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  TrendingUp
} from 'lucide-react';
import HeroSection from '../components/HeroSection';
import ProblemSection from '../components/ProblemSection';
import FeaturesSection from '../components/FeaturesSection';
import './ZenRestroLanding.css';

const ZenRestroLanding = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="zen-landing bg-[#0B0B0B] min-h-screen">
      {/* WhatsApp Button */}
      <a href="https://wa.me/919999999999" className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Contact">
        <MessageSquare className="w-6 h-6" />
      </a>

      {/* Nav */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container mx-auto px-6">
          <div className="nav-content flex justify-between items-center py-4">
            <div className="logo flex items-center gap-2">
              <span className="logo-icon bg-green-500 text-black px-2 py-1 rounded font-bold">ZR</span>
              <span className="logo-text text-white font-bold text-xl">ZenRestro</span>
            </div>

            <div className="nav-links desktop-only flex gap-8 items-center text-gray-400">
              <a href="#features" className="hover:text-green-500 transition-colors">Features</a>
              <a href="#problems" className="hover:text-green-500 transition-colors">Solutions</a>
              <a href="#pricing" className="hover:text-green-500 transition-colors">Pricing</a>
              <Link to="/login" className="text-white bg-green-500 hover:bg-green-600 px-5 py-2 rounded-lg font-bold transition-all">Get Started</Link>
            </div>

            <button className="mobile-menu-toggle md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu md:hidden bg-[#0B0B0B] p-6 flex flex-col gap-4 border-b border-white/5">
            <a href="#features" className="text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#problems" className="text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>Solutions</a>
            <a href="#pricing" className="text-gray-400" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
            <Link to="/login" className="bg-green-500 text-black font-bold px-4 py-2 rounded-lg text-center" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
          </div>
        )}
      </nav>

      <HeroSection />
      
      <ProblemSection />

      <FeaturesSection />

      {/* Dashboard Preview Overlay - Simplified Mockup */}
      <section className="dashboard-preview py-24 bg-[#0B0B0B]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Powerful Insights <span className="text-green-500">On Any Device</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">From large tablets to your own phone—ZenRestro adapts to your workflow flawlessly.</p>
          </div>

          <div className="max-w-5xl mx-auto rounded-3xl bg-white/5 border border-white/5 p-4 shadow-2xl overflow-hidden backdrop-blur-sm relative">
             <div className="bg-[#0B0B0B] p-4 flex items-center gap-4 rounded-t-2xl border-b border-white/5">
                <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500/30" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
                   <div className="w-3 h-3 rounded-full bg-green-500/30" />
                </div>
                <div className="text-[10px] text-gray-500 font-mono">ZENRESTRO_INTERFACE_PREVIEW.JSX</div>
             </div>
             <div className="bg-[#0F172A] p-12 min-h-[450px] flex flex-col items-center justify-center">
                <div className="text-center space-y-4">
                   <TrendingUp className="w-16 h-16 text-green-500 opacity-20 mx-auto" />
                   <p className="text-gray-500 font-bold uppercase tracking-[0.2em]">Product Showcase Mockup</p>
                </div>
                {/* Visual Decorative elements */}
                <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-green-500/10 rounded-full blur-[80px]" />
             </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#0B0B0B]">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">One Simple Plan. <span className="text-green-500">No Hidden Charges.</span></h2>
            <p className="text-gray-400 text-lg">Get everything ZenRestro has to offer with one transparent price.</p>
          </div>

          <div className="max-w-lg mx-auto p-12 rounded-[2.5rem] bg-white/5 border border-white/10 relative overflow-hidden group hover:border-green-500/30 transition-all shadow-2xl">
             <div className="absolute top-0 right-0 bg-green-500 text-black text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">Recommended</div>
             
             <h3 className="text-2xl font-bold text-gray-400 mb-2 uppercase tracking-widest">Ultimate POS</h3>
             <div className="text-6xl font-bold text-white mb-4">₹5,999<span className="text-lg text-gray-500 font-normal">/year</span></div>
             
             <div className="bg-green-500/10 text-green-500 py-3 rounded-2xl font-bold text-sm mb-10 border border-green-500/20">
                + ₹20,000 One-time Setup Fee
             </div>

             <ul className="space-y-5 text-left mb-12">
                <li className="flex items-center gap-4 text-gray-300">
                   <CheckCircle2 className="w-5 h-5 text-green-500" />
                   <span>Unlimited Orders & Tokens</span>
                </li>
                <li className="flex items-center gap-4 text-gray-300">
                   <CheckCircle2 className="w-5 h-5 text-green-500" />
                   <span>WhatsApp Billing & Reports</span>
                </li>
                <li className="flex items-center gap-4 text-gray-300">
                   <CheckCircle2 className="w-5 h-5 text-green-500" />
                   <span>Full KDS & Inventory System</span>
                </li>
                <li className="flex items-center gap-4 text-gray-300">
                   <CheckCircle2 className="w-5 h-5 text-green-500" />
                   <span>24/7 Priority Support</span>
                </li>
                <li className="flex items-center gap-4 text-gray-300">
                   <CheckCircle2 className="w-5 h-5 text-green-500" />
                   <span>On-site Setup & Training</span>
                </li>
             </ul>

             <Link to="/login" className="bg-green-500 hover:bg-green-600 text-black font-bold py-5 rounded-2xl block w-full text-xl shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02]">
                Get Started Now
             </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-[#0B0B0B]">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="logo flex items-center gap-2">
                <span className="logo-icon bg-green-500 text-black px-2 py-1 rounded font-bold">ZR</span>
                <span className="logo-text text-white font-bold text-xl">ZenRestro</span>
              </div>
              <p className="text-gray-500 max-w-sm text-lg leading-relaxed">The simplest POS software for modern Indian restaurants. Built for speed, designed for stability, loved by owners.</p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-green-500 hover:text-black transition-all"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-green-500 hover:text-black transition-all"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-green-500 hover:text-black transition-all"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-green-500 hover:text-black transition-all"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-bold uppercase tracking-widest text-sm">Product</h4>
              <ul className="space-y-4 text-gray-500">
                <li><a href="#features" className="hover:text-green-500 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-green-500 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Security</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-bold uppercase tracking-widest text-sm">Support</h4>
              <ul className="space-y-4 text-gray-500">
                <li><a href="#" className="hover:text-green-500 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-green-500 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm gap-4">
            <p>© 2024 ZenRestro. Made with ❤️ in India</p>
            <p>Proprietary SaaS Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ZenRestroLanding;
