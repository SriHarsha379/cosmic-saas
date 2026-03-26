'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, MapPin, DollarSign, Plus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import api from '@/lib/api';

function JobCard({ job }: { job: any }) {
  const router = useRouter();

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/8 transition-all duration-300 group">
      <div className="h-32 bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
        <Briefcase className="w-16 h-16 text-white/30" />
      </div>

      <div className="p-5">
        <div className="mb-2">
          <h3 className="font-semibold text-white text-lg group-hover:text-emerald-400 transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-gray-400">{job.company}</p>
        </div>

        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{job.description}</p>

        <div className="space-y-2 text-sm text-gray-300 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{job.location || 'Remote'}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>{job.salary || 'Competitive'}</span>
          </div>
        </div>

        <button
          onClick={() => router.push(`/jobs/${job.id}`)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-all group-hover:shadow-lg group-hover:shadow-emerald-500/20"
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Jobs</h2>
          <p className="text-sm text-gray-400 mt-0.5">Explore exciting job opportunities</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300">
          <Plus className="w-4 h-4" /> Post Job
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
        />
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner /></div>}
      {error && <ErrorMessage message="Failed to load jobs" onRetry={refetch} />}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No jobs available</p>
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
