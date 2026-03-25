'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Trophy,
  Users,
  Video,
  Briefcase,
  FileText,
  BookOpen,
  BarChart3,
  Award,
  Star,
  Wallet,
  User,
  Settings,
  Zap,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/hackathons', label: 'Hackathons', icon: Trophy },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/interviews', label: 'Interviews', icon: Video },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/applications', label: 'Applications', icon: FileText },
  { href: '/tests', label: 'Tests', icon: BookOpen },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/certificates', label: 'Certificates', icon: Award },
  { href: '/leaderboard', label: 'Leaderboard', icon: Star },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-white/3 backdrop-blur-xl border-r border-white/10 flex flex-col z-30">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg leading-none">Cosmic</span>
            <span className="block text-purple-400 text-xs font-medium">SaaS Platform</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/20 text-white border border-purple-500/30 shadow-sm shadow-purple-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon
                    className={clsx('w-4 h-4 flex-shrink-0', isActive ? 'text-purple-400' : 'text-current')}
                  />
                  {label}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-xs text-gray-600 text-center">© 2024 Cosmic SaaS</p>
      </div>
    </aside>
  );
}
