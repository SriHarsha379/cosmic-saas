import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import { Toaster } from 'sonner';
import Providers from '@/providers';
import LayoutShell from '@/components/layout/LayoutShell';
import Analytics from '@/components/Analytics';

export const metadata: Metadata = {
  title: 'Cosmic — Run Hackathons, Hire Smarter, Test Better',
  description: 'Cosmic is the all-in-one SaaS platform for institutions to manage hackathons, conduct AI-powered interviews, and run assessments.',
  keywords: ['hackathon platform', 'AI interviews', 'online assessments', 'SaaS for institutions', 'coding tests', 'campus hiring'],
  authors: [{ name: 'Cosmic SaaS' }],
  openGraph: {
    title: 'Cosmic — Run Hackathons, Hire Smarter, Test Better',
    description: 'All-in-one platform for institutions: Hackathons, AI Interviews, Assessments & Wallet.',
    url: 'https://cosmic.dev',
    siteName: 'Cosmic SaaS',
    type: 'website',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Cosmic SaaS Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cosmic — Run Hackathons, Hire Smarter, Test Better',
    description: 'All-in-one platform for institutions: Hackathons, AI Interviews, Assessments & Wallet.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0A0E27]">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
          <Analytics />
          <Toaster position="top-right" theme="dark" />
        </Providers>
      </body>
    </html>
  );
}
