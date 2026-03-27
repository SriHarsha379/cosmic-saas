'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Users,
  Trophy,
  Briefcase,
  ShieldCheck,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { hackathonService } from '@/services/hackathon.service';
import { userService } from '@/services/user.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function StatCard({ icon: Icon, title, value, color, gradient }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-gray-400">{title}</h3>
        <div className={`w-10 h-10 rounded-lg ${gradient} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: hackathons = [], isLoading: hackathonsLoading } = useQuery({
    queryKey: ['admin-hackathons'],
    queryFn: () => hackathonService.getAll(),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userService.listUsers(),
  });

  const isLoading = hackathonsLoading || usersLoading;

  const stats = [
    {
      title: 'Total Hackathons',
      value: hackathons.length,
      icon: Trophy,
      color: 'text-amber-400',
      gradient: 'bg-amber-500/10',
    },
    {
      title: 'Active Hackathons',
      value: hackathons.filter((h: any) => h.status === 'ACTIVE').length,
      icon: TrendingUp,
      color: 'text-emerald-400',
      gradient: 'bg-emerald-500/10',
    },
    {
      title: 'Total Users',
      value: Array.isArray(usersData) ? usersData.length : 0,
      icon: Users,
      color: 'text-blue-400',
      gradient: 'bg-blue-500/10',
    },
    {
      title: 'Admin',
      value: user?.firstName,
      icon: ShieldCheck,
      color: 'text-purple-400',
      gradient: 'bg-purple-500/10',
    },
  ];

  const quickActions = [
    {
      label: 'Create Hackathon',
      icon: Trophy,
      href: '/admin/hackathons/create',
      color: 'from-amber-600 to-orange-600',
    },
    {
      label: 'Manage Hackathons',
      icon: Trophy,
      href: '/admin/hackathons',
      color: 'from-purple-600 to-blue-600',
    },
    {
      label: 'Manage Users',
      icon: Users,
      href: '/admin/users',
      color: 'from-emerald-600 to-cyan-600',
    },
  ];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Welcome, {user?.firstName}. Manage the platform from here.
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/hackathons/create')}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300"
        >
          <Plus className="w-4 h-4" /> New Hackathon
        </button>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/10 border border-amber-500/20 rounded-2xl p-6 flex items-center gap-4">
        <ShieldCheck className="w-10 h-10 text-amber-400 flex-shrink-0" />
        <div>
          <h2 className="text-xl font-bold text-white">Super Admin Panel</h2>
          <p className="text-gray-400 text-sm mt-1">
            You have full administrative access. Use this panel to manage hackathons, users, and platform settings.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Actions & Recent Hackathons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map(({ label, icon: Icon, href, color }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className={`w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${color} text-white rounded-lg hover:shadow-lg transition-all font-medium`}
              >
                <Icon className="w-5 h-5" />
                {label}
                <ArrowRight className="w-4 h-4 ml-auto opacity-60" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Hackathons */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Recent Hackathons</h3>
            </div>
            <button
              onClick={() => router.push('/admin/hackathons')}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              View all
            </button>
          </div>

          {hackathons.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Trophy className="w-8 h-8 opacity-50 mx-auto mb-2" />
              <p className="text-sm">No hackathons yet</p>
              <button
                onClick={() => router.push('/admin/hackathons/create')}
                className="mt-3 text-sm text-purple-400 hover:text-purple-300"
              >
                Create your first hackathon →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {hackathons.slice(0, 5).map((h: any) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => router.push('/admin/hackathons')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{h.title}</p>
                      <p className="text-xs text-gray-500">
                        {h._count?.participants || 0} participants
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      h.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : h.status === 'COMPLETED'
                        ? 'bg-gray-500/20 text-gray-300'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
