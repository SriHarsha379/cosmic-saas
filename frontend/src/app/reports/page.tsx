'use client';

import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { testService } from '@/services/test.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { TestResult, Test } from '@/types';

const CHART_COLORS = { primary: '#8B5CF6', secondary: '#3B82F6', accent: '#06B6D4' };

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0E1330] border border-white/10 rounded-xl p-3 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const { data: results, isLoading } = useQuery({
    queryKey: ['test-results'],
    queryFn: testService.getResults,
  });

  const chartData = results?.slice(0, 10).map((r: TestResult, i: number) => {
    const test = typeof r.test === 'object' ? r.test as Test : null;
    return {
      name: test?.title?.slice(0, 12) ?? `Test ${i + 1}`,
      score: r.percentage,
      marks: r.score,
    };
  }).reverse() ?? [];

  const avg = results?.length
    ? (results.reduce((sum: number, r: TestResult) => sum + r.percentage, 0) / results.length).toFixed(1)
    : '0';

  const passed = results?.filter((r: TestResult) => r.passed).length ?? 0;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-white">Performance Reports</h2>
        <p className="text-sm text-gray-400 mt-0.5">Analyze your progress over time</p>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Tests Taken', value: results?.length ?? 0, color: 'text-purple-400' },
          { label: 'Average Score', value: `${avg}%`, color: 'text-cyan-400' },
          { label: 'Passed', value: passed, color: 'text-emerald-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <p className="text-sm text-gray-400 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Line Chart */}
      {chartData.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Score Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="score"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.primary, r: 4 }}
                name="Score %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Marks per Test</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="marks" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} name="Marks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History Table */}
      {results && results.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white">Test History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Test</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Score</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">%</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((r: TestResult) => {
                  const test = typeof r.test === 'object' ? r.test as Test : null;
                  return (
                    <tr key={r._id} className="hover:bg-white/3 transition-colors">
                      <td className="px-6 py-3 text-white">{test?.title ?? 'Unknown'}</td>
                      <td className="px-6 py-3 text-gray-300">{r.score}/{r.totalMarks}</td>
                      <td className="px-6 py-3 text-gray-300">{r.percentage.toFixed(1)}%</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${r.passed ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                          {r.passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-400">
                        {new Date(r.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
