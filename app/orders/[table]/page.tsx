'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/lib/api';
import { ClipboardList, Clock, CheckCircle2, ChefHat, XCircle, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { OrderItem, OrderWithItems } from '@/types';
import { OrderCardSkeleton } from '@/components/dashboard/skeleton';

interface PageProps {
  params: Promise<{ table: string }>;
}


const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    dot: 'bg-yellow-400',
  },
  preparing: {
    label: 'Preparing',
    icon: ChefHat,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: 'bg-blue-400 animate-pulse',
  },
  ready: {
    label: 'Ready',
    icon: PackageCheck,
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: 'bg-green-400 animate-pulse',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-400',
  },
};


function OrderCard({ order }: { order: OrderWithItems }) {
  const config = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  const Icon = config.icon;
  const items = order.order_items ?? [];

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} p-4 space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
          {order.estimated_time && (
            <span>~{order.estimated_time} mins</span>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {items.map((item: OrderItem) => {
          const menu = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items;
          return (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.quantity}x {menu?.name ?? 'Item'}
              </span>
              <span className="text-gray-500 font-medium">
                ₦{(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-2 border-t border-black/5">
        <span className="text-xs text-gray-400">
          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-sm font-bold text-gray-800">
          ₦{order.total_amount?.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function OrdersPage({ params }: PageProps) {
  const paramsData = React.use(params);
  const tableNumber = Number(paramsData.table);
  const router = useRouter();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders', tableNumber],
    queryFn: () => orderApi.getOrders(),
    refetchInterval: 30 * 1000, // poll every 30s for status updates
    retry: 1,
  });

  useEffect(() => {
    if (!error) return;
    if (error instanceof Error && error.message === 'Session expired') {
      toast.error('Session ended', { description: 'Redirecting...' });
      setTimeout(() => router.replace(`/menu/${tableNumber}`), 2000);
    }
  }, [error, router, tableNumber]);

  if (isLoading) return <OrderCardSkeleton />;


  if (orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4 p-6">
        <ClipboardList className="w-16 h-16 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-600">No orders yet</h2>
        <p className="text-sm text-gray-400">Your orders will appear here after checkout</p>
        <Link href={`/menu/${tableNumber}`}>
          <Button className="bg-[#16A34A] hover:bg-[#15803D]">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] container mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
      <div className="flex flex-col gap-4">
        {orders.map((order: OrderWithItems) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}