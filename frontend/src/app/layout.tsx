'use client';

import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import { Toaster } from 'sonner';
import Providers from '@/providers';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  return (
    <html lang="en">
      <body className="bg-[#0A0E27]">
        <Providers>
          {!isAuthPage && <Sidebar />}
          <main className={isAuthPage ? '' : 'lg:ml-60 min-h-screen'}>
            <div className={isAuthPage ? '' : 'p-6'}>{children}</div>
          </main>
          <Toaster position="top-right" theme="dark" />
        </Providers>
      </body>
    </html>
  );
}
