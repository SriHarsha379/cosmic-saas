'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Trophy, Users, MessageSquare,
  Briefcase, FileText, Zap, Wallet, Award,
  TrendingUp, Settings, LogOut, Menu, X,
  ShieldCheck, UserCog, ChevronRight, BarChart2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview',     href: '/dashboard'    },
  { icon: Trophy,          label: 'Hackathons',   href: '/hackathons'   },
  { icon: Users,           label: 'Teams',        href: '/teams'        },
  { icon: MessageSquare,   label: 'Interviews',   href: '/interviews'   },
  { icon: Briefcase,       label: 'Jobs',         href: '/jobs'         },
  { icon: FileText,        label: 'Applications', href: '/applications' },
  { icon: Zap,             label: 'Tests',        href: '/tests'        },
  { icon: BarChart2,       label: 'Results',      href: '/results'      },
  { icon: TrendingUp,      label: 'Leaderboard',  href: '/leaderboard'  },
  { icon: Wallet,          label: 'Wallet',       href: '/wallet'       },
  { icon: Award,           label: 'Certificates', href: '/certificates' },
  { icon: Settings,        label: 'Settings',     href: '/settings'     },
];

const adminMenuItems = [
  { icon: ShieldCheck, label: 'Admin Dashboard',  href: '/admin'            },
  { icon: Trophy,      label: 'Hackathons',        href: '/admin/hackathons' },
  { icon: UserCog,     label: 'Users',             href: '/admin/users'      },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  const navLink = (item: { icon: any; label: string; href: string }, isAdminItem = false) => {
    const Icon = item.icon;
    const isActive =
      pathname === item.href ||
      (item.href !== '/admin' && item.href !== '/dashboard' && pathname.startsWith(item.href));

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setOpen(false)}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${
          isActive
            ? isAdminItem
              ? 'bg-gradient-to-r from-amber-600/80 to-orange-600/80 text-white shadow-lg shadow-amber-500/20'
              : 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white shadow-lg shadow-purple-500/15'
            : 'text-gray-400 hover:text-white hover:bg-white/6'
        }`}
      >
        <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
        <span className="text-sm font-medium flex-1">{item.label}</span>
        {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
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
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-60 bg-[#080C1F] border-r border-white/8 flex flex-col transition-transform duration-300 z-40 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Cosmic SaaS</p>
            <p className="text-xs text-gray-600">Platform</p>
          </div>
        </div>

        {/* User card */}
        <div className="mx-3 mt-3 mb-1 p-3 rounded-xl bg-white/4 border border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.firstName?.charAt(0)?.toUpperCase()}{user?.lastName?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.firstName} {user?.lastName}
              </p>
              <p className={`text-xs mt-0.5 ${isAdmin ? 'text-amber-400/80' : 'text-gray-500'}`}>
                {isAdmin ? 'Administrator' : 'Member'}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 no-scrollbar">
          {menuItems.map((item) => navLink(item))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1.5 px-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-amber-500/20" />
                  <p className="text-xs font-semibold text-amber-500/80 uppercase tracking-wider">Admin</p>
                  <div className="flex-1 h-px bg-amber-500/20" />
                </div>
              </div>
              {adminMenuItems.map((item) => navLink(item, true))}
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/8">
          <button
            onClick={() => { logout(); router.push('/auth/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/8 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
          <p className="text-xs text-gray-700 text-center mt-2">© 2024 Cosmic SaaS</p>
        </div>
      </aside>
    </>
  );
}
