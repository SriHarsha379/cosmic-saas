'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trophy, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { hackathonService } from '@/services/hackathon.service';

export default function CreateHackathonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    prizePool: '',
    status: 'UPCOMING',
  });

  const { data: existing } = useQuery({
    queryKey: ['hackathon', editId],
    queryFn: () => hackathonService.getById(editId!),
    enabled: !!editId,
  });

  useEffect(() => {
    if (existing) {
      const h = existing as any;
      setForm({
        title: h.title || '',
        description: h.description || '',
        startDate: h.startDate ? h.startDate.slice(0, 10) : '',
        endDate: h.endDate ? h.endDate.slice(0, 10) : '',
        prizePool: h.prizePool || '',
        status: h.status || 'UPCOMING',
      });
    }
  }, [existing]);

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      isEditing ? hackathonService.update(editId!, data) : hackathonService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hackathons'] });
      qc.invalidateQueries({ queryKey: ['admin-hackathons-list'] });
      toast.success(isEditing ? 'Hackathon updated!' : 'Hackathon created!');
      router.push('/admin/hackathons');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to save hackathon');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    const payload: any = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      prizePool: form.prizePool.trim() || undefined,
      status: form.status,
    };
    if (form.startDate) payload.startDate = new Date(form.startDate).toISOString();
    if (form.endDate) payload.endDate = new Date(form.endDate).toISOString();
    createMutation.mutate(payload);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {isEditing ? 'Edit Hackathon' : 'Create Hackathon'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isEditing ? 'Update hackathon details' : 'Set up a new hackathon for participants'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Hackathon Details</h2>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Web Dev Marathon 2026"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:bg-white/8 transition-all text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe what participants will build..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:bg-white/8 transition-all text-sm resize-none"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 focus:bg-white/8 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 focus:bg-white/8 transition-all text-sm"
              />
            </div>
          </div>

          {/* Prize Pool */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Prize Pool</label>
            <input
              type="text"
              name="prizePool"
              value={form.prizePool}
              onChange={handleChange}
              placeholder="e.g. $10,000"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-purple-500 focus:bg-white/8 transition-all text-sm"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full bg-[#0A0E27] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition-all text-sm"
            >
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-lg transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {createMutation.isPending
              ? isEditing
                ? 'Saving...'
                : 'Creating...'
              : isEditing
              ? 'Save Changes'
              : 'Create Hackathon'}
          </button>
        </div>
      </form>
    </div>
  );
}
