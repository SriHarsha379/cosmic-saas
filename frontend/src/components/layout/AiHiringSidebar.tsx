'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, Link2, Briefcase, FileText,
  ClipboardList, Wallet, User, Settings, LogOut,
  ChevronRight, ArrowLeft, Zap, Menu, X, Target,
  MessageSquare, Video, FileCheck, TrendingUp,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

const aiHiringMenuItems = [
  {
    icon: LayoutDashboard,
    label: 'Overview',
    href: '/ai-hiring',
    desc: 'Candidate portal',
    exact: true,
  },
  {
    icon: BookOpen,
    label: 'My Interviews',
    href: '/interviews',
    desc: 'Scheduled sessions',
    exact: false,
  },
  {
    icon: Link2,
    label: 'Join Interview',
    href: '/interviews',
    desc: 'Enter with code',
    exact: false,
    joinMode: true,
  },
  {
    icon: Briefcase,
    label: 'Browse Jobs',
    href: '/jobs',
    desc: 'Find opportunities',
    exact: false,
  },
  {
    icon: FileText,
    label: 'Applications',
    href: '/applications',
    desc: 'Track status',
    exact: false,
  },
  {
    icon: ClipboardList,
    label: 'Self-Evaluations',
    href: '/ai-hiring/self-evaluations',
    desc: 'AI assessments',
    exact: false,
  },
  {
    icon: MessageSquare,
    label: 'AI Chatbot',
    href: '/ai-hiring/chatbot',
    desc: 'Code & aptitude help',
    exact: false,
  },
  {
    icon: Video,
    label: 'Mock Interviews',
    href: '/ai-hiring/mock-interviews',
    desc: 'AI simulations',
    exact: false,
  },
  {
    icon: FileCheck,
    label: 'Versant Tests',
    href: '/ai-hiring/versant-tests',
    desc: 'English proficiency',
    exact: false,
  },
  {
    icon: TrendingUp,
    label: 'Progress',
    href: '/results',
    desc: 'Stats & history',
    exact: false,
  },
  {
    icon: Wallet,
    label: 'Wallet',
    href: '/wallet',
    desc: 'Credits & rewards',
    exact: false,
  },
  {
    icon: User,
    label: 'Profile',
    href: '/profile',
    desc: 'Your profile',
    exact: false,
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/settings',
    desc: 'Preferences',
    exact: false,
  },
];

export default function AiHiringSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const isActive = (item: (typeof aiHiringMenuItems)[0]) => {
    if (item.joinMode) return false; // Join Interview never "active"
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  const navLink = (item: (typeof aiHiringMenuItems)[0]) => {
    const Icon = item.icon;
    const active = isActive(item);
    return (
      <Link
        key={item.label}
        href={item.href}
        onClick={() => setOpen(false)}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-white shadow-lg shadow-blue-500/20'
            : 'text-gray-400 hover:text-white hover:bg-white/6'
        }`}
      >
        <Icon
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
            active ? '' : 'group-hover:scale-110'
          }`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-tight">{item.label}</p>
          <p className="text-[11px] opacity-60 leading-tight mt-0.5">{item.desc}</p>
        </div>
        {active && <ChevronRight className="w-3 h-3 opacity-60 flex-shrink-0" />}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#0A0E27] border border-white/10 rounded-xl shadow-xl"
      >
        {open ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#080C1F] border-r border-white/8 flex flex-col transition-transform duration-300 z-40 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-tight">AI Hiring</p>
            <p className="text-xs text-gray-500">Recruitment Platform</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            title="Back to dashboard"
            className="p-1.5 rounded-lg hover:bg-white/8 text-gray-500 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* User card */}
        <div className="mx-3 mt-3 mb-1 p-3 rounded-xl bg-white/4 border border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.firstName?.charAt(0)?.toUpperCase()}
              {user?.lastName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-blue-400/80 mt-0.5">Candidate</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 no-scrollbar">
          {aiHiringMenuItems.map((item) => navLink(item))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/8">
          <button
            onClick={() => {
              logout();
              router.push('/auth/login');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/8 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/15">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3 h-3 text-blue-400" />
              <p className="text-xs font-semibold text-white">Welcome to the Future</p>
            </div>
            <p className="text-[11px] text-gray-500 leading-tight">
              Powered by AI &amp; Cosmic Innovation
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
