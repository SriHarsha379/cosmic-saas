'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Trophy,
  Users,
  Award,
  Zap,
  ArrowRight,
  Activity,
  Search,
} from 'lucide-react';
import { userService } from '@/services/user.service';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';

function StatsCard({ icon: Icon, title, value, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-gray-400">{title}</h3>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

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
    {
      title: 'Hackathons Joined',
      value: profile?.hackathonsJoined || 0,
      icon: Trophy,
      color: 'text-amber-400',
    },
    {
      title: 'Teams',
      value: profile?.teamsCount || 0,
      icon: Users,
      color: 'text-purple-400',
    },
    {
      title: 'Tests Completed',
      value: profile?.testsCompleted || 0,
      icon: BookOpen,
      color: 'text-blue-400',
    },
    {
      title: 'Certificates',
      value: profile?.certificatesCount || 0,
      icon: Award,
      color: 'text-emerald-400',
    },
  ];

  const quickActions = [
    { label: 'Take a Test', icon: BookOpen, href: '/tests', color: 'from-purple-600 to-blue-600' },
    { label: 'Join Hackathon', icon: Trophy, href: '/hackathons', color: 'from-emerald-600 to-cyan-600' },
    { label: 'Create Team', icon: Users, href: '/teams', color: 'from-pink-600 to-rose-600' },
  ];

  if (profileLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Overview</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.firstName || 'there'}!</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-gray-500 outline-none text-sm w-32"
            />
          </div>
          <button className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all">
            <Zap className="w-5 h-5 text-yellow-400" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg hover:shadow-purple-500/20 transition-all">
            {user?.firstName?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/10 border border-purple-500/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.firstName}! 👋</h2>
        <p className="text-gray-400">Here's your progress overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
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

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          </div>

          {activitiesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity: any, idx: number) => (
                <div
                  key={activity.id || activity._id || idx}
                  className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{activity.description || 'Activity'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.createdAt
                        ? new Date(activity.createdAt).toLocaleDateString()
                        : 'Recently'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Activity className="w-8 h-8 opacity-50 mx-auto mb-2" />
              <p className="text-sm">No activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
