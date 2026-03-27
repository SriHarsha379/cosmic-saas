'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Trophy, Users, Award,
  Zap, ArrowRight, Activity, TrendingUp,
  Clock, Sparkles, CheckCircle, BarChart2,
  Target, Rocket, Briefcase, Code2,
  AlertCircle, RotateCcw,
} from 'lucide-react';
import { authService } from '@/services/auth.service';
import { activityService } from '@/services/activity.service';
import { resultService } from '@/services/result.service';
import { testService } from '@/services/test.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/* ─── API result shape (from /api/results) ───────────────────── */
interface ResultItem {
  id: string;
  testId: string;
  score: number;
  totalScore: number;
  accuracy: number;
  duration: number;
  status: string;
  completedAt: string;
  test?: { id: string; title: string; difficulty?: string };
}

/* ─── API activity shape (from /api/activities) ──────────────── */
interface ActivityItem {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

/* ─── API test shape (from /api/tests) ───────────────────────── */
interface TestItem {
  id: string;
  title: string;
}

/* ─── Stat card ─────────────────────────────────────────────── */
function StatCard({
  icon: Icon, title, value, color, gradient, sub,
}: {
  icon: React.ElementType;
  title: string;
  value: React.ReactNode;
  color: { bg: string; text: string };
  gradient: string;
  sub?: string;
}) {
  return (
    <div className="glass-card p-5 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${gradient}`} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color.bg}`}>
            <Icon className={`w-4 h-4 ${color.text}`} />
          </div>
        </div>
        <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Ecosystem card ─────────────────────────────────────────── */
interface EcoPlatform {
  label: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  href: string;
}

const ecosystemPlatforms: EcoPlatform[] = [
  {
    label: 'Tests',
    description: 'Skill assessments & coding challenges',
    icon: Code2,
    gradient: 'from-purple-600 to-blue-600',
    href: '/tests',
  },
  {
    label: 'Hackathons',
    description: 'Compete and win prizes',
    icon: Rocket,
    gradient: 'from-amber-500 to-orange-600',
    href: '/hackathons',
  },
  {
    label: 'AI Hiring',
    description: 'Jobs, interviews & applications',
    icon: Briefcase,
    gradient: 'from-blue-500 to-purple-600',
    href: '/ai-hiring',
  },
  {
    label: 'Leaderboard',
    description: 'Track your global ranking',
    icon: Trophy,
    gradient: 'from-pink-500 to-rose-600',
    href: '/leaderboard',
  },
];

function EcosystemCard({ platform }: { platform: EcoPlatform }) {
  const router = useRouter();
  const Icon = platform.icon;
  return (
    <button
      onClick={() => router.push(platform.href)}
      className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/4 border border-white/8 hover:bg-white/8 hover:border-white/15 hover:-translate-y-1 transition-all duration-300 text-center group cursor-pointer"
    >
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white leading-tight">{platform.label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{platform.description}</p>
      </div>
    </button>
  );
}

/* ─── Activity type colours ──────────────────────────────────── */
const activityTypeColors: Record<string, string> = {
  TEST_COMPLETED:   'bg-blue-500/20 text-blue-400',
  JOINED_HACKATHON: 'bg-amber-500/20 text-amber-400',
  CERTIFICATE:      'bg-emerald-500/20 text-emerald-400',
  TEAM_JOINED:      'bg-purple-500/20 text-purple-400',
};

/* ─── Inline error banner ────────────────────────────────────── */
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

/* ─── Main page ──────────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();

  /* Fetch user profile */
  const {
    data: user,
    isLoading: userLoading,
  } = useQuery({
    queryKey: ['auth-me'],
    queryFn: () => authService.getMe(),
    retry: 1,
  });

  /* Fetch completed results */
  const {
    data: results = [] as ResultItem[],
    isLoading: resultsLoading,
    isError: resultsError,
    refetch: refetchResults,
  } = useQuery<ResultItem[]>({
    queryKey: ['results'],
    queryFn: async () => {
      const data = await resultService.getAll();
      return data as unknown as ResultItem[];
    },
    retry: 1,
  });

  /* Fetch available tests (for pending count) */
  const {
    data: allTests = [] as TestItem[],
    isLoading: testsLoading,
  } = useQuery<TestItem[]>({
    queryKey: ['tests'],
    queryFn: async () => {
      const data = await testService.getAll();
      return data as unknown as TestItem[];
    },
    retry: 1,
  });

  /* Fetch recent activities */
  const {
    data: activities = [] as ActivityItem[],
    isLoading: activitiesLoading,
    isError: activitiesError,
    refetch: refetchActivities,
  } = useQuery<ActivityItem[]>({
    queryKey: ['activities'],
    queryFn: async () => {
      const data = await activityService.getAll(10);
      return data as unknown as ActivityItem[];
    },
    retry: 1,
  });

  /* ── Derived stats ── */
  const completedCount = results.length;
  // "Pending" = total available tests the user hasn't yet completed
  const completedTestIds = new Set(results.map((r) => r.testId));
  const pendingCount = allTests.filter((t) => !completedTestIds.has(t.id)).length;
  const avgScore =
    completedCount > 0
      ? results.reduce((sum, r) => sum + r.accuracy, 0) / completedCount
      : 0;

  const statsLoading = resultsLoading || testsLoading;

  const greeting =
    new Date().getHours() < 12
      ? 'Good morning'
      : new Date().getHours() < 18
      ? 'Good afternoon'
      : 'Good evening';

  /* ── Global loading ── */
  if (userLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* ── Hero banner ── */}
      <div className="page-hero relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">
                {greeting}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Hey, {user?.firstName || 'there'} 👋
            </h1>
            <p className="text-gray-400">Here's what's happening with your account today.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      {statsLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass-card p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
          <StatCard
            icon={Clock}
            title="Pending Tests"
            value={pendingCount}
            color={{ bg: 'bg-amber-500/15', text: 'text-amber-400' }}
            gradient="bg-gradient-to-br from-amber-500/5 to-transparent"
            sub="Available to take"
          />
          <StatCard
            icon={CheckCircle}
            title="Completed Tests"
            value={completedCount}
            color={{ bg: 'bg-emerald-500/15', text: 'text-emerald-400' }}
            gradient="bg-gradient-to-br from-emerald-500/5 to-transparent"
            sub="Tests finished"
          />
          <StatCard
            icon={BarChart2}
            title="Average Score"
            value={completedCount > 0 ? `${avgScore.toFixed(1)}%` : '—'}
            color={{ bg: 'bg-purple-500/15', text: 'text-purple-400' }}
            gradient="bg-gradient-to-br from-purple-500/5 to-transparent"
            sub={completedCount > 0 ? 'Across all tests' : 'Complete a test to start'}
          />
        </div>
      )}

      {resultsError && (
        <InlineError message="Failed to load stats" onRetry={refetchResults} />
      )}

      {/* ── Activity + Results ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activity */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
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
          ) : activitiesError ? (
            <InlineError message="Failed to load activities" onRetry={refetchActivities} />
          ) : activities.length > 0 ? (
            <div className="space-y-2">
              {activities.slice(0, 8).map((activity, idx) => {
                const colorClass =
                  activityTypeColors[activity.type] || 'bg-gray-500/20 text-gray-400';
                return (
                  <div
                    key={activity.id || idx}
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
                Start a test or join a hackathon to see events here.
              </p>
              <button
                onClick={() => router.push('/tests')}
                className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                Take your first test <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <h3 className="text-base font-semibold text-white">Recent Results</h3>
            </div>
            {results.length > 0 && (
              <button
                onClick={() => router.push('/results')}
                className="text-xs text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {resultsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : resultsError ? (
            <InlineError message="Failed to load results" onRetry={refetchResults} />
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.slice(0, 5).map((result, idx) => {
                const accuracy = result.accuracy;
                const passed = accuracy >= 70;
                const testTitle = result.test?.title ?? 'Unknown Test';
                return (
                  <div
                    key={result.id || idx}
                    className="flex items-center gap-4 p-3.5 rounded-xl bg-white/3 border border-white/6 hover:border-white/12 transition-all"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        passed ? 'bg-emerald-500/15' : 'bg-red-500/15'
                      }`}
                    >
                      {passed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Target className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{testTitle}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {result.completedAt
                          ? new Date(result.completedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-sm font-bold tabular-nums ${
                          passed ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {accuracy.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {passed ? 'Passed' : 'Failed'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <Award className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-400">No test results yet</p>
              <p className="text-xs text-gray-600 mt-1">
                Complete a test to see your results here.
              </p>
              <button
                onClick={() => router.push('/tests')}
                className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                Browse tests <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Ecosystem Switcher ── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h3 className="text-base font-semibold text-white">Cosmic Ecosystem</h3>
        </div>
        <p className="text-xs text-gray-500 mb-5">Switch between platforms</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ecosystemPlatforms.map((platform) => (
            <EcosystemCard key={platform.href} platform={platform} />
          ))}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <h3 className="text-base font-semibold text-white">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Take a Test',    icon: BookOpen, href: '/tests',     color: 'from-purple-600 to-blue-600',   shadow: 'shadow-purple-500/25' },
            { label: 'Join Hackathon', icon: Trophy,   href: '/hackathons', color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
            { label: 'Find a Job',     icon: Users,    href: '/jobs',       color: 'from-emerald-600 to-cyan-600',  shadow: 'shadow-emerald-500/25' },
          ].map(({ label, icon: Icon, href, color, shadow }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r ${color} text-white rounded-xl hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all font-medium text-sm shadow-lg ${shadow}`}
            >
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              {label}
              <ArrowRight className="w-4 h-4 ml-auto opacity-70" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

