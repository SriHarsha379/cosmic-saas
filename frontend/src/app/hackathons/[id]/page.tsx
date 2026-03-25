'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Calendar, Users, DollarSign, Tag } from 'lucide-react';
import { hackathonService } from '@/services/hackathon.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function HackathonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: hackathon, isLoading, error } = useQuery({
    queryKey: ['hackathon', id],
    queryFn: () => hackathonService.getById(id),
  });

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  if (error || !hackathon) return <ErrorMessage message="Failed to load hackathon details" />;

  return (
    <div className="space-y-6 animate-slide-up max-w-4xl">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 rounded-xl">
            <Trophy className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{hackathon.title}</h1>
            <span className="text-sm px-2.5 py-1 mt-2 inline-block rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 capitalize">
              {hackathon.status}
            </span>
          </div>
        </div>

        <p className="text-gray-300 mb-6">{hackathon.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <Users className="w-4 h-4 text-purple-400" />, label: 'Participants', value: hackathon.participants?.length ?? 0 },
            { icon: <DollarSign className="w-4 h-4 text-amber-400" />, label: 'Prize Pool', value: `$${hackathon.prizePool?.toLocaleString()}` },
            { icon: <Calendar className="w-4 h-4 text-cyan-400" />, label: 'Start Date', value: new Date(hackathon.startDate).toLocaleDateString() },
            { icon: <Calendar className="w-4 h-4 text-blue-400" />, label: 'End Date', value: new Date(hackathon.endDate).toLocaleDateString() },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                {icon}
                <span className="text-xs text-gray-400">{label}</span>
              </div>
              <p className="text-sm font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>

        {hackathon.tags?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-gray-400" />
            {hackathon.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
