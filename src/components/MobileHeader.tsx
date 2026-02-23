'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ShirtIcon, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
}

export function MobileHeader({ title, subtitle }: MobileHeaderProps) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 md:hidden">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary">
            <ShirtIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg page-title">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Profile Dropdown Button */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 py-1 rounded-full border border-gray-200 shadow-sm hover:bg-gray-100"
              onClick={() => setOpen((v) => !v)}
              aria-label="Open profile menu"
            >
              <User className="w-5 h-5 text-brand-primary" />
              <span className="font-medium text-gray-900 text-base">{user?.username}</span>
            </Button>
            {open && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  className="flex w-full items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 text-base"
                  onClick={() => { setOpen(false); router.push('/settings'); }}
                >
                  <Settings className="w-5 h-5 text-gray-500" />
                  Settings
                </button>
                <button
                  className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 text-base border-t border-gray-100"
                  onClick={() => { setOpen(false); logout(); }}
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
