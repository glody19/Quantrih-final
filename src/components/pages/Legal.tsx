import React from 'react';
import { Shield } from 'lucide-react';

interface LegalProps {
  page: 'cookies' | 'privacy';
}

export function Legal({ page }: LegalProps) {
  const content = {
    cookies: {
      title: "Cookies Policy",
      icon: null,
      body: (
        <div className="space-y-6 text-text-3">
          <section>
            <h3 className="text-xl font-semibold text-text mb-3">What Are Cookies?</h3>
            <p>Cookies are small text files that are stored on your device when you visit our website. They help us ensure the platform functions correctly and analyze how users interact with our tools.</p>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold text-text mb-3">How We Use Cookies</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for the basic operation of the site, such as saving your theme preference and navigation state.</li>
              <li><strong>Analytics Cookies:</strong> Used to understand how users interact with our backtesting engines, helping us improve performance and user experience.</li>
              <li><strong>No Tracking:</strong> We do not use third-party advertising cookies, and we do not track your financial data across other websites.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-text mb-3">Managing Your Preferences</h3>
            <p>You can manage or delete cookies through your browser settings. However, disabling essential cookies may impact the functionality of our simulation tools.</p>
          </section>
        </div>
      )
    },
    privacy: {
      title: "Privacy Policy",
      icon: <Shield className="w-8 h-8 text-rose-500" />,
      body: (
        <div className="space-y-6 text-text-3">
          <section>
            <h3 className="text-xl font-semibold text-text mb-3">Data Collection</h3>
            <p>We respect your privacy. Quantrih is designed as a client-first application. Most of your portfolio configurations, allocations, and backtest parameters remain local to your browser session unless explicitly saved to an authenticated account.</p>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold text-text mb-3">Information We Collect</h3>
            <p>If you create an account, we collect standard authentication data (email address). We do not collect personal financial identifiers or sensitive banking information.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-text mb-3">Third-Party Services</h3>
            <p>We utilize external APIs for market data and authentication services. These providers have their own privacy policies governing data processing.</p>
          </section>
        </div>
      )
    }
  };

  const current = content[page] || content.privacy;

  return (
    <div className="min-h-screen bg-bg text-text pt-24 pb-32">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          {current.icon && (
            <div className="p-3 bg-surface-2 rounded-xl border border-border">
              {current.icon}
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight">{current.title}</h1>
        </div>
        
        <div className="bg-surface border border-border rounded-3xl p-8 md:p-12 shadow-sm">
          {current.body}
        </div>
      </div>
    </div>
  );
}
