'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, Plus, Calendar, Clock, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { interviewService } from '@/services/interview.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { Interview } from '@/types';

const STATUS_CONFIG: Record<string, { badge: string; icon: any; dot: string }> = {
  scheduled: { badge: 'bg-blue-500/15 border-blue-500/30 text-blue-300',     icon: AlertCircle,  dot: 'bg-blue-400' },
  completed: { badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300', icon: CheckCircle, dot: 'bg-emerald-400' },
  cancelled: { badge: 'bg-red-500/15 border-red-500/30 text-red-300',         icon: XCircle,      dot: 'bg-red-400' },
};

const TYPE_COLORS: Record<string, string> = {
  technical:   'bg-blue-500/15 text-blue-400 border-blue-500/20',
  hr:          'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  behavioral:  'bg-purple-500/15 text-purple-400 border-purple-500/20',
};

function ScheduleModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ type: 'technical', scheduledAt: '', duration: 60 });

  const mutation = useMutation({
    mutationFn: () => interviewService.schedule(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Interview scheduled!');
      onClose();
    },
    onError: () => toast.error('Failed to schedule interview'),
  });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Schedule Interview</h2>
            <p className="text-xs text-gray-500 mt-0.5">Set up a practice session</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/8 rounded-lg text-gray-400 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Interview Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="cosmic-input"
              style={{ background: '#0E1330' }}
            >
              <option value="technical"  className="bg-[#0E1330]">Technical</option>
              <option value="hr"         className="bg-[#0E1330]">HR</option>
              <option value="behavioral" className="bg-[#0E1330]">Behavioral</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Date & Time</label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="cosmic-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Duration (minutes)</label>
            <input
              type="number"
              min={15}
              max={180}
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              className="cosmic-input"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-sm transition-all">
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.scheduledAt}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-40 transition-all"
          >
            {mutation.isPending ? 'Scheduling…' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InterviewCard({ interview }: { interview: Interview }) {
  const qc = useQueryClient();
  const cancelMutation = useMutation({
    mutationFn: () => interviewService.cancel(interview._id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['interviews'] }); toast.success('Interview cancelled'); },
    onError: () => toast.error('Failed to cancel interview'),
  });

  const statusCfg = STATUS_CONFIG[interview.status] || STATUS_CONFIG.scheduled;
  const StatusIcon = statusCfg.icon;
  const typeCfg = TYPE_COLORS[interview.type] || TYPE_COLORS.technical;

  return (
    <div className="glass-card p-5 hover:border-white/15 hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${typeCfg}`}>
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white capitalize">{interview.type} Interview</h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{interview.duration} min</span>
            </div>
          </div>
        </div>
        <span className={`badge border flex-shrink-0 ${statusCfg.badge}`}>
          <StatusIcon className="w-3 h-3" />
          {interview.status}
        </span>
      </div>

      {/* Scheduled time */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white/4 rounded-xl">
        <Calendar className="w-4 h-4 text-blue-400/70 flex-shrink-0" />
        <span className="text-sm text-gray-300">
          {new Date(interview.scheduledAt).toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </span>
      </div>

      {/* Feedback */}
      {interview.feedback && (
        <div className="bg-white/4 border border-white/8 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1 font-medium">Feedback</p>
          <p className="text-sm text-gray-300 leading-relaxed">{interview.feedback}</p>
          {interview.score !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 progress-bar">
                <div className="progress-fill bg-purple-500" style={{ width: `${interview.score}%` }} />
              </div>
              <span className="text-xs text-purple-400 font-semibold flex-shrink-0">{interview.score}/100</span>
            </div>
          )}
        </div>
      )}

      {interview.status === 'scheduled' && (
        <button
          onClick={() => cancelMutation.mutate()}
          disabled={cancelMutation.isPending}
          className="w-full px-4 py-2 bg-white/4 hover:bg-red-500/10 border border-white/8 hover:border-red-500/25 text-gray-400 hover:text-red-400 rounded-xl text-sm transition-all disabled:opacity-40"
        >
          {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Interview'}
        </button>
      )}
    </div>
  );
}

export default function InterviewsPage() {
  const [showSchedule, setShowSchedule] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['interviews'],
    queryFn: interviewService.getAll,
  });

  const interviews = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 animate-slide-up">
      {showSchedule && <ScheduleModal onClose={() => setShowSchedule(false)} />}

      {/* Header */}
      <div className="page-hero">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Interviews</h1>
            <p className="text-gray-400 text-sm">Practice and ace your next job interview</p>
          </div>
          <button
            onClick={() => setShowSchedule(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/20 flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Schedule
          </button>
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}
      {error && <ErrorMessage message="Failed to load interviews" onRetry={refetch} />}

      {!isLoading && !error && (
        interviews.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
              <Video className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No interviews scheduled yet</p>
            <p className="text-sm text-gray-600 mt-1">Schedule your first practice interview to get started!</p>
            <button
              onClick={() => setShowSchedule(true)}
              className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Schedule now →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
            {interviews.map((i) => <InterviewCard key={i._id} interview={i} />)}
          </div>
        )
      )}
    </div>
  );
}
