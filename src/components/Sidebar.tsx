'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { Package2, Search, Shirt } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { FilterNav } from '@/components/FilterNav';
import { User, Settings, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { api } from '@/services/api';
import type { Order } from '@/types';

type FilterStatus = 'pending' | 'inprogress' | 'complete';

interface NavItem {
  title: string;
  icon: ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  {
    title: 'All Bags',
    icon: <Package2 className="w-6 h-6" />,
    href: '/orders',
  },
  {
    title: 'Find Student',
    icon: <Search className="w-6 h-6" />,
    href: '/students',
  },
  // {
  //   title: 'My Stats',
  //   icon: <BarChart3 className="w-6 h-6" />,
  //   href: '/statistics',
  // },
  // Settings moved to profile dropdown
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('pending');

  // Fetch orders for filter counts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders for sidebar:', error);
      }
    };
    fetchOrders();
  }, []);

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

  const handleFilterChange = (filter: FilterStatus) => {
    setActiveFilter(filter);
    router.push(`/orders?filter=${filter}`);
  };

  return (
    <div 
      className="flex h-screen w-64 flex-col border-r"
      style={{ backgroundColor: 'hsl(var(--card))' }}
    >
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center border-b px-6 bg-linear-to-r from-maroon/5 to-maroon/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-primary">
            <Shirt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl brand-logo leading-tight">
              WAR
            </h1>
            <p className="text-sm text-gray-600">Washerman Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={`w-full justify-start h-16 text-lg font-semibold rounded-xl ${
                  isActive 
                    ? 'text-white hover:text-white shadow-lg' 
                    : 'hover:bg-accent hover:scale-105 transition-transform'
                }`}
                style={isActive ? { backgroundColor: 'var(--color-brand-primary)' } : {}}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
              </Button>
            </Link>
          );
        })}

        {/* Filter Navigation */}
        <div className="pt-2">
          <FilterNav
            activeFilter={activeFilter}
            orders={orders}
            onFilterChange={handleFilterChange}
            layout="vertical"
          />
        </div>
      </nav>

      <Separator />

      {/* Profile Section (bottom left) */}
      {user && (
        <div className="px-4 py-4 mt-auto mb-2">
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 shadow-sm hover:bg-gray-100 w-full justify-start"
              onClick={() => setOpen((v) => !v)}
              aria-label="Open profile menu"
            >
              <User className="w-5 h-5 text-brand-primary" />
              <span className="font-medium text-gray-900 text-base">{user?.username}</span>
            </Button>
            {open && (
              <div className="absolute left-0 bottom-12 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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
        </div>
      )}
    </div>
  );
}
