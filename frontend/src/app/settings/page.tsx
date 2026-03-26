'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Bell, AlertTriangle, LogOut, Trash2, Save } from 'lucide-react';
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
    onSuccess: () => {
      toast.success('Preferences saved successfully');
    },
    onError: () => {
      toast.error('Failed to save preferences');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete('/users/profile');
      return res.data;
    },
    onSuccess: () => {
      toast.success('Account deleted successfully');
      logout();
      router.push('/login');
    },
    onError: () => {
      toast.error('Failed to delete account');
    },
  });

  const notificationSettings = [
    {
      key: 'emailNotifications' as const,
      label: 'Email Notifications',
      description: 'Receive email related notifications',
    },
    {
      key: 'hackathonsNotifications' as const,
      label: 'Hackathons Notifications',
      description: 'Receive hackathons related notifications',
    },
    {
      key: 'interviewsNotifications' as const,
      label: 'Interviews Notifications',
      description: 'Receive interviews related notifications',
    },
    {
      key: 'jobsNotifications' as const,
      label: 'Jobs Notifications',
      description: 'Receive jobs related notifications',
    },
    {
      key: 'testsNotifications' as const,
      label: 'Tests Notifications',
      description: 'Receive tests related notifications',
    },
  ];

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const handleSave = () => {
    saveMutation.mutate(preferences);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleSignOut = async () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="max-w-2xl space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
        </div>

        <div className="space-y-4 mb-6">
          {notificationSettings.map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
            >
              <div>
                <p className="font-medium text-white">{setting.label}</p>
                <p className="text-sm text-gray-400">{setting.description}</p>
              </div>
              <button
                onClick={() => handleToggle(setting.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences[setting.key]
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                    : 'bg-white/10'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences[setting.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg px-6 py-3 font-medium transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saveMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
        </div>

        <div className="space-y-4">
          {/* Delete Account */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="font-medium text-white">Delete Account</p>
              <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>

          {/* Sign Out */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div>
              <p className="font-medium text-white">Sign Out</p>
              <p className="text-sm text-gray-400">Sign out from all devices</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
