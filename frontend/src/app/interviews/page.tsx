'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, Plus, Calendar, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { interviewService } from '@/services/interview.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { Interview } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0E1330] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Schedule Interview</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Interview Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 text-sm"
            >
              <option value="technical" className="bg-[#0E1330]">Technical</option>
              <option value="hr" className="bg-[#0E1330]">HR</option>
              <option value="behavioral" className="bg-[#0E1330]">Behavioral</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Scheduled At</label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Duration (minutes)</label>
            <input
              type="number"
              min={15}
              max={180}
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-500/50 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-sm">Cancel</button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.scheduledAt}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {mutation.isPending ? 'Scheduling...' : 'Schedule'}
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Interview cancelled');
    },
    onError: () => toast.error('Failed to cancel interview'),
  });

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
            <Video className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white capitalize">{interview.type} Interview</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{interview.duration} min</span>
            </div>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLORS[interview.status]}`}>
          {interview.status}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Calendar className="w-4 h-4 text-blue-400" />
        <span>{new Date(interview.scheduledAt).toLocaleString()}</span>
      </div>

      {interview.feedback && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-400 mb-1">Feedback</p>
          <p className="text-sm text-gray-200">{interview.feedback}</p>
          {interview.score !== undefined && (
            <p className="text-xs text-purple-400 mt-1">Score: {interview.score}/100</p>
          )}
        </div>
      )}

      {interview.status === 'scheduled' && (
        <button
          onClick={() => cancelMutation.mutate()}
          disabled={cancelMutation.isPending}
          className="w-full px-4 py-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 rounded-xl text-sm transition-all disabled:opacity-50"
        >
          {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Interview'}
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

  return (
    <div className="space-y-6 animate-slide-up">
      {showSchedule && <ScheduleModal onClose={() => setShowSchedule(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Interviews</h2>
          <p className="text-sm text-gray-400 mt-0.5">Practice and ace your interviews</p>
        </div>
        <button
          onClick={() => setShowSchedule(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> Schedule
        </button>
      </div>

      {isLoading && <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>}
      {error && <ErrorMessage message="Failed to load interviews" onRetry={refetch} />}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No interviews yet. Schedule your first one!</p>
            </div>
          ) : (
            data.map((i) => <InterviewCard key={i._id} interview={i} />)
          )}
        </div>
      )}
    </div>
  );
}
