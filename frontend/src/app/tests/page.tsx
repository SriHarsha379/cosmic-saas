'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, Target, ChevronRight } from 'lucide-react';
import { testService } from '@/services/test.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { Test } from '@/types';

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  hard: 'text-red-400 bg-red-400/10 border-red-400/20',
};

function TestCard({ test }: { test: Test }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/tests/${test._id}`)}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 rounded-xl">
          <BookOpen className="w-5 h-5 text-purple-400" />
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border capitalize ${DIFFICULTY_STYLES[test.difficulty]}`}>
          {test.difficulty}
        </span>
      </div>

      <h3 className="text-base font-semibold text-white mt-3 mb-1">{test.title}</h3>
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{test.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            {test.duration} min
          </span>
          <span className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-purple-400" />
            {test.totalMarks} pts
          </span>
        </div>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-gray-500" />
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-gray-500">{test.category}</span>
        <span className="text-xs text-gray-500">{test.questions?.length ?? 0} questions</span>
      </div>
    </div>
  );
}

export default function TestsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tests'],
    queryFn: testService.getAll,
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-white">Test Galaxy</h2>
        <p className="text-sm text-gray-400 mt-0.5">Assess and improve your skills</p>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}
      {error && <ErrorMessage message="Failed to load tests" onRetry={refetch} />}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No tests available</p>
            </div>
          ) : (
            data.map((test) => <TestCard key={test._id} test={test} />)
          )}
        </div>
      )}
    </div>
  );
}
