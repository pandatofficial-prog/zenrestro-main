import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ProblemSection = () => {
  const problems = [
    {
      issue: 'Billing delays during rush hour?',
      fix: 'Generate bills in just 2 clicks with our optimized interface.',
    },
    {
      issue: 'Orders getting lost between staff?',
      fix: 'Instant sync from table to kitchen via digital display.',
    },
    {
      issue: 'End-of-day math taking hours?',
      fix: 'Automated daily reports delivered straight to your WhatsApp.',
    }
  ];

  return (
    <section id="problems" className="py-24 bg-[#111827]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Running a restaurant is hard. <br/>
            <span className="text-green-500">Your software shouldn’t be.</span>
          </h2>
          <p className="text-gray-400 text-lg">
            We solved the messiest parts of daily operations so you can focus on your food, not your screen.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((p, idx) => (
            <div key={idx} className="group p-8 rounded-2xl bg-[#1E293B]/50 border border-white/5 hover:border-green-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{p.issue}</h3>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <p className="text-green-400 text-sm font-medium leading-relaxed">{p.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
