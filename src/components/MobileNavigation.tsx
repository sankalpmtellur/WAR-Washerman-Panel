'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Package2, Search, Clock, Truck, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { Order } from '@/types';

type FilterStatus = 'pending' | 'inprogress' | 'complete';

interface NavItem {
  title: string;
  icon: ReactNode;
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  {
    title: 'Bags',
    icon: <Package2 className="h-6 w-6" />,
    href: '/orders',
    label: 'Bags',
  },
  {
    title: 'Search',
    icon: <Search className="h-6 w-6" />,
    href: '/students',
    label: 'Search',
  },
];

const filterItems = [
  {
    id: 'pending',
    icon: <Clock className="h-5 w-5" />,
    label: 'Start',
  },
  {
    id: 'inprogress',
    icon: <Truck className="h-5 w-5" />,
    label: 'Wash',
  },
  {
    id: 'complete',
    icon: <CheckCircle className="h-5 w-5" />,
    label: 'Done',
  },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('pending');
  useAuth(); // Only for auth context if needed

  // Fetch orders for filter counts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.getAllOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders for mobile nav:', error);
      }
    };
    fetchOrders();
  }, []);

  // Get filter count
  const getFilterCount = (status: FilterStatus): number => {
    return orders.filter(order => 
      order.status.toLowerCase() === status.toLowerCase()
    ).length;
  };

  // Handle filter change
  const handleFilterChange = (filter: FilterStatus) => {
    setActiveFilter(filter);
    router.push(`/orders?filter=${filter}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-padding-bottom md:hidden">
      <div className="flex items-center justify-around px-1 py-1 overflow-x-auto">
        {/* Main navigation items */}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 px-1 py-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'text-white transform scale-105' 
                  : 'text-gray-600 hover:text-gray-900 active:scale-95'
              }`}
              style={isActive ? { backgroundColor: 'var(--color-brand-primary)' } : {}}
            >
              <div className="mb-1">
                {item.icon}
              </div>
              <span className="text-xs font-medium truncate">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Filter items */}
        {filterItems.map((filter) => {
          const isActive = activeFilter === filter.id;
          const count = getFilterCount(filter.id as FilterStatus);
          
          return (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id as FilterStatus)}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 px-1 py-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'text-white transform scale-105' 
                  : 'text-gray-600 hover:text-gray-900 active:scale-95'
              }`}
              style={isActive ? { backgroundColor: 'var(--color-brand-primary)' } : {}}
            >
              <div className="mb-1 relative">
                {filter.icon}
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {count}
                </span>
              </div>
              <span className="text-xs font-medium truncate">
                {filter.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
