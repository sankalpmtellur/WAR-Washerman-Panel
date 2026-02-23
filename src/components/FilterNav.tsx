import { Clock, Truck, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Order } from '@/types';

type FilterStatus = 'pending' | 'inprogress' | 'complete';
type FilterColor = 'amber' | 'blue' | 'green';

interface FilterNavProps {
  activeFilter: FilterStatus;
  orders: Order[];
  onFilterChange: (filter: FilterStatus) => void;
  layout?: 'vertical' | 'horizontal'; // vertical for sidebar, horizontal for mobile
}

export function FilterNav({ 
  activeFilter, 
  orders, 
  onFilterChange,
  layout = 'vertical'
}: FilterNavProps) {
  
  const getFilterCount = (status: FilterStatus): number => {
    return orders.filter(order => 
      order.status.toLowerCase() === status.toLowerCase()
    ).length;
  };

  const filterOptions: Array<{
    id: FilterStatus;
    label: string;
    icon: typeof Clock;
    color: FilterColor;
    description: string;
  }> = [
    {
      id: 'pending',
      label: 'Start',
      icon: Clock,
      color: 'amber',
      description: 'Pending bags'
    },
    {
      id: 'inprogress',
      label: 'Wash',
      icon: Truck,
      color: 'blue',
      description: 'In progress bags'
    },
    {
      id: 'complete',
      label: 'Done',
      icon: CheckCircle,
      color: 'green',
      description: 'Completed bags'
    }
  ];

  const colorConfigs: Record<
    'amber' | 'blue' | 'green',
    {
      bg: string;
      border: string;
      ring?: string;
      text: string;
      icon: string;
      bgIcon?: string;
      hoverBg?: string;
    }
  > = {
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', ring: 'ring-amber-500', text: 'text-amber-900', icon: 'text-amber-600', bgIcon: 'bg-amber-100', hoverBg: 'hover:bg-amber-50' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', ring: 'ring-blue-500', text: 'text-blue-900', icon: 'text-blue-600', bgIcon: 'bg-blue-100', hoverBg: 'hover:bg-blue-50' },
    green: { bg: 'bg-green-50', border: 'border-green-200', ring: 'ring-green-500', text: 'text-green-900', icon: 'text-green-600', bgIcon: 'bg-green-100', hoverBg: 'hover:bg-green-50' }
  };

  if (layout === 'horizontal') {
    // Mobile layout - horizontal cards
    return (
      <div className="grid grid-cols-3 gap-2">
        {filterOptions.map((option) => {
          const isActive = activeFilter === option.id;
          const colorConfig = colorConfigs[option.color];

          const Icon = option.icon;

          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 active:scale-95 ${
                isActive
                  ? `ring-2 ${colorConfig.ring} shadow-lg ${colorConfig.border} ${colorConfig.bg}`
                  : 'hover:shadow-md border hover:bg-gray-50'
              }`}
              onClick={() => onFilterChange(option.id as FilterStatus)}
            >
              <CardContent className="px-2 py-3 flex flex-col items-center justify-center gap-1.5">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full ${colorConfig.bgIcon}`}>
                  <Icon className={`h-3.5 w-3.5 ${colorConfig.icon}`} />
                </div>
                <div className="text-center">
                  <div className={`text-base font-bold ${colorConfig.text} leading-none`}>
                    {getFilterCount(option.id as FilterStatus)}
                  </div>
                  <div className={`text-xs font-medium ${colorConfig.text} mt-0.5 opacity-80`}>
                    {option.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  // Vertical layout - stacked buttons for sidebar
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-600 px-2 uppercase tracking-wider">Filters</p>
      {filterOptions.map((option) => {
        const isActive = activeFilter === option.id;
        const Icon = option.icon;
        const baseConfig = colorConfigs[option.color];
        const colorConfig = {
          ...baseConfig,
          bg: isActive ? baseConfig.bg.replace('-50', '-100') : 'bg-white',
          text: isActive ? baseConfig.text : baseConfig.text.replace('900', '700'),
        };

        return (
          <button
            key={option.id}
            onClick={() => onFilterChange(option.id as FilterStatus)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg border-2 transition-all duration-200 ${
              isActive
                ? `${colorConfig.bg} ${colorConfig.border} shadow-md`
                : `border-gray-200 ${colorConfig.hoverBg}`
            }`}
          >
            <div className={`flex items-center justify-center w-6 h-6 rounded-full bg-white/50`}>
              <Icon className={`h-4 w-4 ${colorConfig.icon}`} />
            </div>
            <div className="flex-1 text-left">
              <div className={`text-sm font-semibold ${colorConfig.text}`}>
                {option.label}
              </div>
              <div className="text-xs text-gray-600">
                {getFilterCount(option.id as FilterStatus)} bags
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
