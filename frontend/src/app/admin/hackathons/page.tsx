'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Trophy, Plus, Pencil, Trash2, Users, Calendar, Search } from 'lucide-react';
import { toast } from 'sonner';
import { hackathonService } from '@/services/hackathon.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function AdminHackathonsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: rawData = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-hackathons-list', statusFilter],
    queryFn: () => hackathonService.getAll(statusFilter || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hackathonService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-hackathons-list'] });
      qc.invalidateQueries({ queryKey: ['hackathons'] });
      toast.success('Hackathon deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to delete hackathon');
    },
  });

  const hackathons = Array.isArray(rawData) ? rawData : [];

  const filtered = hackathons.filter((h: any) =>
    h.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusStyle = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      UPCOMING: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      COMPLETED: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };
    return map[status] || map.UPCOMING;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Manage Hackathons</h1>
          <p className="text-gray-400 text-sm mt-1">
            Create, edit and delete hackathons
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/hackathons/create')}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300"
        >
          <Plus className="w-4 h-4" /> Create Hackathon
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex-1">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search hackathons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-white placeholder-gray-500 outline-none text-sm flex-1"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'ACTIVE', 'UPCOMING', 'COMPLETED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === s
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}
      {error && <ErrorMessage message="Failed to load hackathons" onRetry={refetch} />}

      {!isLoading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No hackathons found</p>
              <button
                onClick={() => router.push('/admin/hackathons/create')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg px-4 py-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Create First Hackathon
              </button>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Hackathon
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Participants
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Prize Pool
                      </th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filtered.map((h: any) => (
                      <tr key={h.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                              <Trophy className="w-4 h-4 text-amber-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{h.title}</p>
                              <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">
                                {h.description || 'No description'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full font-medium border ${getStatusStyle(
                              h.status
                            )}`}
                          >
                            {h.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-300">
                            <Users className="w-4 h-4 text-gray-500" />
                            {h._count?.participants || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-300">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>
                              {h.startDate
                                ? new Date(h.startDate).toLocaleDateString()
                                : 'TBA'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-300">{h.prizePool || '—'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                router.push(`/admin/hackathons/create?edit=${h.id}`)
                              }
                              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(h.id, h.title)}
                              disabled={deleteMutation.isPending}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
