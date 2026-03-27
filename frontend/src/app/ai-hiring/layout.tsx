'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AiHiringSidebar from '@/components/layout/AiHiringSidebar';
import Navbar from '@/components/layout/Navbar';

export default function AiHiringLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = localStorage.getItem('token');
    if (token) {
      setIsReady(true);
    } else {
      router.replace('/auth/login');
    }
  }, [mounted, router]);

  if (!mounted) return null;

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#0E1330] to-[#1A0B2E]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading AI Hiring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AiHiringSidebar />
      <div className="flex-1 ml-0 lg:ml-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
