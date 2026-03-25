'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Search, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    '/dashboard': 'Overview',
    '/hackathons': 'Hackathons',
    '/teams': 'Teams',
    '/interviews': 'Interviews',
    '/jobs': 'Jobs',
    '/applications': 'Applications',
    '/tests': 'Tests',
    '/reports': 'Reports',
    '/certificates': 'Certificates',
    '/leaderboard': 'Leaderboard',
    '/wallet': 'Wallet',
    '/profile': 'Profile',
    '/settings': 'Settings',
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
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  const initials =
    user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#0B0F1A]/80 backdrop-blur-xl border-b border-white/10">
      <h1 className="text-lg font-semibold text-white">{getPageTitle(pathname)}</h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 w-56 transition-all duration-200"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200">
          <Bell className="w-4 h-4 text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
            <span className="text-sm text-gray-300 hidden sm:block">
              {user?.firstName ?? 'User'}
            </span>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-[#0E1330] border border-white/10 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { router.push('/profile'); setShowDropdown(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <User className="w-4 h-4" /> Profile
              </button>
              <button
                onClick={() => { router.push('/settings'); setShowDropdown(false); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings className="w-4 h-4" /> Settings
              </button>
              <div className="border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
