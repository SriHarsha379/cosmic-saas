'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, MessageSquare, Settings, Lock, Unlock, Crown, LogOut as LeaveIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { teamService } from '@/services/team.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

interface Team {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  leader: any;
  members?: any[];
  isOpen?: boolean;
  maxSize?: number;
}

function CreateTeamModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', description: '', hackathon: '', maxSize: 5 });
  const mutation = useMutation({
    mutationFn: (data: any) => teamService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams'] }); toast.success('Team created!'); onClose(); },
    onError: () => toast.error('Failed to create team'),
  });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Create Team</h2>
            <p className="text-xs text-gray-500 mt-0.5">Start collaborating with others</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/8 rounded-lg text-gray-400 hover:text-white transition-all">
            <Plus className="w-4 h-4 rotate-45" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Team Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Alpha Squad"
              className="cosmic-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What's your team about?"
              rows={3}
              className="cosmic-input resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-sm transition-all">
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate(form as any)}
            disabled={mutation.isPending || !form.name}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-40 transition-all"
          >
            {mutation.isPending ? 'Creating…' : 'Create Team'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamCard({ team }: { team: Team }) {
  const router = useRouter();
  const qc = useQueryClient();

  const leaveMutation = useMutation({
    mutationFn: () => teamService.leave(team._id || team.id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams'] }); toast.success('Left team'); },
    onError: () => toast.error('Failed to leave team'),
  });

  const leaderName = typeof team.leader === 'object'
    ? `${team.leader.firstName} ${team.leader.lastName}`
    : 'Unknown';
  const memberCount = team.members?.length || 0;
  const teamId = team._id || team.id;

  return (
    <div className="glass-card p-5 hover:-translate-y-1 hover:border-white/15 transition-all duration-300 group flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {team.name[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-base leading-tight group-hover:text-purple-400 transition-colors line-clamp-1">
              {team.name}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{team.description || 'No description'}</p>
          </div>
        </div>
        {team.isOpen
          ? <Unlock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          : <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 text-amber-400/70" />
          {leaderName}
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <Users className="w-3.5 h-3.5 text-purple-400/70" />
          {memberCount}{team.maxSize ? `/${team.maxSize}` : ''} members
        </span>
      </div>

      {/* Member avatars */}
      {team.members && team.members.length > 0 && (
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {team.members.slice(0, 5).map((m: any, i: number) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 border-2 border-[#0A0E27] flex items-center justify-center text-xs font-bold text-white"
              >
                {(m.firstName || m.user?.firstName || '?')[0]}
              </div>
            ))}
          </div>
          {team.members.length > 5 && (
            <span className="text-xs text-gray-500 ml-2">+{team.members.length - 5} more</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => router.push(`/teams/${teamId}/chat`)}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/20"
        >
          <MessageSquare className="w-4 h-4" /> Chat
        </button>
        <button
          onClick={() => router.push(`/teams/${teamId}/settings`)}
          className="p-2.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/8 border border-white/8 hover:border-white/15 transition-all"
          title="Team Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamService.getAll(),
  });

  const teams = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 animate-slide-up">
      {showModal && <CreateTeamModal onClose={() => setShowModal(false)} />}

      {/* Header */}
      <div className="page-hero">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Teams</h1>
            <p className="text-gray-400 text-sm">Collaborate with other developers on projects</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/20 flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Team
          </button>
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && <ErrorMessage message="Failed to load teams" onRetry={refetch} />}

      {!isLoading && !error && (
        teams.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No teams yet</p>
            <p className="text-sm text-gray-600 mt-1">Create a team to start collaborating!</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Create your first team →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {teams.map((team: Team) => (
              <TeamCard key={team.id || team._id} team={team} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
