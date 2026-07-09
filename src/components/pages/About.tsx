import React from 'react';
import { motion } from 'motion/react';
import { Activity, BarChart2, Cpu, ShieldAlert, Target, Zap } from 'lucide-react';

export function About() {
  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-blue-400" />,
      title: "Algorithmic Precision",
      desc: "Our terminal is built for quantitative rigor, moving beyond linear assumptions to model complex, stochastic realities in financial markets."
    },
    {
      icon: <Activity className="w-6 h-6 text-rose-400" />,
      title: "Institutional Backtesting",
      desc: "Test strategies over decades of historical data with deep insight into drawdowns, volatility clustering, and compound growth."
    },
    {
      icon: <Target className="w-6 h-6 text-emerald-400" />,
      title: "Tactical Overlays",
      desc: "Implement active rulesets based on momentum, relative strength, and cyclical valuations to dynamically adapt to regime changes."
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-orange-400" />,
      title: "Stress Testing",
      desc: "Go beyond historical data with Monte Carlo simulations, mapping out the probabilistic risk of ruin under extreme market outliers."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white pt-24 pb-32">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-semibold tracking-tighter mb-6 bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, #ffffff, #94a3b8)' }}
          >
            Engineering the Future of <br className="hidden md:block"/> Quantitative Allocation
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto"
          >
            Quantrih is an advanced analytical terminal designed to bring institutional-grade backtesting and risk modeling to modern investors.
          </motion.p>
        </div>

        {/* Mission */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
            <p className="text-slate-300 leading-relaxed mb-4 text-lg">
              We believe that robust portfolio construction shouldn't be limited to opaque hedge funds. Our goal is to democratize quantitative analysis by providing transparent, high-performance computing tools directly in your browser.
            </p>
            <p className="text-slate-300 leading-relaxed text-lg">
              Whether you are evaluating static asset allocation matrixes or developing dynamic momentum strategies, Quantrih provides the computational horsepower to validate your logic before risking capital.
            </p>
          </div>
          <div className="order-1 md:order-2 bg-[#0f172a]/50 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden">
             <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[80px] rounded-full"></div>
             <Zap className="w-16 h-16 text-blue-500 mb-6" />
             <h3 className="text-2xl font-semibold mb-2">Empowering Precision</h3>
             <p className="text-slate-400">Data-driven architecture for the modern quantitative allocator.</p>
          </div>
        </div>

        {/* Core Pillars */}
        <h2 className="text-3xl font-semibold mb-12 text-center">Core Capabilities</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="bg-[#0f172a]/40 border border-slate-800/60 p-8 rounded-3xl hover:bg-[#0f172a]/80 transition-colors">
              <div className="p-3 bg-[#0a0f1d] border border-slate-800 inline-block rounded-xl mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
