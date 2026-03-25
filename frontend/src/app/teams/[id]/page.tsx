'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Crown, Calendar } from 'lucide-react';
import { teamService } from '@/services/team.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { User } from '@/types';

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: team, isLoading, error } = useQuery({
    queryKey: ['team', id],
    queryFn: () => teamService.getById(id),
  });

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  if (error || !team) return <ErrorMessage message="Failed to load team details" />;

  const leaderUser = typeof team.leader === 'object' ? team.leader as User : null;

  return (
    <div className="space-y-6 animate-slide-up max-w-3xl">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 rounded-xl">
            <Users className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{team.name}</h1>
            <p className="text-gray-400 mt-1">{team.description || 'No description provided'}</p>
          </div>
        </div>

        {leaderUser && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-300">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Led by {leaderUser.firstName} {leaderUser.lastName}</span>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Members ({team.members?.length ?? 0}/{team.maxSize})
          </h3>
          <div className="space-y-2">
            {team.members?.map((member) => {
              const u = typeof member.user === 'object' ? member.user as User : null;
              return (
                <div key={typeof member.user === 'string' ? member.user : (member.user as User)._id}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                      {u ? `${u.firstName?.[0]}${u.lastName?.[0]}`.toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm text-white">{u ? `${u.firstName} ${u.lastName}` : 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {member.role === 'leader' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="capitalize">{member.role}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {team.inviteCode && (
          <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Invite Code</p>
            <p className="text-sm font-mono text-purple-300">{team.inviteCode}</p>
          </div>
        )}
      </div>
    </div>
  );
}
