'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, Award, TrendingUp, BarChart2 } from 'lucide-react';
import { testService } from '@/services/test.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function ResultsPage() {
  const { data: results = [], isLoading, error, refetch } = useQuery({
    queryKey: ['test-results'],
    queryFn: () => testService.getResults(),
  });

  const formattedResults = Array.isArray(results)
    ? results.map((r: any) => ({
        id: r.id || r._id,
        testName: r.test?.title || 'Unknown Test',
        score: r.score || 0,
        totalScore: r.totalScore || 100,
        accuracy: r.accuracy || 0,
        timeTaken: r.duration || r.timeTaken || 0,
        completedAt: r.completedAt || new Date(),
        passed: (r.accuracy || 0) >= 70,
      }))
    : [];

  const passCount = formattedResults.filter(r => r.passed).length;
  const avgAccuracy = formattedResults.length
    ? formattedResults.reduce((s, r) => s + r.accuracy, 0) / formattedResults.length
    : 0;

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" /></div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="page-hero">
        <h1 className="text-2xl font-bold text-white mb-1">Test Results</h1>
        <p className="text-gray-400 text-sm">View your performance history and scores</p>
      </div>

      {/* Summary cards */}
      {formattedResults.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Tests Taken',  value: formattedResults.length, icon: BarChart2,    color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
            { label: 'Passed',       value: passCount,               icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Avg Accuracy', value: `${avgAccuracy.toFixed(1)}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="glass-card p-4 text-center">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {error && <ErrorMessage message="Failed to load results" onRetry={refetch} />}

      {!error && formattedResults.length === 0 && (
        <div className="text-center py-16 glass-card">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-gray-400 font-medium">No test results yet</p>
          <p className="text-sm text-gray-600 mt-1">Complete a test to see your results here</p>
        </div>
      )}

      <div className="space-y-4">
        {formattedResults.map((result: any) => (
          <div key={result.id} className="glass-card p-5 hover:border-white/15 transition-all">
            {/* Top row */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">{result.testName}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(result.completedAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              {result.passed ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/25 rounded-full flex-shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">Passed</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 border border-red-500/25 rounded-full flex-shrink-0">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-red-300">Failed</span>
                </div>
              )}
            </div>

            {/* Score metrics */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/4 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Score</p>
                <p className="text-xl font-bold text-purple-400 tabular-nums">
                  {result.score}<span className="text-sm text-gray-600">/{result.totalScore}</span>
                </p>
              </div>
              <div className="bg-white/4 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Accuracy</p>
                <p className="text-xl font-bold text-blue-400 tabular-nums">
                  {result.accuracy.toFixed(1)}<span className="text-sm text-gray-600">%</span>
                </p>
              </div>
              <div className="bg-white/4 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Duration</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-base font-semibold text-white tabular-nums">
                    {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
                  </p>
                </div>
              </div>
            </div>

            {/* Accuracy bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs text-gray-600">Accuracy</p>
                <p className="text-xs text-gray-500 tabular-nums">{result.accuracy.toFixed(1)}%</p>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${result.passed ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gradient-to-r from-red-500 to-pink-500'}`}
                  style={{ width: `${Math.min(result.accuracy, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
