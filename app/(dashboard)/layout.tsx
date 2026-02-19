import type { ReactNode } from 'react';
import TopNavbar from '@/components/layout/Topbar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-slate-900">
      <TopNavbar />
      <div className="pt-4">
        <main className="mx-auto px-3 sm:px-4 py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
