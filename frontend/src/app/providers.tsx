'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(14, 19, 48, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#ffffff',
          },
        }}
      />
    </QueryClientProvider>
  );
}
