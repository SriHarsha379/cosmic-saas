'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, CheckCircle, XCircle, Clock } from 'lucide-react';
import { testService } from '@/services/test.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { TestResult, Test } from '@/types';

export default function ResultsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['test-results'],
    queryFn: testService.getResults,
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-white">Test Results</h2>
        <p className="text-sm text-gray-400 mt-0.5">Your test submission history</p>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No test results yet</p>
            </div>
          ) : (
            data.map((result: TestResult) => {
              const test = typeof result.test === 'object' ? result.test as Test : null;
              return (
                <div key={result._id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 rounded-xl">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                    </div>
                    {result.passed ? (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" /> Passed
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded-full">
                        <XCircle className="w-3.5 h-3.5" /> Failed
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-white mb-1">{test?.title ?? 'Unknown Test'}</h3>

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-2xl font-bold text-purple-400">{result.percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">{result.score}/{result.totalMarks} marks</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
                      </div>
                      <p>{new Date(result.submittedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
