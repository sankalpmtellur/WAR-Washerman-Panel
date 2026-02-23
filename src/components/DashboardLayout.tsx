
'use client';

import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content + Profile Dropdown */}
      <div className="flex-1 flex flex-col">
        {/* Topbar (no profile dropdown, handled by MobileHeader) */}
        <main
          className="flex-1 overflow-y-auto p-0 pb-20 md:pb-0"
          style={{ backgroundColor: '#faf6f3' }}
        >
          {children}
        </main>
      </div>

      {/* Mobile Navigation - Hidden on desktop */}
      <MobileNavigation />
    </div>
  );
}
