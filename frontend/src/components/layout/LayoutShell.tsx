'use client';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const isHomePage = pathname === '/';
  const isAiHiringPage = pathname?.startsWith('/ai-hiring');
  const showSidebar = !isAuthPage && !isHomePage && !isAiHiringPage;

  return (
    <>
      {showSidebar && <Sidebar />}
      <main className={showSidebar ? 'lg:ml-60 min-h-screen' : ''}>
        <div className={showSidebar ? 'p-6' : ''}>{children}</div>
      </main>
    </>
  );
}
