import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface OrderStatusChartProps {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
}

export function OrderStatusChart({
  totalOrders,
  pendingOrders,
  inProgressOrders,
  completedOrders,
}: OrderStatusChartProps) {
  const data = [
    { name: 'Pending', value: pendingOrders, color: '#f59e0b' },
    { name: 'In Progress', value: inProgressOrders, color: '#3b82f6' },
    { name: 'Completed', value: completedOrders, color: '#10b981' },
  ];

  // Filter out zero values
  const filteredData = data.filter(item => item.value > 0);

  if (totalOrders === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No orders to display
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => {
            const percent = typeof entry.percent === 'number' ? entry.percent : 0;
            return `${entry.name ?? ''}: ${(percent * 100).toFixed(0)}%`;
          }}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`${value} orders`, 'Count']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
