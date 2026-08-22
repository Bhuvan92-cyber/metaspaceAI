import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { LiveSimulationBanner } from '@/components/LiveSimulationBanner';

export const metadata: Metadata = {
  title: 'MetaSphere AI — Official Meta Account Manager',
  description: 'AI-powered personal management platform for Facebook, Instagram, and WhatsApp Business via official Meta APIs.',
};

export default function RootLayout({
  children,
}: ReadcontentProps<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 flex min-h-screen antialiased selection:bg-blue-600 selection:text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <LiveSimulationBanner />
          <Header />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-900/30">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

type ReadcontentProps<T> = T;
