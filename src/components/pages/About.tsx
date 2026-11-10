import React from 'react';
import { motion } from 'motion/react';

export function About() {
  const features = [
    {
      title: "Algorithmic Precision",
      desc: "Our terminal is built for quantitative rigor, moving beyond linear assumptions to model complex, stochastic realities in financial markets."
    },
    {
      title: "Institutional Backtesting",
      desc: "Test strategies over decades of historical data with deep insight into drawdowns, volatility clustering, and compound growth."
    },
    {
      title: "Tactical Overlays",
      desc: "Implement active rulesets based on momentum, relative strength, and cyclical valuations to dynamically adapt to regime changes."
    },
    {
      title: "Stress Testing",
      desc: "Go beyond historical data with Monte Carlo simulations, mapping out the probabilistic risk of ruin under extreme market outliers."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-text pt-12 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-serif text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-text"
          >
            Engineering the Future of <br className="hidden md:block"/> Quantitative Allocation
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-xl text-text-3 max-w-2xl mx-auto"
          >
            Quantrih is an advanced analytical terminal designed to bring institutional-grade backtesting and risk modeling to modern investors.
          </motion.p>
        </div>

        {/* Mission */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
            <p className="text-text-2 leading-relaxed mb-4 text-lg">
              We believe that robust portfolio construction shouldn't be limited to opaque hedge funds. Our goal is to democratize quantitative analysis by providing transparent, high-performance computing tools directly in your browser.
            </p>
            <p className="text-text-2 leading-relaxed text-lg">
              Whether you are evaluating static asset allocation matrixes or developing dynamic momentum strategies, Quantrih provides the computational horsepower to validate your logic before risking capital.
            </p>
          </div>
          <div className="order-1 md:order-2 bg-surface-2 border border-border p-8 rounded-3xl relative overflow-hidden min-h-[220px] flex flex-col justify-center">
             
             <h3 className="text-2xl font-semibold mb-2">Empowering Precision</h3>
             <p className="text-text-3">Data-driven architecture for the modern quantitative allocator.</p>
          </div>
        </div>

        {/* Core Pillars */}
        <h2 className="text-3xl font-semibold mb-12 text-center">Core Capabilities</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="bg-white border border-border p-8 rounded-3xl hover:border-border-2 transition-colors">
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-text-3 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
