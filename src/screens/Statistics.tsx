
'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/services/api';

export default function Statistics() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inprogressOrders: 0,
    completeOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const dashboardStats = await api.getDashboardStats();
        setStats(dashboardStats);
      } catch {
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#a30c34' }}>
          Statistics
        </h1>
        <p className="text-muted-foreground mb-8">
          View order statistics and analytics for your work.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading statistics...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Total Orders</div>
                <div className="text-2xl font-bold text-blue-900">{stats.totalOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Pending</div>
                <div className="text-2xl font-bold text-amber-600">{stats.pendingOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">In Progress</div>
                <div className="text-2xl font-bold text-blue-600">{stats.inprogressOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Completed</div>
                <div className="text-2xl font-bold text-green-700">{stats.completeOrders}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Placeholder for charts and trends */}
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400">
          Charts and analytics coming soon...
        </div>
      </div>
    </DashboardLayout>
  );
}
