'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Just check if token exists, don't verify with API
    const token = localStorage.getItem('token');
    console.log('📍 Dashboard Layout - Token check:', token ? '✅ Found' : '❌ Not found');
    
    if (token) {
      setIsReady(true);
    } else {
      console.log('🔴 No token, redirecting to login');
      router.replace('/auth/login');
    }
  }, [mounted, router]);

  if (!mounted) {
    return null;
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#0E1330] to-[#1A0B2E]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-60 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
