import React from 'react';
import { ShoppingBag, Clock, ChefHat, Database, TrendingUp, Zap } from 'lucide-react';

const FeaturesSection = () => {
  const featureCards = [
    {
      title: 'Billing POS',
      description: 'Generate bills in seconds. Built-in support for GST, discounts, and all UPI payments.',
      icon: <ShoppingBag className="w-8 h-8" />
    },
    {
      title: 'Order Management',
      description: 'Track table status and digital KOTs instantly. Zero paper, zero confusion.',
      icon: <Clock className="w-8 h-8" />
    },
    {
      title: 'Kitchen Display',
      description: 'Direct kitchen-to-staff notifications. Reduce prep time by 30% during rush hour.',
      icon: <ChefHat className="w-8 h-8" />
    },
    {
      title: 'Smart Inventory',
      description: 'Automated stock alerts. Know exactly what to buy before you run out.',
      icon: <Database className="w-8 h-8" />
    },
    {
      title: 'Daily Reports',
      description: 'Get daily sales summaries delivered directly to your WhatsApp every night.',
      icon: <TrendingUp className="w-8 h-8" />
    },
    {
      title: 'Offline Mode',
      description: 'Internet down? No problem. Keep billing offline and sync automatically later.',
      icon: <Zap className="w-8 h-8" />
    }
  ];

  return (
    <section id="features" className="py-24 bg-[#0B0B0B]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-16 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold tracking-widest uppercase mb-6">
            Core Business Tools
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Everything You Need to <br/>
            <span className="text-green-500">Scale Your Restaurant.</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
            We removed the complicated enterprise features and kept only what actually helps you serve food faster and make more profit.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureCards.map((feature, idx) => (
            <div key={idx} className={`group p-10 rounded-2xl bg-[#0F172A] border border-white/5 hover:border-green-500/30 hover:bg-[#1E293B] transition-all duration-300 reveal-stagger delay-${(idx + 1) * 100}`}>
              <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center mb-8 text-black shadow-lg shadow-green-500/20 transform group-hover:-translate-y-1 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
