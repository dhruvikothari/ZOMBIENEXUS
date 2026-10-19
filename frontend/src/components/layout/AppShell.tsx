import type { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-dvh lg:pl-60">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[80] focus:rounded-lg focus:bg-green focus:px-4 focus:py-2 focus:font-display focus:font-bold focus:text-on-accent"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] focus:outline-none lg:px-8 lg:pt-8 lg:pb-12">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
