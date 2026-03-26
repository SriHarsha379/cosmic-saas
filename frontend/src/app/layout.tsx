'use client';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import { Toaster } from 'sonner';
import Providers from '@/providers';
import { usePathname } from 'next/navigation';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} bg-[#0A0E27]`}>
        <Providers>
          {!isAuthPage && <Sidebar />}
          <main className={isAuthPage ? '' : 'lg:ml-64 min-h-screen'}>
            <div className={isAuthPage ? '' : 'p-6'}>{children}</div>
          </main>
          <Toaster position="top-right" theme="dark" />
        </Providers>
      </body>
    </html>
  );
}
