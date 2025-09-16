import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-muted">
      <Sidebar />
      <div className="lg:ml-56">
        {/* Mobile header spacing */}
        <div className="lg:hidden h-16"></div>
        <main className="py-2 sm:py-4">
          <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
