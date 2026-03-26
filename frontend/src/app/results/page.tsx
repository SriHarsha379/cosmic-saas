'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, Award } from 'lucide-react';
import { testService } from '@/services/test.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function ResultsPage() {
  const { data: results = [], isLoading, error, refetch } = useQuery({
    queryKey: ['test-results'],
    queryFn: () => testService.getResults(),
  });

  const formattedResults = Array.isArray(results)
    ? results.map((result: any) => ({
        id: result.id || result._id,
        testName: result.test?.title || 'Unknown Test',
        score: result.score || 0,
        totalScore: result.totalScore || 100,
        accuracy: result.accuracy || 0,
        timeTaken: result.duration || result.timeTaken || 0,
        completedAt: result.completedAt || new Date(),
        status: result.status || 'COMPLETED',
        passed: (result.accuracy || 0) >= 70,
      }))
    : [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white">Test Results</h2>
        <p className="text-sm text-gray-400 mt-0.5">View your test performance and scores</p>
      </div>

      {error && <ErrorMessage message="Failed to load results" onRetry={refetch} />}

      {!isLoading && !error && formattedResults.length === 0 && (
        <div className="text-center py-12">
          <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No test results yet</p>
        </div>
      )}

      <div className="space-y-4">
        {formattedResults.map((result: any) => (
          <div
            key={result.id}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{result.testName}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(result.completedAt).toLocaleDateString()} at{' '}
                  {new Date(result.completedAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {result.passed ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-300">Passed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-medium text-red-300">Failed</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">Score</p>
                <p className="text-2xl font-bold text-purple-400">
                  {result.score}/{result.totalScore}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Accuracy</p>
                <p className="text-2xl font-bold text-blue-400">
                  {(result.accuracy || 0).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">Time Taken</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <p className="text-lg font-semibold text-white">
                    {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400">Accuracy Progress</p>
                <p className="text-xs text-gray-400">{(result.accuracy || 0).toFixed(1)}%</p>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    result.passed
                      ? 'bg-gradient-to-r from-emerald-600 to-cyan-600'
                      : 'bg-gradient-to-r from-red-600 to-pink-600'
                  }`}
                  style={{ width: `${Math.min(result.accuracy || 0, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
