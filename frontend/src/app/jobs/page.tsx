'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, MapPin, DollarSign, Search, ArrowRight, Building2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import api from '@/lib/api';

function JobCard({ job }: { job: any }) {
  const router = useRouter();
  const postedAgo = job.createdAt
    ? Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="glass-card p-5 group hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
      {/* Company header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
          <Building2 className="w-6 h-6 text-white/80" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base leading-tight group-hover:text-emerald-400 transition-colors line-clamp-1">
            {job.title}
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">{job.company}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 line-clamp-2 flex-1">{job.description}</p>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-400/70" />
          {job.location || 'Remote'}
        </span>
        <span className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-amber-400/70" />
          {job.salary || 'Competitive'}
        </span>
        {postedAgo !== null && (
          <span className="flex items-center gap-1.5 ml-auto">
            <Clock className="w-3.5 h-3.5" />
            {postedAgo === 0 ? 'Today' : `${postedAgo}d ago`}
          </span>
        )}
      </div>

      <button
        onClick={() => router.push(`/jobs/${job.id}`)}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0"
      >
        View Details
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: rawData, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', searchQuery],
    queryFn: async () => {
      try {
        const res = await api.get('/jobs', { params: { search: searchQuery } });
        return Array.isArray(res.data.data) ? res.data.data : [];
      } catch {
        return [];
      }
    },
  });

  const data = Array.isArray(rawData) ? rawData : [];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="page-hero">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Jobs</h1>
            <p className="text-gray-400 text-sm">Explore exciting opportunities from top companies</p>
          </div>
          {data.length > 0 && (
            <span className="text-sm text-gray-400 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              {data.length} {data.length === 1 ? 'opening' : 'openings'}
            </span>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by title, company, or location…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="cosmic-input pl-10"
        />
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && <ErrorMessage message="Failed to load jobs" onRetry={refetch} />}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {data.length === 0 ? (
            <div className="col-span-full text-center py-16 glass-card">
              <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No jobs available right now</p>
              <p className="text-sm text-gray-600 mt-1">Check back soon for new openings</p>
            </div>
          ) : (
            data.map((job: any) => (
              <JobCard key={job.id || job._id} job={job} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
