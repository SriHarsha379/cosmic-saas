'use client';

import { useQuery } from '@tanstack/react-query';
import { Star, Crown, Trophy, Medal } from 'lucide-react';
import { leaderboardService } from '@/services/leaderboard.service';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { LeaderboardEntry } from '@/types';

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
}

export default function LeaderboardPage() {
  const { user } = useAuthStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => leaderboardService.getGlobal(),
  });

  const { data: myRank } = useQuery({
    queryKey: ['my-rank'],
    queryFn: leaderboardService.getMyRank,
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-white">Leaderboard</h2>
        <p className="text-sm text-gray-400 mt-0.5">See how you rank among peers</p>
      </div>

      {/* My Rank Card */}
      {myRank && (
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/10 border border-purple-500/20 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl">
              <Star className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Your Rank</p>
              <p className="text-2xl font-bold text-white">#{myRank.rank}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Total Score</p>
            <p className="text-2xl font-bold text-purple-400">{myRank.score.toLocaleString()}</p>
          </div>
        </div>
      )}

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}
      {error && <ErrorMessage message="Failed to load leaderboard" onRetry={refetch} />}

      {data && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-xs text-gray-400 font-medium w-16">Rank</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-400 font-medium">User</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-400 font-medium">Score</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-400 font-medium">Tests</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-400 font-medium">Wins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((entry: LeaderboardEntry) => {
                  const isMe = entry.user?._id === user?._id;
                  return (
                    <tr
                      key={entry.user?._id}
                      className={`transition-colors ${
                        isMe
                          ? 'bg-purple-500/10 border-l-2 border-l-purple-500'
                          : 'hover:bg-white/3'
                      }`}
                    >
                      <td className="px-6 py-4 flex items-center justify-center">
                        <RankBadge rank={entry.rank} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {entry.user?.firstName?.[0]}{entry.user?.lastName?.[0]}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-white">
                              {entry.user?.firstName} {entry.user?.lastName}
                            </span>
                            {isMe && <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">You</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-purple-400 font-semibold">
                        {entry.totalScore.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{entry.testsCompleted}</td>
                      <td className="px-6 py-4 text-gray-300 flex items-center gap-1">
                        {entry.hackathonsWon > 0 && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                        {entry.hackathonsWon}
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
