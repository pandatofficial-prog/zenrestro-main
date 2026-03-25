import React from 'react';
import { ShoppingBag, Clock, ChefHat, Database, TrendingUp, Zap } from 'lucide-react';

const FeaturesSection = () => {
  const featureCards = [
    {
      title: 'Billing POS',
      description: 'Bill customers in seconds. Supports GST, discounts, and multiple payment modes (UPI, Cash, Card).',
      icon: <ShoppingBag className="w-7 h-7" />
    },
    {
      title: 'Order Management',
      description: 'Digital KOTs. Track every table status on one screen. No more paper slips lost in the wind.',
      icon: <Clock className="w-7 h-7" />
    },
    {
      title: 'Kitchen Display (KDS)',
      description: 'Kitchen staff sees orders instantly. Reduce noise, reduce confusion, serve food faster.',
      icon: <ChefHat className="w-7 h-7" />
    },
    {
      title: 'Smart Inventory',
      description: 'Know your stock before it runs out. Get automated alerts when specific ingredients are low.',
      icon: <Database className="w-7 h-7" />
    },
    {
      title: 'Real-time Reports',
      description: 'Get daily sales summaries directly on your WhatsApp. No need to open the laptop.',
      icon: <TrendingUp className="w-7 h-7" />
    },
    {
      title: 'Lightning Performance',
      description: 'Sub-second processing. Works from anywhere, even on mobile or tablets.',
      icon: <Zap className="w-7 h-7" />
    }
  ];

  return (
    <section id="features" className="py-24 bg-[#0F172A]">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Everything You Need, <span className="text-green-500">Nothing You Don't.</span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl">
            Powerful features designed for utility and speed, not complexity. Built to scale your restaurant business efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featureCards.map((feature, idx) => (
            <div key={idx} className="group p-10 rounded-3xl bg-white/5 border border-white/5 hover:border-green-500/20 hover:bg-white/[0.07] transition-all">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-8 text-green-500 group-hover:bg-green-500 group-hover:text-black shadow-lg shadow-green-500/5 group-hover:shadow-green-500/20 transition-all">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
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
