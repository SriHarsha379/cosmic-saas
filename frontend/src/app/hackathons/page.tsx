'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trophy, Users, Calendar, DollarSign, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { hackathonService } from '@/services/hackathon.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { Hackathon } from '@/types';

const TABS = ['all', 'active', 'upcoming', 'completed'] as const;
type Tab = typeof TABS[number];

function HackathonCard({ hackathon, onJoin, onLeave, isJoining, isLeaving, isParticipant }: {
  hackathon: Hackathon;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  isJoining: boolean;
  isLeaving: boolean;
  isParticipant: boolean;
}) {
  const statusColors: Record<string, string> = {
    active: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    upcoming: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    completed: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-base font-semibold text-white truncate">{hackathon.title}</h3>
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{hackathon.description}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${statusColors[hackathon.status]}`}>
          {hackathon.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 my-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>{hackathon.participants?.length ?? 0} participants</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <DollarSign className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>${hackathon.prizePool?.toLocaleString() ?? 0}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 col-span-2">
          <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{new Date(hackathon.startDate).toLocaleDateString()} – {new Date(hackathon.endDate).toLocaleDateString()}</span>
        </div>
      </div>

      {hackathon.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {hackathon.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {hackathon.status !== 'completed' && (
        <div className="flex gap-2">
          {isParticipant ? (
            <button
              onClick={() => onLeave(hackathon._id)}
              disabled={isLeaving}
              className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-gray-300 hover:text-red-400 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
            >
              {isLeaving ? 'Leaving...' : 'Leave'}
            </button>
          ) : (
            <button
              onClick={() => onJoin(hackathon._id)}
              disabled={isJoining}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 disabled:opacity-50"
            >
              {isJoining ? 'Joining...' : 'Join Hackathon'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function HackathonsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['hackathons', activeTab],
    queryFn: () => hackathonService.getAll(activeTab === 'all' ? undefined : activeTab),
  });

  const joinMutation = useMutation({
    mutationFn: (id: string) => hackathonService.join(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hackathons'] });
      toast.success('Successfully joined hackathon!');
    },
    onError: () => toast.error('Failed to join hackathon'),
  });

  const leaveMutation = useMutation({
    mutationFn: (id: string) => hackathonService.leave(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hackathons'] });
      toast.success('Left hackathon');
    },
    onError: () => toast.error('Failed to leave hackathon'),
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Hackathons</h2>
          <p className="text-sm text-gray-400 mt-0.5">Compete, collaborate, and win prizes</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300">
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}
      {error && <ErrorMessage message="Failed to load hackathons" onRetry={refetch} />}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No hackathons found</p>
            </div>
          ) : (
            data.map((h) => (
              <HackathonCard
                key={h._id}
                hackathon={h}
                onJoin={(id) => joinMutation.mutate(id)}
                onLeave={(id) => leaveMutation.mutate(id)}
                isJoining={joinMutation.isPending}
                isLeaving={leaveMutation.isPending}
                isParticipant={false}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
