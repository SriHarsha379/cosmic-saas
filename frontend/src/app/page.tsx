'use client';
import Link from 'next/link';

const features = [
  { icon: '🏆', title: 'Hackathon Management', desc: 'Run end-to-end hackathons with team formation, submissions, and leaderboards.' },
  { icon: '🎤', title: 'AI-Powered Interviews', desc: 'Schedule and conduct AI-proctored interviews with real-time scoring.' },
  { icon: '📝', title: 'Test Galaxy', desc: 'Dynamic MCQ, coding, and essay assessments with instant certificates.' },
  { icon: '💰', title: 'Wallet & Rewards', desc: 'Built-in wallet system with transaction history and gamified rewards.' },
];

const stats = [
  { value: '10,000+', label: 'Students Assessed' },
  { value: '500+', label: 'Hackathons Hosted' },
  { value: '99%', label: 'Uptime SLA' },
  { value: '50+', label: 'Institutions' },
];

const plans = [
  { name: 'Starter', price: '₹4,999', period: '/mo', features: ['Up to 500 students', '5 Hackathons/mo', 'Basic Assessments', 'Email Support'], highlight: false },
  { name: 'Pro', price: '₹14,999', period: '/mo', features: ['Up to 5,000 students', 'Unlimited Hackathons', 'AI Interviews', 'Priority Support', 'Custom Branding'], highlight: true },
  { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited students', 'Dedicated server', 'SSO & Integrations', '24/7 SLA', 'On-premise option'], highlight: false },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0E27]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            🚀 Cosmic
          </span>
          <div className="hidden md:flex gap-8 text-sm text-gray-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition">Log in</Link>
            <a href="#contact" className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 rounded-lg transition">Request Demo</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block px-4 py-1 mb-6 text-xs font-semibold text-purple-300 bg-purple-900/30 border border-purple-500/30 rounded-full">
            Trusted by 50+ Institutions
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Run Hackathons.{' '}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Hire Smarter.
            </span>{' '}
            Test Better.
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Cosmic is the all-in-one SaaS platform for institutions to manage hackathons,
            conduct AI-powered interviews, and run assessments — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#contact" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 rounded-xl font-semibold text-lg transition">
              Request a Demo →
            </a>
            <Link href="/auth/login" className="px-8 py-4 border border-white/20 hover:border-white/40 rounded-xl font-semibold text-lg transition">
              Try it Free
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/10 bg-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">{s.value}</div>
              <div className="text-gray-400 mt-1 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Everything your institution needs</h2>
          <p className="text-gray-400 text-center mb-16">One platform. Zero complexity.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 mb-16">No hidden fees. Cancel anytime.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.name} className={`p-8 rounded-2xl border ${plan.highlight ? 'border-purple-500 bg-purple-900/20' : 'border-white/10 bg-white/5'}`}>
                {plan.highlight && <div className="text-xs text-purple-300 font-semibold mb-4 uppercase tracking-wider">Most Popular</div>}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-1">{plan.price}<span className="text-lg text-gray-400">{plan.period}</span></div>
                <ul className="mt-6 space-y-3 text-sm text-gray-300 text-left">
                  {plan.features.map((f) => <li key={f}>✅ {f}</li>)}
                </ul>
                <a href="#contact" className={`mt-8 block text-center py-3 rounded-xl font-semibold transition ${plan.highlight ? 'bg-purple-600 hover:bg-purple-500' : 'border border-white/20 hover:border-white/40'}`}>
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Request a Demo</h2>
          <p className="text-gray-400 text-center mb-10">We will get back to you within 24 hours.</p>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Thanks! We will contact you shortly.'); }}>
            <input required type="text" placeholder="Institution Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none text-white placeholder-gray-500" />
            <input required type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none text-white placeholder-gray-500" />
            <input required type="email" placeholder="Work Email" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none text-white placeholder-gray-500" />
            <input type="tel" placeholder="Phone Number" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none text-white placeholder-gray-500" />
            <select className="w-full px-4 py-3 rounded-xl bg-[#0A0E27] border border-white/10 focus:border-purple-500 outline-none text-gray-300">
              <option>Number of Students</option>
              <option>Under 500</option>
              <option>500 - 2,000</option>
              <option>2,000 - 10,000</option>
              <option>10,000+</option>
            </select>
            <textarea placeholder="What are you looking for?" rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none text-white placeholder-gray-500 resize-none" />
            <button type="submit" className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 rounded-xl font-semibold text-lg transition">
              Submit Request
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/10 text-center text-gray-500 text-sm">
        <div className="flex justify-center gap-6 mb-4">
          <a href="https://linkedin.com" target="_blank" className="hover:text-white transition">LinkedIn</a>
          <a href="https://twitter.com" target="_blank" className="hover:text-white transition">Twitter / X</a>
          <a href="mailto:hello@cosmic.dev" className="hover:text-white transition">hello@cosmic.dev</a>
        </div>
        <p>© 2026 Cosmic SaaS. All rights reserved.</p>
      </footer>
    </div>
  );
}
