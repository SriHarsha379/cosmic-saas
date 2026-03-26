'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, MessageSquare, Settings, Lock, Unlock, Crown } from 'lucide-react';
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
    mutationFn: (data) => teamService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team created successfully!');
      onClose();
    },
    onError: () => toast.error('Failed to create team'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0E1330] border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Create Team</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Team Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter team name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Team description"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 text-sm resize-none transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate(form as any)}
            disabled={mutation.isPending || !form.name}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50"
          >
            {mutation.isPending ? 'Creating...' : 'Create Team'}
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Left team');
    },
    onError: () => toast.error('Failed to leave team'),
  });

  const leaderName = typeof team.leader === 'object'
    ? `${team.leader.firstName} ${team.leader.lastName}`
    : 'Unknown';

  const memberCount = team.members?.length || 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all duration-300">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white text-lg">{team.name}</h3>
          {team.isOpen ? (
            <Unlock className="w-4 h-4 text-emerald-400" />
          ) : (
            <Lock className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <p className="text-sm text-gray-400 line-clamp-2">{team.description || 'No description'}</p>
      </div>

      <div className="space-y-2 text-sm text-gray-300 mb-4">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          Led by {leaderName}
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          {memberCount} members {team.maxSize && `/ ${team.maxSize}`}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => router.push(`/teams/${team._id || team.id}/chat`)}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </button>
        <button
          onClick={() => router.push(`/teams/${team._id || team.id}/settings`)}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-all"
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Teams</h2>
          <p className="text-sm text-gray-400 mt-0.5">Collaborate with your team members</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300"
        >
          <Plus className="w-4 h-4" /> Create Team
        </button>
      </div>

      {showModal && <CreateTeamModal onClose={() => setShowModal(false)} />}

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && <ErrorMessage message="Failed to load teams" onRetry={refetch} />}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No teams yet. Create one to get started!</p>
            </div>
          ) : (
            teams.map((team: Team) => (
              <TeamCard key={team.id || team._id} team={team} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
