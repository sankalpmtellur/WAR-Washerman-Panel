'use client';

import { Suspense } from 'react';
import Orders from '@/screens/Orders';

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Loading...</div>}>
      <Orders />
    </Suspense>
  );
}
