'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();
  const router = useRouter();

  const requireAuth = () => {
    if (!token && typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('token')) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  return { user, token, isAuthenticated, login, logout, requireAuth };
}
