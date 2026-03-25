'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText, Clock, Building2, Briefcase } from 'lucide-react';
import { jobService } from '@/services/job.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { Application, Job } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  reviewing: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  shortlisted: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  rejected: 'text-red-400 bg-red-400/10 border-red-400/20',
  accepted: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

export default function ApplicationsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['applications'],
    queryFn: jobService.getApplications,
  });

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-white">Applications</h2>
        <p className="text-sm text-gray-400 mt-0.5">Track your job applications</p>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}
      {error && <ErrorMessage message="Failed to load applications" onRetry={refetch} />}

      {data && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          {data.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No applications yet. Start applying for jobs!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {data.map((app: Application) => {
                const job = typeof app.job === 'object' ? app.job as Job : null;
                return (
                  <div key={app._id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors">
                    <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex-shrink-0">
                      <Briefcase className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{job?.title ?? 'Unknown Job'}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {job?.company ?? 'Unknown Company'}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border capitalize flex-shrink-0 ${STATUS_STYLES[app.status] ?? STATUS_STYLES.pending}`}>
                      {app.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
