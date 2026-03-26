'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Clock, HelpCircle, Play, Zap, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { testService } from '@/services/test.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

const DIFFICULTY_CONFIG: Record<string, { badge: string; bar: string; dot: string }> = {
  EASY:   { badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300', bar: 'bg-emerald-500',  dot: 'bg-emerald-400' },
  MEDIUM: { badge: 'bg-amber-500/15 border-amber-500/30 text-amber-300',       bar: 'bg-amber-500',    dot: 'bg-amber-400'   },
  HARD:   { badge: 'bg-red-500/15 border-red-500/30 text-red-300',             bar: 'bg-red-500',      dot: 'bg-red-400'     },
};

function TestCard({ test }: { test: any }) {
  const router = useRouter();
  const qc = useQueryClient();

  const startMutation = useMutation({
    mutationFn: () => testService.startTest(test.id),
    onSuccess: () => {
      toast.success('Test started!');
      router.push(`/tests/${test.id}/attempt`);
    },
    onError: () => toast.error('Failed to start test'),
  });

  const level = test.difficulty || 'MEDIUM';
  const cfg = DIFFICULTY_CONFIG[level] || DIFFICULTY_CONFIG.MEDIUM;
  const difficultyPct = level === 'EASY' ? 33 : level === 'MEDIUM' ? 66 : 100;

  return (
    <div className="glass-card p-5 group hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
      {/* Title + difficulty */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-base leading-tight group-hover:text-blue-400 transition-colors line-clamp-1">
              {test.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{test.description}</p>
          </div>
        </div>
        <span className={`badge border flex-shrink-0 ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {level}
        </span>
      </div>

      {/* Difficulty bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-600">Difficulty</span>
          <span className="text-xs text-gray-500">{difficultyPct}%</span>
        </div>
        <div className="progress-bar">
          <div className={`progress-fill ${cfg.bar}`} style={{ width: `${difficultyPct}%` }} />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-400/70" />
          {test.duration || 60} min
        </span>
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-purple-400/70" />
          {test.totalQuestions || 0} questions
        </span>
      </div>

      <button
        onClick={() => startMutation.mutate()}
        disabled={startMutation.isPending}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 active:translate-y-0"
      >
        <Play className="w-4 h-4" />
        {startMutation.isPending ? 'Starting…' : 'Start Test'}
      </button>
    </div>
  );
}

export default function TestsPage() {
  const [difficulty, setDifficulty] = useState('');
  const { data: rawData, isLoading, error, refetch } = useQuery({
    queryKey: ['tests', difficulty],
    queryFn: () => testService.getAll(difficulty ? { difficulty } : undefined),
  });

  const data = Array.isArray(rawData) ? rawData : [];

  const filters = [
    { value: '',       label: 'All',    color: 'from-purple-600 to-blue-600' },
    { value: 'EASY',   label: 'Easy',   color: 'from-emerald-600 to-teal-600' },
    { value: 'MEDIUM', label: 'Medium', color: 'from-amber-500 to-orange-600' },
    { value: 'HARD',   label: 'Hard',   color: 'from-red-600 to-pink-600' },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="page-hero">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Tests</h1>
            <p className="text-gray-400 text-sm">Assess your skills with comprehensive technical assessments</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-300">{data.length} tests available</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => setDifficulty(value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              difficulty === value
                ? `bg-gradient-to-r ${color} text-white shadow-lg`
                : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/8 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && <ErrorMessage message="Failed to load tests" onRetry={refetch} />}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {data.length === 0 ? (
            <div className="col-span-full text-center py-16 glass-card">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">No tests available</p>
              <p className="text-sm text-gray-600 mt-1">Try changing the difficulty filter</p>
            </div>
          ) : (
            data.map((test: any) => (
              <TestCard key={test.id || test._id} test={test} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
