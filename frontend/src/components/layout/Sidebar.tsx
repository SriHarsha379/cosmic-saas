'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Trophy,
  Users,
  MessageSquare,
  Briefcase,
  FileText,
  Zap,
  Wallet,
  Award,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: Trophy, label: 'Hackathons', href: '/hackathons' },
  { icon: Users, label: 'Teams', href: '/teams' },
  { icon: MessageSquare, label: 'Interviews', href: '/interviews' },
  { icon: Briefcase, label: 'Jobs', href: '/jobs' },
  { icon: FileText, label: 'Applications', href: '/applications' },
  { icon: Zap, label: 'Tests', href: '/tests' },
  { icon: TrendingUp, label: 'Results', href: '/results' },
  { icon: TrendingUp, label: 'Leaderboard', href: '/leaderboard' },
  { icon: Wallet, label: 'Wallet', href: '/wallet' },
  { icon: Award, label: 'Certificates', href: '/certificates' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/10 rounded-lg"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#0A0E27] border-r border-white/10 flex flex-col transition-transform duration-300 z-40 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Cosmic</h1>
              <p className="text-xs text-gray-400">SaaS Platform</p>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="p-4 mx-4 mt-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
              {user?.firstName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName || 'User'} {user?.lastName || ''}
              </p>
              <p className="text-xs text-gray-400">Candidate</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
          <p className="text-xs text-gray-500 text-center py-2">© 2024 Cosmic SaaS</p>
        </div>
      </aside>

      {/* Main Content Offset */}
      <div className={`transition-all duration-300 ${open ? 'lg:ml-64' : ''}`} />
    </>
  );
}
