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

      {/* Pricing Section - High-Contrast Redesign */}
      <section id="pricing" className="py-24 bg-[#0F172A] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold tracking-widest uppercase mb-6">
              One Price, Unlimited Access
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              One Simple Plan. <span className="text-green-500">No Hidden Fees.</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl">
              Get everything ZenRestro has to offer for one transparent cost. No per-order commissions. No hidden charges.
            </p>
          </div>

          <div className="max-w-xl mx-auto reveal-stagger delay-300">
            <div className="relative p-12 rounded-[2rem] bg-[#0B0B0B] border border-white/5 shadow-2xl overflow-hidden group hover:border-green-500/30 hover:scale-[1.01] transition-all duration-500">
              <div className="absolute top-0 right-0 bg-green-500 text-black text-[10px] font-extrabold px-6 py-2 rounded-bl-2xl uppercase tracking-[0.2em] shadow-lg">Recommended</div>
              
              <div className="space-y-2 mb-10">
                <h3 className="text-xl font-bold text-gray-400 uppercase tracking-[0.2em]">Ultimate POS</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-extrabold text-white tracking-tighter">₹5,999</span>
                  <span className="text-lg text-gray-500 font-bold uppercase tracking-widest">/Yearly</span>
                </div>
              </div>

              <div className="bg-green-500/10 text-green-500 py-4 px-6 rounded-2xl font-bold text-base mb-12 border border-green-500/20 text-center ring-1 ring-green-500/30">
                 + ₹20,000 One-time Expert Setup Fee
              </div>

              <div className="space-y-6 mb-12">
                <h4 className="text-gray-400 font-bold text-sm uppercase tracking-widest">Everything Included:</h4>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {[
                    'Unlimited Orders & Tokens',
                    'WhatsApp Reports & Billing',
                    'Full KDS & Inventory System',
                    '24/7 Phone Support',
                    'On-site Setup & Training',
                    'Automatic Future Updates'
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-300 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link 
                to="/login" 
                className="bg-green-500 hover:bg-green-600 active:scale-95 text-black font-bold py-6 rounded-2xl block w-full text-2xl shadow-xl shadow-green-500/20 transition-all text-center tracking-tight btn-shimmer"
              >
                Get Started Now
              </Link>
              
              <p className="text-center text-gray-500 text-xs mt-6 font-medium">
                No credit card required to start 14-day free trial.
              </p>
            </div>
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
