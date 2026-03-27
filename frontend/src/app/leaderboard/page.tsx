'use client';

import { useQuery } from '@tanstack/react-query';
import { Crown, Trophy, Medal, Star, TrendingUp } from 'lucide-react';
import { leaderboardService } from '@/services/leaderboard.service';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-bold text-gray-500 tabular-nums">#{rank}</span>;
}

function PodiumCard({ entry, rank, index }: { entry: any; rank: number; index: number }) {
  const configs = [
    { border: 'border-amber-500/35', bg: 'from-amber-500/15 to-amber-600/5', ring: 'ring-amber-500/40', size: 'w-16 h-16', crown: true },
    { border: 'border-slate-400/25', bg: 'from-slate-400/10 to-transparent',  ring: 'ring-slate-400/30', size: 'w-14 h-14', crown: false },
    { border: 'border-amber-700/30', bg: 'from-amber-700/12 to-transparent',  ring: 'ring-amber-700/25', size: 'w-14 h-14', crown: false },
  ];
  const cfg = configs[index];
  const placeLabels = ['1st place', '2nd place', '3rd place'];
  const placeColors = ['text-amber-400', 'text-slate-300', 'text-amber-600'];

  return (
    <div className={`flex flex-col items-center gap-3 ${index === 0 ? 'z-10' : ''}`}>
      {cfg.crown && <Crown className="w-6 h-6 text-amber-400 animate-float" />}
      {!cfg.crown && <div className="w-6 h-6" />}
      <div className={`${cfg.size} rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg ring-2 ${cfg.ring} ${index === 0 ? 'text-xl' : 'text-base'}`}>
        {entry.user?.firstName?.[0]}{entry.user?.lastName?.[0]}
      </div>
      <div className={`glass-card bg-gradient-to-b ${cfg.bg} border ${cfg.border} p-4 text-center min-w-[120px]`}>
        <p className={`font-semibold text-white truncate ${index === 0 ? 'text-base' : 'text-sm'}`}>
          {entry.user?.firstName} {entry.user?.lastName?.[0]}.
        </p>
        <p className={`font-bold mt-0.5 tabular-nums ${index === 0 ? 'text-2xl text-amber-300' : 'text-xl text-slate-300'}`}>
          {(entry.score || 0).toLocaleString()}
        </p>
        <span className={`text-xs font-medium ${placeColors[index]}`}>{placeLabels[index]}</span>
      </div>
    </div>
  );
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

  const totalScore = myRankData && Array.isArray(myRankData)
    ? myRankData.reduce((sum: number, e: any) => sum + (e.score || 0), 0)
    : 0;

  const entries = Array.isArray(data) ? data : [];
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // podium order: 2nd, 1st, 3rd
  const podiumOrder = top3.length === 3
    ? [{ entry: top3[1], rank: 2, index: 1 }, { entry: top3[0], rank: 1, index: 0 }, { entry: top3[2], rank: 3, index: 2 }]
    : top3.map((e, i) => ({ entry: e, rank: i + 1, index: i }));

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="page-hero">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Leaderboard</h1>
            <p className="text-gray-400 text-sm">See how you rank among all platform members</p>
          </div>
          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">{entries.length} participants</span>
          </div>
        </div>
      </div>

      {/* My score */}
      {totalScore > 0 && (
        <div className="glass-card p-5 border-purple-500/20 bg-gradient-to-r from-purple-600/8 to-blue-600/4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Your Total Score</p>
              <p className="text-2xl font-bold text-white tabular-nums">{totalScore.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Entries</p>
              <p className="text-xl font-bold text-purple-400">{Array.isArray(myRankData) ? myRankData.length : 0}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && <ErrorMessage message="Failed to load leaderboard" onRetry={refetch} />}

      {entries.length > 0 && (
        <>
          {/* Podium */}
          {top3.length >= 2 && (
            <div className="glass-card p-8">
              <div className="flex items-end justify-center gap-4 sm:gap-8">
                {podiumOrder.map(({ entry, rank, index }) => (
                  <PodiumCard key={rank} entry={entry} rank={rank} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div className="glass-card overflow-hidden">
              <table className="w-full cosmic-table">
                <thead>
                  <tr>
                    <th className="text-left w-20">Rank</th>
                    <th className="text-left">User</th>
                    <th className="text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((entry: any, i: number) => {
                    const rank = i + 4;
                    const isMe = entry.user?.id === user?.id;
                    return (
                      <tr key={entry.id || i} className={isMe ? '!bg-purple-500/8' : ''}>
                        <td>
                          <span className="text-sm font-bold text-gray-500 tabular-nums">#{rank}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                              {entry.user?.firstName?.[0]}{entry.user?.lastName?.[0]}
                            </div>
                            <p className={`font-medium text-sm ${isMe ? 'text-purple-300' : 'text-white'}`}>
                              {entry.user?.firstName} {entry.user?.lastName}
                              {isMe && <span className="ml-1.5 text-xs text-purple-500">(you)</span>}
                            </p>
                          </div>
                        </td>
                        <td className="text-right">
                          <span className="font-bold text-purple-400 tabular-nums">
                            {(entry.score || 0).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!isLoading && !error && entries.length === 0 && (
        <div className="text-center py-16 glass-card">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No leaderboard entries yet</p>
          <p className="text-sm text-gray-600 mt-1">Complete tests to appear on the leaderboard</p>
        </div>
      )}
    </div>
  );
}
