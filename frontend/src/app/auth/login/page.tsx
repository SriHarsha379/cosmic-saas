'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Zap, Mail, Lock, Trophy, Users, BookOpen, Award } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

const features = [
  { icon: Trophy, label: 'Join Hackathons', desc: 'Compete & win prizes' },
  { icon: Users, label: 'Build Teams', desc: 'Collaborate & grow' },
  { icon: BookOpen, label: 'Take Tests', desc: 'Prove your skills' },
  { icon: Award, label: 'Earn Certificates', desc: 'Stand out from the crowd' },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authService.login(form);
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        login(data.token, data.user);
        toast.success('Welcome back!');
        setTimeout(() => router.push('/dashboard'), 500);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (decorative) ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative bg-gradient-to-br from-[#0D0B2A] via-[#0E1330] to-[#1A0B2E] p-12 overflow-hidden">
        {/* Background decorations */}
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div className="dots-bg absolute inset-0 opacity-40" />

        {/* Floating orbs */}
        <div className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full border border-purple-500/10 animate-spin-slow" />
        <div className="absolute top-1/3 left-1/2 w-96 h-96 rounded-full border border-blue-500/5 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '14s' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Cosmic SaaS</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-3">
              Your career,{' '}
              <span className="gradient-text">accelerated</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              The all-in-one platform to showcase your skills, compete in hackathons, and land your dream job.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="glass-card p-4 group">
                <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center mb-2.5">
                  <Icon className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer tagline */}
        <p className="relative z-10 text-xs text-gray-600">
          © 2024 Cosmic SaaS · Built for developers
        </p>
      </div>

      {/* ── Right panel (form) ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Mobile logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Cosmic SaaS</span>
        </div>

        <div className="w-full max-w-sm animate-slide-up">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back 👋</h1>
            <p className="text-gray-400">Sign in to continue to your dashboard</p>
          </div>

          <div className="glass-card p-8 border border-white/10">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
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
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/8 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Create one free →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
