'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Plus, X, MapPin, Globe, Github, Linkedin, User, Briefcase, GraduationCap, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-purple-400" />
        </div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

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
    lastName:  user?.lastName  ?? '',
    email:     user?.email     ?? '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof form) => api.put('/profile', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile'] }); toast.success('Profile updated!'); },
    onError: () => toast.error('Failed to update profile'),
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: typeof basicForm) => api.put('/auth/update', data),
    onSuccess: (res) => { updateUser(res.data.data); toast.success('Account updated!'); },
    onError: () => toast.error('Failed to update account'),
  });

  const addSkill = () => {
    const s = form.newSkill.trim();
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s], newSkill: '' });
    }
  };

  const socialFields = [
    { key: 'location', label: 'Location',  icon: MapPin,    placeholder: 'New York, USA' },
    { key: 'website',  label: 'Website',   icon: Globe,     placeholder: 'https://yoursite.com' },
    { key: 'github',   label: 'GitHub',    icon: Github,    placeholder: 'https://github.com/username' },
    { key: 'linkedin', label: 'LinkedIn',  icon: Linkedin,  placeholder: 'https://linkedin.com/in/username' },
  ];

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Profile</h1>
        <p className="text-sm text-gray-400">Manage your public profile and preferences</p>
      </div>

      {/* Avatar card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/25">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0A0E27]" title="Active" />
          </div>
          <div className="flex-1">
            <p className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-4 h-4 rounded bg-purple-500/20 flex items-center justify-center">
                <ShieldCheck className="w-2.5 h-2.5 text-purple-400" />
              </div>
              <span className={`text-xs font-medium capitalize ${user?.role === 'ADMIN' ? 'text-amber-400' : 'text-purple-400'}`}>
                {user?.role?.toLowerCase() || 'user'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <SectionCard title="Account Info" icon={User}>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">First Name</label>
            <input
              type="text"
              value={basicForm.firstName}
              onChange={(e) => setBasicForm({ ...basicForm, firstName: e.target.value })}
              className="cosmic-input"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Last Name</label>
            <input
              type="text"
              value={basicForm.lastName}
              onChange={(e) => setBasicForm({ ...basicForm, lastName: e.target.value })}
              className="cosmic-input"
            />
          </div>
        </div>
        <button
          onClick={() => updateUserMutation.mutate(basicForm)}
          disabled={updateUserMutation.isPending}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-purple-500/20"
        >
          <Save className="w-4 h-4" />
          {updateUserMutation.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </SectionCard>

      {/* Bio & Links */}
      <SectionCard title="Profile Details" icon={Briefcase}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell the world about yourself…"
              rows={3}
              className="cosmic-input resize-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            {socialFields.map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-400 mb-2">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    value={form[key as keyof typeof form] as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="cosmic-input pl-10"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Skills */}
      <SectionCard title="Skills" icon={GraduationCap}>
        <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
          {form.skills.length === 0 && (
            <p className="text-xs text-gray-600">Add skills to showcase your expertise</p>
          )}
          {form.skills.map((skill) => (
            <span
              key={skill}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-purple-500/12 border border-purple-500/20 text-purple-300 rounded-full"
            >
              {skill}
              <button
                onClick={() => setForm({ ...form, skills: form.skills.filter(s => s !== skill) })}
                className="hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
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
            placeholder="e.g. React, TypeScript, Python…"
            className="cosmic-input flex-1"
          />
          <button
            onClick={addSkill}
            className="p-2.5 bg-white/5 hover:bg-purple-500/15 border border-white/10 hover:border-purple-500/25 rounded-xl text-gray-400 hover:text-purple-400 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => updateProfileMutation.mutate(form)}
          disabled={updateProfileMutation.isPending}
          className="flex items-center gap-2 mt-5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-purple-500/20"
        >
          <Save className="w-4 h-4" />
          {updateProfileMutation.isPending ? 'Saving…' : 'Save Profile'}
        </button>
      </SectionCard>
    </div>
  );
}
