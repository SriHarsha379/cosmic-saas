'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Lock, Unlock, Crown, X } from 'lucide-react';
import { toast } from 'sonner';
import { teamService } from '@/services/team.service';
import { hackathonService } from '@/services/hackathon.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { Team } from '@/types';

function CreateTeamModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', description: '', hackathon: '', maxSize: 4 });

  const { data: hackathons } = useQuery({
    queryKey: ['hackathons'],
    queryFn: () => hackathonService.getAll('active'),
  });

  const mutation = useMutation({
    mutationFn: () => teamService.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team created!');
      onClose();
    },
    onError: () => toast.error('Failed to create team'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0E1330] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Create Team</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Team Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Awesome Team"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What's your team about?"
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-sm resize-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Hackathon</label>
            <select
              value={form.hackathon}
              onChange={(e) => setForm({ ...form, hackathon: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all"
            >
              <option value="" className="bg-[#0E1330]">Select a hackathon</option>
              {hackathons?.map((h) => (
                <option key={h._id} value={h._id} className="bg-[#0E1330]">{h.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Max Team Size</label>
            <input
              type="number"
              min={2}
              max={10}
              value={form.maxSize}
              onChange={(e) => setForm({ ...form, maxSize: Number(e.target.value) })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 text-sm transition-all"
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
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.name || !form.hackathon}
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
  const qc = useQueryClient();
  const leaveMutation = useMutation({
    mutationFn: () => teamService.leave(team._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Left team');
    },
    onError: () => toast.error('Failed to leave team'),
  });

  const leaderName = typeof team.leader === 'object'
    ? `${team.leader.firstName} ${team.leader.lastName}`
    : 'Unknown';

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-white">{team.name}</h3>
          <p className="text-sm text-gray-400 mt-1">{team.description || 'No description'}</p>
        </div>
        {team.isOpen ? (
          <Unlock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        ) : (
          <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
        <Crown className="w-4 h-4 text-amber-400" />
        <span>Led by {leaderName}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="w-4 h-4 text-purple-400" />
          <span>{team.members?.length ?? 0}/{team.maxSize} members</span>
        </div>
        <button
          onClick={() => leaveMutation.mutate()}
          disabled={leaveMutation.isPending}
          className="px-3 py-1.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 rounded-xl text-xs transition-all disabled:opacity-50"
        >
          {leaveMutation.isPending ? 'Leaving...' : 'Leave'}
        </button>
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['teams'],
    queryFn: teamService.getAll,
  });

  return (
    <div className="space-y-6 animate-slide-up">
      {showCreate && <CreateTeamModal onClose={() => setShowCreate(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Teams</h2>
          <p className="text-sm text-gray-400 mt-0.5">Collaborate with others</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300"
        >
          <Plus className="w-4 h-4" /> Create Team
        </button>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}
      {error && <ErrorMessage message="Failed to load teams" onRetry={refetch} />}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No teams yet. Create or join one!</p>
            </div>
          ) : (
            data.map((team) => <TeamCard key={team._id} team={team} />)
          )}
        </div>
      )}
    </div>
  );
}
