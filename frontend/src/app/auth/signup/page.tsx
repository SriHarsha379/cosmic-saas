'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Zap, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

const perks = [
  'Access 50+ skill assessments',
  'Join hackathons & win prizes',
  'Build your public portfolio',
  'Connect with top companies',
];

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      const data = await authService.signup(form);
      login(data.token, data.user);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ──────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] relative bg-gradient-to-br from-[#0D0B2A] via-[#0E1330] to-[#1A0B2E] p-12 overflow-hidden">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="dots-bg absolute inset-0 opacity-40" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Cosmic SaaS</span>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              Start your journey{' '}
              <span className="gradient-text">today</span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed">
              Join thousands of developers leveling up their careers on Cosmic SaaS.
            </p>
          </div>

          <div className="space-y-3">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-sm text-gray-300">{perk}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['P','M','A','J'].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 border-2 border-[#0E1330] flex items-center justify-center text-xs font-bold text-white">
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-white">2,000+ developers</p>
                <p className="text-xs text-gray-500">already on the platform</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-gray-600">
          © 2024 Cosmic SaaS · Free to join
        </p>
      </div>

      {/* ── Right panel (form) ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Cosmic SaaS</span>
        </div>

        <div className="w-full max-w-sm animate-slide-up">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create account 🚀</h1>
            <p className="text-gray-400">Join the platform and start your journey</p>
          </div>

          <div className="glass-card p-8 border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      required
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="John"
                      className="cosmic-input pl-9 pr-3 py-2.5"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Doe"
                    className="cosmic-input py-2.5"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="cosmic-input pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="cosmic-input pl-10 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password strength */}
                {form.password && (
                  <div className="mt-2">
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${
                          form.password.length >= 10
                            ? 'bg-emerald-500 w-full'
                            : form.password.length >= 6
                            ? 'bg-amber-500 w-2/3'
                            : 'bg-red-500 w-1/3'
                        }`}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${
                      form.password.length >= 10 ? 'text-emerald-400' : form.password.length >= 6 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {form.password.length >= 10 ? 'Strong password' : form.password.length >= 6 ? 'Acceptable password' : 'Too short'}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 mt-1"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : 'Create Free Account'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/8 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Sign in →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
