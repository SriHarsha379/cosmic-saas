'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Bell, AlertTriangle, LogOut, Trash2, Save, Shield, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface NotificationPreferences {
  emailNotifications: boolean;
  hackathonsNotifications: boolean;
  interviewsNotifications: boolean;
  jobsNotifications: boolean;
  testsNotifications: boolean;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`toggle-track ${checked ? 'on' : ''}`}
      style={{ background: checked ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)' : 'rgba(255,255,255,0.1)' }}
      role="switch"
      aria-checked={checked}
    >
      <span className="toggle-thumb" />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    hackathonsNotifications: true,
    interviewsNotifications: true,
    jobsNotifications: false,
    testsNotifications: true,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: NotificationPreferences) => {
      const res = await api.put('/users/profile', { notificationPreferences: data });
      return res.data.data;
    },
    onSuccess: () => toast.success('Preferences saved'),
    onError:   () => toast.error('Failed to save preferences'),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => { const res = await api.delete('/users/profile'); return res.data; },
    onSuccess: () => { toast.success('Account deleted'); logout(); router.push('/login'); },
    onError:   () => toast.error('Failed to delete account'),
  });

  const notificationSettings = [
    { key: 'emailNotifications' as const,       label: 'Email Notifications',      desc: 'Receive notifications via email' },
    { key: 'hackathonsNotifications' as const,  label: 'Hackathon Updates',         desc: 'Updates about hackathons you joined' },
    { key: 'interviewsNotifications' as const,  label: 'Interview Reminders',       desc: 'Reminders for scheduled interviews' },
    { key: 'jobsNotifications' as const,        label: 'Job Alerts',                desc: 'New job openings matching your profile' },
    { key: 'testsNotifications' as const,       label: 'Test Notifications',        desc: 'Notifications about tests and results' },
  ];

  return (
    <div className="max-w-2xl space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-sm text-gray-400">Manage your account preferences and security</p>
      </div>

      {/* Notifications */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
            <Bell className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Notification Preferences</h3>
            <p className="text-xs text-gray-500">Choose what you want to be notified about</p>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {notificationSettings.map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-white">{setting.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{setting.desc}</p>
              </div>
              <Toggle
                checked={preferences[setting.key]}
                onChange={() => setPreferences({ ...preferences, [setting.key]: !preferences[setting.key] })}
              />
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-white/8">
          <button
            onClick={() => saveMutation.mutate(preferences)}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving…' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* Security section */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Account</h3>
            <p className="text-xs text-gray-500">Manage your account access</p>
          </div>
        </div>

        <button
          onClick={() => { logout(); router.push('/auth/login'); }}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Sign Out</p>
              <p className="text-xs text-gray-500">Sign out from all devices</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Danger zone */}
      <div className="glass-card overflow-hidden border-red-500/15">
        <div className="px-6 py-4 border-b border-red-500/15 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-red-400">Danger Zone</h3>
            <p className="text-xs text-gray-500">Irreversible and destructive actions</p>
          </div>
        </div>

        <div className="px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">Delete Account</p>
            <p className="text-xs text-gray-500 mt-0.5">Permanently delete your account and all associated data</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you absolutely sure? This action cannot be undone.')) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-xl text-sm transition-all disabled:opacity-50 flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
