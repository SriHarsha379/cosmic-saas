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

  const { data: myRankData } = useQuery({
    queryKey: ['my-rank'],
    queryFn: leaderboardService.getMyRank,
  });

  // myRankData is an array, get the total score
  const totalScore = myRankData && Array.isArray(myRankData) 
    ? myRankData.reduce((sum, entry) => sum + (entry.score || 0), 0)
    : 0;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-white">Leaderboard</h2>
        <p className="text-sm text-gray-400 mt-0.5">See how you rank among peers</p>
      </div>

      {/* My Rank Card */}
      {myRankData && Array.isArray(myRankData) && myRankData.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/10 border border-purple-500/20 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl">
              <Star className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Your Total Score</p>
              <p className="text-2xl font-bold text-white">{totalScore.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Entries</p>
            <p className="text-2xl font-bold text-purple-400">{myRankData.length}</p>
          </div>
        </div>
      )}

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && <ErrorMessage message="Failed to load leaderboard" onRetry={refetch} />}

      {data && Array.isArray(data) && data.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-xs text-gray-400 font-medium w-16">Rank</th>
                  <th className="text-left px-6 py-4 text-xs text-gray-400 font-medium">User</th>
                  <th className="text-right px-6 py-4 text-xs text-gray-400 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry: any, index: number) => (
                  <tr
                    key={entry.id || index}
                    className={`border-b border-white/5 transition-colors ${
                      entry.user?.id === user?.id ? 'bg-purple-500/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <RankBadge rank={index + 1} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full" />
                        <div>
                          <p className="font-medium text-white">
                            {entry.user?.firstName} {entry.user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{entry.user?.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-purple-400">{entry.score?.toLocaleString() || 0}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && !error && (!data || data.length === 0) && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No leaderboard entries yet</p>
        </div>
      )}
    </div>
  );
}
