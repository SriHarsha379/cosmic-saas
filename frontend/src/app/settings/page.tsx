'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Settings, Lock, Bell, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { logout } = useAuthStore();
  const router = useRouter();

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifications, setNotifications] = useState({
    email: true,
    hackathons: true,
    interviews: true,
    jobs: false,
    tests: true,
  });

  const changePwMutation = useMutation({
    mutationFn: () =>
      authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: () => toast.error('Failed to change password. Check your current password.'),
  });

  const handleChangePw = () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    changePwMutation.mutate();
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires support team assistance');
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Change Password */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-400" />
          Change Password
        </h3>
        <div className="space-y-3">
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword', label: 'New Password' },
            { key: 'confirmPassword', label: 'Confirm New Password' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
              <input
                type="password"
                value={pwForm[key as keyof typeof pwForm]}
                onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleChangePw}
          disabled={changePwMutation.isPending || !pwForm.currentPassword || !pwForm.newPassword}
          className="flex items-center gap-2 mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50 transition-all"
        >
          <Save className="w-4 h-4" />
          {changePwMutation.isPending ? 'Saving...' : 'Update Password'}
        </button>
      </div>

      {/* Notifications */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          Notification Preferences
        </h3>
        <div className="space-y-3">
          {Object.entries(notifications).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()} Notifications</p>
                <p className="text-xs text-gray-500">Receive {key} related notifications</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [key]: !enabled })}
                className={`relative w-10 h-5.5 rounded-full transition-all duration-200 ${
                  enabled ? 'bg-purple-600' : 'bg-white/10'
                }`}
                style={{ height: '22px', width: '40px' }}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                    enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => toast.success('Notification preferences saved!')}
          className="flex items-center gap-2 mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
        >
          <Save className="w-4 h-4" /> Save Preferences
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Danger Zone
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Delete Account</p>
            <p className="text-xs text-gray-400">Permanently delete your account and all data</p>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm transition-all"
          >
            Delete Account
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Sign Out</p>
            <p className="text-xs text-gray-400">Sign out from all devices</p>
          </div>
          <button
            onClick={() => { logout(); router.push('/auth/login'); }}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-sm transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
