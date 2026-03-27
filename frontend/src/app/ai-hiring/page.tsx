'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Video, CheckCircle, PlayCircle, TrendingUp,
  Activity, ArrowRight, Trophy, Target, Zap, Plus,
  AlertCircle, RotateCcw,
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { interviewService } from '@/services/interview.service';
import { activityService } from '@/services/activity.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Interview } from '@/types';

/* ── Activity type colours ── */
const activityTypeColors: Record<string, string> = {
  TEST_COMPLETED:   'bg-blue-500/20 text-blue-400',
  JOINED_HACKATHON: 'bg-amber-500/20 text-amber-400',
  CERTIFICATE:      'bg-emerald-500/20 text-emerald-400',
  TEAM_JOINED:      'bg-purple-500/20 text-purple-400',
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  color: { bg: string; text: string; glow: string };
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  return (
    <div className={`glass-card p-5 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
      <div className={`absolute inset-0 ${color.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
          <div className={`w-8 h-8 rounded-xl ${color.bg} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${color.text}`} />
          </div>
        </div>
        <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1 hover:text-red-300 transition-colors">
          <RotateCcw className="w-3.5 h-3.5" /> Retry
        </button>
      )}
    </div>
  );
}

export default function AiHiringOverviewPage() {
  const router = useRouter();

  const { data: user } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => authService.getMe(),
    retry: 1,
  });

  const {
    data: rawInterviews,
    isLoading: interviewsLoading,
    isError: interviewsError,
    refetch: refetchInterviews,
  } = useQuery({
    queryKey: ['interviews'],
    queryFn: interviewService.getAll,
    retry: 1,
  });

  const {
    data: activities = [],
    isLoading: activitiesLoading,
  } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activityService.getAll(8),
    retry: 1,
  });

  const interviews: Interview[] = Array.isArray(rawInterviews) ? rawInterviews : [];

  /* ── Derived stats ── */
  const totalInterviews = interviews.length;
  const completed = interviews.filter((i) => i.status === 'completed').length;
  const inProgress = interviews.filter(
    (i) => i.status === 'scheduled'
  ).length;
  const successRate =
    totalInterviews > 0 ? Math.round((completed / totalInterviews) * 100) : 0;

  /* ── Average score from completed interviews with scores ── */
  const scoredInterviews = interviews.filter(
    (i) => i.status === 'completed' && typeof i.score === 'number'
  );
  const avgScore =
    scoredInterviews.length > 0
      ? Math.round(
          scoredInterviews.reduce((s, i) => s + (i.score ?? 0), 0) /
            scoredInterviews.length
        )
      : 0;

  const stats: StatCardProps[] = [
    {
      icon: Video,
      label: 'Total Interviews',
      value: totalInterviews,
      color: { bg: 'bg-blue-500/15', text: 'text-blue-400', glow: 'bg-gradient-to-br from-blue-500/5 to-transparent' },
    },
    {
      icon: CheckCircle,
      label: 'Completed',
      value: completed,
      color: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', glow: 'bg-gradient-to-br from-emerald-500/5 to-transparent' },
    },
    {
      icon: PlayCircle,
      label: 'In Progress',
      value: inProgress,
      color: { bg: 'bg-amber-500/15', text: 'text-amber-400', glow: 'bg-gradient-to-br from-amber-500/5 to-transparent' },
    },
    {
      icon: TrendingUp,
      label: 'Success Rate',
      value: `${successRate}%`,
      color: { bg: 'bg-purple-500/15', text: 'text-purple-400', glow: 'bg-gradient-to-br from-purple-500/5 to-transparent' },
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* ── Candidate Portal Hero ── */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-purple-600/70 to-indigo-800/80" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFMwIDguMDYgMCAxOHM4LjA2IDE4IDE4IDE4IDE4LTguMDYgMTgtMTh6IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-20" />
        <div className="relative z-10 p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="px-3 py-1 bg-white/15 backdrop-blur rounded-full border border-white/20 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                <span className="text-xs font-semibold text-white">Candidate Portal</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome back, {user?.firstName || 'there'}! 👋
            </h1>
            <p className="text-blue-200/80 text-sm">Your interview journey continues here</p>
          </div>
          <div className="hidden sm:flex flex-col items-center text-center">
            <p className="text-xs text-blue-200/70 font-medium mb-1">Total Score</p>
            <div className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <p className="text-3xl font-bold text-white tabular-nums">
                {avgScore}
                <span className="text-lg text-blue-200/60">%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      {interviewsError && (
        <InlineError message="Failed to load interview data" onRetry={refetchInterviews} />
      )}
      {interviewsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* ── Recent Activity + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h3 className="text-base font-semibold text-white">Recent Activity</h3>
            </div>
            {activities.length > 0 && (
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                {activities.length}
              </span>
            )}
          </div>

          {activitiesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-2">
              {(activities as Array<{ id?: string; _id?: string; type?: string; description?: string; createdAt?: string }>)
                .slice(0, 6)
                .map((activity, idx) => {
                  const colorClass =
                    activityTypeColors[(activity.type as string) ?? ''] ||
                    'bg-gray-500/20 text-gray-400';
                  return (
                    <div
                      key={activity.id || activity._id || idx}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/4 transition-all"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorClass}`}
                      >
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 leading-snug">
                          {activity.description || 'Activity'}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {activity.createdAt
                            ? new Date(activity.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Recently'}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <Activity className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-400">No activity yet</p>
              <p className="text-xs text-gray-600 mt-1">
                Schedule an interview to get started.
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/interviews')}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all font-medium text-sm shadow-lg shadow-blue-500/25"
            >
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              Schedule Interview
              <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
            </button>
            <button
              onClick={() => router.push('/jobs')}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all font-medium text-sm shadow-lg shadow-emerald-500/25"
            >
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </div>
              Browse Jobs
              <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
            </button>
            <button
              onClick={() => router.push('/ai-hiring/self-evaluations')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white/4 hover:bg-white/8 border border-white/8 rounded-xl transition-all text-sm font-medium text-gray-300 hover:text-white"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-purple-400" />
              </div>
              Self-Evaluations
              <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
            </button>
          </div>

          {/* Upcoming interview */}
          {interviews.filter((i) => i.status === 'scheduled').length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs font-semibold text-blue-400 mb-1">
                Upcoming Interview
              </p>
              {(() => {
                const next = interviews
                  .filter((i) => i.status === 'scheduled')
                  .sort(
                    (a, b) =>
                      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
                  )[0];
                return next ? (
                  <div>
                    <p className="text-sm font-medium text-white capitalize">
                      {next.type} Interview
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(next.scheduledAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
