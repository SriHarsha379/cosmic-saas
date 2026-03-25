'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    bio: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    skills: [] as string[],
    newSkill: '',
  });

  const [basicForm, setBasicForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof form) => api.put('/profile', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: typeof basicForm) => api.put('/auth/update', data),
    onSuccess: (res) => {
      updateUser(res.data.data);
      toast.success('Account updated!');
    },
    onError: () => toast.error('Failed to update account'),
  });

  const addSkill = () => {
    const s = form.newSkill.trim();
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s], newSkill: '' });
    }
  };

  const removeSkill = (skill: string) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-white">Profile</h2>
        <p className="text-sm text-gray-400 mt-0.5">Manage your public profile</p>
      </div>

      {/* Avatar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/30">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <p className="text-lg font-semibold text-white">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <p className="text-xs text-purple-400 mt-1 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-purple-400" />
          Account Info
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">First Name</label>
            <input
              type="text"
              value={basicForm.firstName}
              onChange={(e) => setBasicForm({ ...basicForm, firstName: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Last Name</label>
            <input
              type="text"
              value={basicForm.lastName}
              onChange={(e) => setBasicForm({ ...basicForm, lastName: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>
        <button
          onClick={() => updateUserMutation.mutate(basicForm)}
          disabled={updateUserMutation.isPending}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Profile Details */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Profile Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none transition-all"
            />
          </div>
          {[
            { key: 'location', label: 'Location', placeholder: 'New York, USA' },
            { key: 'website', label: 'Website', placeholder: 'https://yoursite.com' },
            { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
            { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
              <input
                type="text"
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>
          ))}

          {/* Skills */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.skills.map((skill) => (
                <span key={skill} className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.newSkill}
                onChange={(e) => setForm({ ...form, newSkill: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Add a skill..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all"
              />
              <button
                onClick={addSkill}
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => updateProfileMutation.mutate(form)}
          disabled={updateProfileMutation.isPending}
          className="flex items-center gap-2 mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
