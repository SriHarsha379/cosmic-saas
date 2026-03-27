'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Video, TrendingUp, ArrowRight, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockInterviewService } from '@/services/mockInterview.service';

const JOB_ROLES = [
  { role: 'Technical',   emoji: '💻', desc: 'Software engineering & coding interviews',    gradient: 'from-blue-600 to-cyan-600'    },
  { role: 'HR',          emoji: '👥', desc: 'Human resources & people management',         gradient: 'from-purple-600 to-pink-600'  },
  { role: 'Sales',       emoji: '📈', desc: 'Sales strategies & customer relations',        gradient: 'from-emerald-600 to-teal-600' },
  { role: 'Management',  emoji: '🎯', desc: 'Leadership & project management',             gradient: 'from-orange-600 to-red-600'   },
  { role: 'Healthcare',  emoji: '🏥', desc: 'Medical & healthcare professional roles',     gradient: 'from-rose-600 to-pink-600'    },
  { role: 'Finance',     emoji: '💰', desc: 'Financial analysis & investment roles',       gradient: 'from-yellow-600 to-orange-600'},
];

function StatusBadge({ status }: { status: string }) {
  const lower = status?.toLowerCase();
  if (lower === 'completed')
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/25 rounded-full text-xs font-semibold text-emerald-300">
        <CheckCircle className="w-3 h-3" /> Completed
      </span>
    );
  if (lower === 'in-progress' || lower === 'in_progress')
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/15 border border-blue-500/25 rounded-full text-xs font-semibold text-blue-300">
        <Loader2 className="w-3 h-3 animate-spin" /> In Progress
      </span>
    );
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 bg-yellow-500/15 border border-yellow-500/25 rounded-full text-xs font-semibold text-yellow-300">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

export default function MockInterviewsPage() {
  const router = useRouter();
  const qc = useQueryClient();

  const { data: myInterviews = [], isLoading } = useQuery({
    queryKey: ['mock-interviews-my'],
    queryFn: () => mockInterviewService.getMyInterviews(),
  });

  const startMutation = useMutation({
    mutationFn: (jobRole: string) => mockInterviewService.startInterview({ jobRole }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['mock-interviews-my'] });
      toast.success('Interview started!');
      if (data?.id || data?._id) {
        router.push(`/results`);
      }
    },
    onError: () => toast.error('Failed to start interview'),
  });

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="page-hero">
        <div className="flex items-center gap-2 mb-1">
          <Video className="w-5 h-5 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Mock Interviews</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Practice with AI-powered role-specific interview simulations and get instant feedback
        </p>
      </div>

      {/* Track Progress Banner */}
      <div className="glass-card p-5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Track your Progress</h3>
              <p className="text-sm text-gray-400">
                View your interview history, scores, and detailed AI feedback
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/results')}
            className="flex items-center gap-2 px-4 py-2 bg-white/8 hover:bg-white/12 rounded-xl text-sm text-gray-300 hover:text-white transition-all border border-white/8"
          >
            <TrendingUp className="w-4 h-4" />
            View Results
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Job Role Cards */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Choose Your Interview Role</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {JOB_ROLES.map(({ role, emoji, desc, gradient }) => {
            const isPending = startMutation.isPending && startMutation.variables === role;
            return (
              <div
                key={role}
                className="glass-card p-5 flex flex-col group hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300`}
                >
                  {emoji}
                </div>
                <h3 className="text-base font-semibold text-white mb-1">{role}</h3>
                <p className="text-sm text-gray-400 flex-1 mb-4">{desc}</p>
                <button
                  onClick={() => startMutation.mutate(role)}
                  disabled={startMutation.isPending}
                  className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${gradient} text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50`}
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  {isPending ? 'Starting…' : 'Start Interview'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Interviews */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">My Interviews</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : myInterviews.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No interviews yet</p>
            <p className="text-sm text-gray-600 mt-1">Start an interview above to see your history here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myInterviews.map((interview: any) => {
              const id = interview.id || interview._id;
              return (
                <div key={id} className="glass-card p-4 flex items-center justify-between gap-4 hover:border-white/15 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center text-xl flex-shrink-0">
                      {JOB_ROLES.find((r) => r.role === interview.jobRole)?.emoji ?? '🎙️'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{interview.jobRole} Interview</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {interview.createdAt
                          ? new Date(interview.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {interview.score != null && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Score</p>
                        <p className="text-base font-bold text-purple-400">{interview.score}%</p>
                      </div>
                    )}
                    <StatusBadge status={interview.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
