'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Trophy, Users, Award,
  Zap, ArrowRight, Activity, TrendingUp,
  Clock, Sparkles,
} from 'lucide-react';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';

function StatCard({ icon: Icon, title, value, color, gradient, delta }: any) {
  return (
    <div className={`glass-card p-5 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color.bg}`}>
            <Icon className={`w-4 h-4 ${color.text}`} />
          </div>
        </div>
        <p className="text-3xl font-bold text-white tabular-nums">{value ?? 0}</p>
        {delta !== undefined && (
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {delta}
          </p>
        )}
      </div>
    </div>
  );
}

const activityTypeColors: Record<string, string> = {
  TEST_COMPLETED:    'bg-blue-500/20 text-blue-400',
  JOINED_HACKATHON: 'bg-amber-500/20 text-amber-400',
  CERTIFICATE:      'bg-emerald-500/20 text-emerald-400',
  TEAM_JOINED:      'bg-purple-500/20 text-purple-400',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => userService.getProfile(),
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      try {
        const res = await api.get('/activities');
        return Array.isArray(res.data.data) ? res.data.data : [];
      } catch {
        return [];
      }
    },
  });

  const stats = [
    { title: 'Hackathons Joined', value: profile?.hackathonsJoined ?? 0, icon: Trophy,   color: { bg: 'bg-amber-500/15',  text: 'text-amber-400'  }, gradient: 'bg-gradient-to-br from-amber-500/5 to-transparent' },
    { title: 'Teams',             value: profile?.teamsCount ?? 0,        icon: Users,    color: { bg: 'bg-purple-500/15', text: 'text-purple-400' }, gradient: 'bg-gradient-to-br from-purple-500/5 to-transparent' },
    { title: 'Tests Completed',   value: profile?.testsCompleted ?? 0,    icon: BookOpen, color: { bg: 'bg-blue-500/15',   text: 'text-blue-400'   }, gradient: 'bg-gradient-to-br from-blue-500/5 to-transparent' },
    { title: 'Certificates',      value: profile?.certificatesCount ?? 0, icon: Award,    color: { bg: 'bg-emerald-500/15',text: 'text-emerald-400'}, gradient: 'bg-gradient-to-br from-emerald-500/5 to-transparent' },
  ];

  const quickActions = [
    { label: 'Take a Test',    icon: BookOpen, href: '/tests',     color: 'from-purple-600 to-blue-600',   shadow: 'shadow-purple-500/25' },
    { label: 'Join Hackathon', icon: Trophy,   href: '/hackathons', color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
    { label: 'Create Team',    icon: Users,    href: '/teams',     color: 'from-emerald-600 to-cyan-600',  shadow: 'shadow-emerald-500/25' },
  ];

  if (profileLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Hero banner */}
      <div className="page-hero relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">{greeting}</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Hey, {user?.firstName || 'there'} 👋
            </h1>
            <p className="text-gray-400">Here's what's happening with your account today.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Actions + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick Actions */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h3 className="text-base font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            {quickActions.map(({ label, icon: Icon, href, color, shadow }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r ${color} text-white rounded-xl hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all font-medium text-sm shadow-lg ${shadow}`}
              >
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                {label}
                <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
              </button>
            ))}
          </div>

          {/* Mini leaderboard CTA */}
          <button
            onClick={() => router.push('/leaderboard')}
            className="w-full mt-3 flex items-center gap-3 px-4 py-3 bg-white/4 hover:bg-white/8 border border-white/8 rounded-xl transition-all text-sm font-medium text-gray-300 hover:text-white"
          >
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            View Leaderboard
            <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
          </button>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-semibold text-white">Recent Activity</h3>
            </div>
            {activities.length > 0 && (
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                {activities.length} events
              </span>
            )}
          </div>

          {activitiesLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : activities.length > 0 ? (
            <div className="space-y-2">
              {activities.slice(0, 6).map((activity: any, idx: number) => {
                const colorClass = activityTypeColors[activity.type] || 'bg-gray-500/20 text-gray-400';
                return (
                  <div
                    key={activity.id || activity._id || idx}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/4 transition-all group"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorClass}`}>
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 leading-snug">{activity.description || 'Activity'}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <Activity className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-400">No activity yet</p>
              <p className="text-xs text-gray-600 mt-1">Start a test or join a hackathon to see events here.</p>
              <button
                onClick={() => router.push('/tests')}
                className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                Take your first test <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
