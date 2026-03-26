'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText, Clock, Building2, Briefcase, TrendingUp } from 'lucide-react';
import { jobService } from '@/services/job.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { Application, Job } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  pending:     { label: 'Pending',     badge: 'bg-amber-500/15 border-amber-500/30 text-amber-300',    dot: 'bg-amber-400'    },
  reviewing:   { label: 'Reviewing',   badge: 'bg-blue-500/15 border-blue-500/30 text-blue-300',       dot: 'bg-blue-400'     },
  shortlisted: { label: 'Shortlisted', badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300', dot: 'bg-emerald-400' },
  rejected:    { label: 'Rejected',    badge: 'bg-red-500/15 border-red-500/30 text-red-300',           dot: 'bg-red-400'      },
  accepted:    { label: 'Accepted',    badge: 'bg-purple-500/15 border-purple-500/30 text-purple-300',  dot: 'bg-purple-400'   },
};

export default function ApplicationsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['applications'],
    queryFn: jobService.getApplications,
  });

  const apps = Array.isArray(data) ? data : [];

  const statusCounts = apps.reduce((acc: Record<string, number>, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="page-hero">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Applications</h1>
            <p className="text-gray-400 text-sm">Track the status of your job applications</p>
          </div>
          {apps.length > 0 && (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{apps.length} applications</span>
            </div>
          )}
        </div>
      </div>

      {/* Status summary pills */}
      {apps.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([status, count]) => {
            const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
            return (
              <div key={status} className={`badge border ${cfg.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}: {count}
              </div>
            );
          })}
        </div>
      )}

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}
      {error && <ErrorMessage message="Failed to load applications" onRetry={refetch} />}

      {data && (
        <>
          {apps.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">No applications yet</p>
              <p className="text-sm text-gray-600 mt-1">Browse jobs and start applying!</p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="divide-y divide-white/5">
                {apps.map((app: Application) => {
                  const job = typeof app.job === 'object' ? app.job as Job : null;
                  const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
                  return (
                    <div key={app._id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-5 h-5 text-white/80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{job?.title ?? 'Unknown Job'}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {job?.company ?? 'Unknown Company'}
                          </span>
                          <span className="text-xs text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <span className={`badge border flex-shrink-0 ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
