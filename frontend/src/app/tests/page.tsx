'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Clock, Award, Play, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { testService } from '@/services/test.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

function TestCard({ test }: { test: any }) {
  const router = useRouter();
  const qc = useQueryClient();

  const startMutation = useMutation({
    mutationFn: () => testService.startTest(test.id),
    onSuccess: () => {
      toast.success('Test started!');
      router.push(`/tests/${test.id}/attempt`);
    },
    onError: () => {
      toast.error('Failed to start test');
    },
  });

  const getDifficultyColor = (level: string) => {
    const colors: Record<string, string> = {
      EASY: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
      MEDIUM: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
      HARD: 'bg-red-500/20 border-red-500/30 text-red-300',
    };
    return colors[level] || colors.MEDIUM;
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/8 transition-all duration-300 group">
      <div className="h-32 bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center relative">
        <BookOpen className="w-16 h-16 text-white/30" />
        <div className="absolute top-3 right-3">
          <span className={`inline-block px-2 py-1 border rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty || 'MEDIUM')}`}>
            {test.difficulty || 'MEDIUM'}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-blue-400 transition-colors">
          {test.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{test.description}</p>

        <div className="space-y-2 text-sm text-gray-300 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>{test.duration || 60} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{test.totalQuestions || 0} questions</span>
          </div>
        </div>

        <button
          onClick={() => startMutation.mutate()}
          disabled={startMutation.isPending}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 group-hover:shadow-lg group-hover:shadow-blue-500/20"
        >
          <Play className="w-4 h-4" />
          {startMutation.isPending ? 'Starting...' : 'Start Test'}
        </button>
      </div>
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

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Tests</h2>
          <p className="text-sm text-gray-400 mt-0.5">Assess your skills with our comprehensive tests</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300">
          <Plus className="w-4 h-4" /> Create Test
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'EASY', 'MEDIUM', 'HARD'].map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              difficulty === d
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            {d || 'All'}
          </button>
        ))}
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && <ErrorMessage message="Failed to load tests" onRetry={refetch} />}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No tests available</p>
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
