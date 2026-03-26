'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Calendar, Trophy, Plus, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { hackathonService } from '@/services/hackathon.service';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

function HackathonCard({ hackathon }: { hackathon: any }) {
  const qc = useQueryClient();

  const joinMutation = useMutation({
    mutationFn: () => hackathonService.join(hackathon.id),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['hackathons'] });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.error || 'Failed to join hackathon';
      toast.error(errorMsg);
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, any> = {
      ACTIVE: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-300' },
      UPCOMING: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-300' },
      COMPLETED: { bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-300' },
    };
    const style = statusMap[status] || statusMap.UPCOMING;
    return (
      <span className={`inline-block px-2 py-1 ${style.bg} border ${style.border} ${style.text} text-xs rounded-full font-medium`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/8 transition-all duration-300 group">
      {hackathon.image ? (
        <div className="relative h-40 bg-gradient-to-br from-purple-600 to-blue-600 overflow-hidden">
          <img
            src={hackathon.image}
            alt={hackathon.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all" />
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
          <Trophy className="w-12 h-12 text-white/30" />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white text-lg mb-1 group-hover:text-purple-400 transition-colors">
              {hackathon.title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">{hackathon.description}</p>
          </div>
          {getStatusBadge(hackathon.status || 'UPCOMING')}
        </div>

        <div className="space-y-2 text-sm text-gray-300 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span>{hackathon._count?.participants || 0} participants</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>{hackathon.startDate ? new Date(hackathon.startDate).toLocaleDateString() : 'TBA'}</span>
          </div>
          {hackathon.prizePool && (
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{hackathon.prizePool} prize pool</span>
            </div>
          )}
        </div>

        <button
          onClick={() => joinMutation.mutate()}
          disabled={joinMutation.isPending}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-50 group-hover:shadow-lg group-hover:shadow-purple-500/20"
        >
          {joinMutation.isPending ? 'Joining...' : 'Join Hackathon'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function HackathonsPage() {
  const [status, setStatus] = useState('');
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const { data: rawData, isLoading, error, refetch } = useQuery({
    queryKey: ['hackathons', status],
    queryFn: () => hackathonService.getAll(status || undefined),
  });

  const data = Array.isArray(rawData) ? rawData : [];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Hackathons</h2>
          <p className="text-sm text-gray-400 mt-0.5">Compete in exciting hackathons and win prizes</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => router.push('/admin/hackathons/create')}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300"
          >
            <Plus className="w-4 h-4" /> Create Hackathon
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'ACTIVE', 'UPCOMING', 'COMPLETED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              status === s
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && <ErrorMessage message="Failed to load hackathons" onRetry={refetch} />}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No hackathons available</p>
            </div>
          ) : (
            data.map((hackathon: any) => (
              <HackathonCard key={hackathon.id || hackathon._id} hackathon={hackathon} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
