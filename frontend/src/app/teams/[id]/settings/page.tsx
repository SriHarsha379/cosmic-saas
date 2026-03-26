'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Users, Lock, Unlock } from 'lucide-react';
import Link from 'next/link';
import { teamService } from '@/services/team.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TeamSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const teamId = unwrappedParams?.id;

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: () => teamService.getById(teamId!),
    enabled: !!teamId,
  });

  if (!teamId) return <LoadingSpinner />;
  if (isLoading) return <LoadingSpinner />;
  if (!team) return <div className="text-center py-12 text-red-400">Team not found</div>;

  const leaderName = typeof team.leader === 'object'
    ? `${team.leader.firstName} ${team.leader.lastName}`
    : 'Unknown';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div className="flex items-center gap-4">
        <Link href="/teams" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-white">Team Settings</h2>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Team Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Team Name</label>
            <p className="text-white font-semibold">{team.name}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <p className="text-white">{team.description || 'No description'}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Team Leader</label>
            <p className="text-white">{leaderName}</p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <div className="flex items-center gap-2">
                {team.isOpen ? (
                  <>
                    <Unlock className="w-5 h-5 text-emerald-400" />
                    <p className="text-white">Open to join</p>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-gray-400" />
                    <p className="text-white">Closed</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Members</h3>
        <div className="space-y-2">
          {team.members && team.members.length > 0 ? (
            team.members.map((member: any) => (
              <div key={member.id || member.userId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">
                    {member.user?.firstName} {member.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{member.role || 'Member'}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No members yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
