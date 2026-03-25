'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Briefcase, MapPin, DollarSign, ArrowLeft } from 'lucide-react';
import { jobService } from '@/services/job.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getById(id),
  });

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  if (error || !job) return <ErrorMessage message="Failed to load job details" />;

  return (
    <div className="space-y-6 animate-slide-up max-w-3xl">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </button>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 rounded-xl">
            <Briefcase className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
            <p className="text-purple-400 font-medium mt-1">{job.company}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-400">
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-400" />{job.location}</span>
          {job.salaryMin && <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-amber-400" />${job.salaryMin.toLocaleString()} – ${job.salaryMax?.toLocaleString()}</span>}
        </div>

        <p className="text-gray-300 mb-6 leading-relaxed">{job.description}</p>

        {job.requirements?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">Requirements</h3>
            <ul className="space-y-1.5">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-purple-400 mt-0.5">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {job.skills?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span key={skill} className="text-xs px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => jobService.apply(job._id, {})}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-6 py-3 font-medium transition-all duration-300"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}
