import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Play } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden bg-[#0F172A]">
      {/* Background Gradient Layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0B0B0B] via-[#0F172A] to-[#1E293B]" />
      
      {/* Accent Glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-green-500/10 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side: Content Overhaul */}
        <div className="space-y-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold tracking-wide uppercase">
            Built for Modern Indian Restaurants
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-white tracking-tight drop-shadow-sm reveal-stagger">
            Fastest Billing POS — <span className="text-green-500">Zero-Setup</span> Required
          </h1>

          <p className="text-gray-300 text-lg md:text-xl max-w-xl leading-relaxed mx-auto lg:mx-0 reveal-stagger delay-100">
            Effortlessly manage your billing, table orders, and kitchen operations with one simple interface. Built so you can start serving customers in minutes, not days.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start reveal-stagger delay-200">
            <Link 
              to="/request-trial" 
              className="bg-green-500 hover:bg-green-600 text-black font-bold text-lg rounded-2xl px-10 py-5 inline-flex items-center justify-center transition-all shadow-xl shadow-green-500/20 active:scale-95 btn-shimmer"
            >
              Start 14-Day Free Trial
              <ArrowRight className="w-6 h-6 ml-3" />
            </Link>
            
            <Link 
              to="/login" 
              className="bg-[#1E293B] hover:bg-[#2D3748] text-white font-bold text-lg border border-white/10 rounded-2xl px-10 py-5 inline-flex items-center justify-center transition-all shadow-xl shadow-black/20"
            >
              <Play className="w-5 h-5 mr-3 fill-current" />
              Book Live Demo
            </Link>
          </div>

          {/* Trust Elements Fix */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 justify-center lg:justify-start border-t border-white/5 pt-8">
            <div className="flex items-center gap-2.5 text-gray-400 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              10-Min Staff Training
            </div>
            <div className="flex items-center gap-2.5 text-gray-400 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Free On-site Setup
            </div>
            <div className="flex items-center gap-2.5 text-gray-400 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              No Credit Card Needed
            </div>
          </div>
        </div>

        {/* Right Side: High-Engagement Visual */}
        <div className="relative group perspective-1000">
          <div className="relative z-10 p-2 bg-gradient-to-tr from-white/10 to-transparent rounded-3xl backdrop-blur-3xl shadow-2xl overflow-hidden transform group-hover:rotate-x-0 transition-all duration-1000 hover:scale-[1.02] animate-float">
            {/* Real Product Screenshot Mockup Overlay */}
            <div className="bg-[#0B0B0B] rounded-2xl overflow-hidden border border-white/5">
                <div className="bg-[#111827] px-4 py-3 flex items-center justify-between border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/30" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/30" />
                    <div className="w-3 h-3 rounded-full bg-green-400/30" />
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-black px-3 py-1 rounded-full">LIVE PREVIEW: BILLING SCREEN</div>
                </div>
                
                {/* The Generated Screenshot Content */}
                <img 
                  src="/images/billing-preview.png" 
                  alt="ZenRestro Billing Dashboard Preview" 
                  className="w-full object-cover min-h-[450px]"
                />
            </div>
          </div>
          
          {/* Subtle Dynamic Glow Layer */}
          <div className="absolute -inset-1 bg-green-500/20 rounded-[3rem] blur-2xl group-hover:opacity-40 transition-opacity pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/10 rounded-full blur-[80px]" />
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
