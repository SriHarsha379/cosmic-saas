'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Trophy, Video, BookOpen, Wallet, ArrowRight, Plus, Zap } from 'lucide-react';
import StatsCard from '@/components/ui/StatsCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { activityService } from '@/services/activity.service';
import { walletService } from '@/services/wallet.service';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: walletService.get,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activityService.getAll(10),
  });

  const { data: progress } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const res = await api.get('/profile/progress');
      return res.data.data;
    },
  });

  const stats = [
    {
      title: 'Hackathons Joined',
      value: progress?.hackathonsJoined ?? 0,
      icon: <Trophy className="w-5 h-5 text-purple-400" />,
      change: 'Total competitions',
    },
    {
      title: 'Interviews Done',
      value: progress?.interviewsCompleted ?? 0,
      icon: <Video className="w-5 h-5 text-cyan-400" />,
      change: 'Practice sessions',
      gradient: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20',
    },
    {
      title: 'Tests Taken',
      value: progress?.testsCompleted ?? 0,
      icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
      change: 'Assessments completed',
      gradient: 'bg-gradient-to-br from-emerald-500/20 to-green-500/20',
    },
    {
      title: 'Wallet Balance',
      value: `$${(wallet?.balance ?? 0).toFixed(2)}`,
      icon: <Wallet className="w-5 h-5 text-amber-400" />,
      change: 'Available funds',
      gradient: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
    },
  ];

  const quickActions = [
    { label: 'Take a Test', icon: BookOpen, href: '/tests', color: 'from-purple-600 to-blue-600' },
    { label: 'Schedule Interview', icon: Video, href: '/interviews', color: 'from-cyan-600 to-blue-600' },
    { label: 'Join Hackathon', icon: Trophy, href: '/hackathons', color: 'from-emerald-600 to-cyan-600' },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/10 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <Zap className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Welcome back, {user?.firstName ?? 'there'}! 👋
          </h2>
        </div>
        <p className="text-gray-400 text-sm">
          Track your progress, join hackathons, and advance your career.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-purple-400" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            {quickActions.map(({ label, icon: Icon, href, color }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className={`w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${color} bg-opacity-20 border border-white/10 hover:border-white/20 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:shadow-lg`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                <ArrowRight className="w-4 h-4 ml-auto opacity-60" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">Recent Activity</h3>
          {activitiesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-3">
              {activities.slice(0, 6).map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(activity.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
