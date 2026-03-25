'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Briefcase, MapPin, DollarSign, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { jobService } from '@/services/job.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { Job } from '@/types';

function JobCard({ job }: { job: Job }) {
  const qc = useQueryClient();
  const [applying, setApplying] = useState(false);

  const applyMutation = useMutation({
    mutationFn: () => jobService.apply(job._id, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application submitted!');
      setApplying(false);
    },
    onError: () => {
      toast.error('Failed to apply');
      setApplying(false);
    },
  });

  const typeColors: Record<string, string> = {
    'full-time': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    'part-time': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    contract: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    internship: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    remote: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  };

  const salary =
    job.salaryMin && job.salaryMax
      ? `$${job.salaryMin.toLocaleString()} – $${job.salaryMax.toLocaleString()}`
      : job.salaryMin
      ? `From $${job.salaryMin.toLocaleString()}`
      : 'Salary not disclosed';

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-base font-semibold text-white">{job.title}</h3>
          <p className="text-sm text-purple-400 font-medium">{job.company}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border flex-shrink-0 capitalize ${typeColors[job.type] ?? typeColors['full-time']}`}>
          {job.type}
        </span>
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-400">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-400" />
          {job.location}
        </span>
        <span className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          {salary}
        </span>
      </div>

      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills.slice(0, 5).map((skill) => (
            <span key={skill} className="text-xs px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full">
              {skill}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => { setApplying(true); applyMutation.mutate(); }}
        disabled={applyMutation.isPending || applying}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 disabled:opacity-50"
      >
        {applyMutation.isPending ? 'Applying...' : 'Apply Now'}
      </button>
    </div>
  );
}

export default function JobsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: '', experienceLevel: '' });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobService.getAll(filters),
  });

  const filtered = data?.filter((j) =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-white">Job Board</h2>
        <p className="text-sm text-gray-400 mt-0.5">Find your next opportunity</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 text-sm transition-all"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-gray-300 focus:outline-none focus:border-purple-500/50 text-sm appearance-none"
            >
              <option value="" className="bg-[#0E1330]">All Types</option>
              <option value="full-time" className="bg-[#0E1330]">Full-time</option>
              <option value="part-time" className="bg-[#0E1330]">Part-time</option>
              <option value="contract" className="bg-[#0E1330]">Contract</option>
              <option value="internship" className="bg-[#0E1330]">Internship</option>
              <option value="remote" className="bg-[#0E1330]">Remote</option>
            </select>
          </div>
          <select
            value={filters.experienceLevel}
            onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-gray-300 focus:outline-none focus:border-purple-500/50 text-sm appearance-none"
          >
            <option value="" className="bg-[#0E1330]">All Levels</option>
            <option value="entry" className="bg-[#0E1330]">Entry</option>
            <option value="mid" className="bg-[#0E1330]">Mid</option>
            <option value="senior" className="bg-[#0E1330]">Senior</option>
            <option value="lead" className="bg-[#0E1330]">Lead</option>
          </select>
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}
      {error && <ErrorMessage message="Failed to load jobs" onRetry={refetch} />}

      {filtered && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No jobs found</p>
            </div>
          ) : (
            filtered.map((job) => <JobCard key={job._id} job={job} />)
          )}
        </div>
      )}
    </div>
  );
}
