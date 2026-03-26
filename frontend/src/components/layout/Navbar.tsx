'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, ChevronDown, User, Settings, LogOut, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    '/dashboard':     'Overview',
    '/hackathons':    'Hackathons',
    '/teams':         'Teams',
    '/interviews':    'Interviews',
    '/jobs':          'Jobs',
    '/applications':  'Applications',
    '/tests':         'Tests',
    '/reports':       'Reports',
    '/certificates':  'Certificates',
    '/leaderboard':   'Leaderboard',
    '/wallet':        'Wallet',
    '/profile':       'Profile',
    '/settings':      'Settings',
    '/results':       'Results',
    '/admin':         'Admin',
  };
  for (const [key, value] of Object.entries(map)) {
    if (pathname.startsWith(key)) return value;
  }
  return 'Dashboard';
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    router.push('/auth/login');
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U';

  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-[#0B0F1A]/85 backdrop-blur-xl border-b border-white/8">
      {/* Page title */}
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-purple-500 to-blue-500" />
        <h1 className="text-base font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 bg-white/4 hover:bg-white/8 border border-white/8 rounded-xl transition-all duration-200">
          <Bell className="w-4 h-4 text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full" />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-2.5 py-2 bg-white/4 hover:bg-white/8 border border-white/8 rounded-xl transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-white leading-tight">{user?.firstName ?? 'User'}</p>
              <p className="text-xs text-gray-500 leading-tight capitalize">{user?.role?.toLowerCase() ?? 'user'}</p>
            </div>
            <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#0E1330] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden z-50 animate-slide-down">
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
              </div>

              <div className="p-1">
                <button
                  onClick={() => { router.push('/profile'); setShowDropdown(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-gray-500" /> Profile
                </button>
                <button
                  onClick={() => { router.push('/settings'); setShowDropdown(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-gray-500" /> Settings
                </button>
              </div>

              <div className="p-1 border-t border-white/8">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/8 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
