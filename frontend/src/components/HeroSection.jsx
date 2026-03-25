import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Play } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden bg-gradient-to-b from-[#0B0B0B] to-[#0F172A]">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-green-500/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Content */}
        <div className="space-y-8 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Simple • Fast • Reliable
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
            Run Your Restaurant <span className="text-green-500">Faster</span> — Without Billing Mistakes
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-xl leading-relaxed">
            Take full control of your billing, table orders, and kitchen operations with the simplest POS built for busy Indian restaurants. No setup headaches, just results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link 
              to="/login" 
              className="bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl px-8 py-4 inline-flex items-center justify-center transition-all group"
            >
              Start 14-Day Free Trial
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/login" 
              className="bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/10 rounded-xl px-8 py-4 inline-flex items-center justify-center transition-all"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Book a Live Demo
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start pt-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Free On-site Setup
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              24/7 Phone Support
            </div>
          </div>
        </div>

        {/* Right Side: Dashboard Mockup */}
        <div className="relative group hidden md:block" style={{ perspective: '1000px' }}>
          <div className="relative z-10 bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-700 hover:rotate-0" style={{ transform: 'rotateY(-10deg) rotateX(5deg)' }}>
            {/* Mockup Header */}
            <div className="bg-[#0B0B0B] px-4 py-2 flex items-center gap-2 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              </div>
              <div className="mx-auto text-[10px] text-gray-500 font-mono tracking-widest">ZENRESTRO ADMIN CONSOLE</div>
            </div>
            
            {/* Mockup Content (Placeholder for Dashboard Image) */}
            <div className="p-4 bg-[#0F172A] min-h-[400px] flex items-center justify-center relative">
              <div className="space-y-6 w-full opacity-20">
                <div className="flex gap-4">
                  <div className="h-24 flex-1 bg-slate-800 rounded-lg animate-pulse" />
                  <div className="h-24 flex-1 bg-slate-800 rounded-lg animate-pulse" />
                  <div className="h-24 flex-1 bg-slate-800 rounded-lg animate-pulse" />
                </div>
                <div className="flex gap-4">
                  <div className="h-48 w-1/3 bg-slate-800 rounded-lg animate-pulse" />
                  <div className="h-48 w-2/3 bg-slate-800 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-green-500/20 text-green-400 px-6 py-3 rounded-lg border border-green-500/30 backdrop-blur-lg font-bold shadow-lg">
                  DASHBOARD PREVIEW
                </div>
              </div>
            </div>
          </div>
          
          {/* Mockup Soft Shadows & Glows */}
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
