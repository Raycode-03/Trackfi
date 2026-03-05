"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminOrderApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';
import { TimeFilter, TIME_FILTERS, StatusFilter, OrderItem, OrderStatus, ORDER_STATUSES } from '@/types';
import { AnalyticsSkeleton } from '@/components/common/skeleton';
import { Clock, ChefHat, PackageCheck, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-400' },
  preparing: { label: 'Preparing', icon: ChefHat, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-400 animate-pulse' },
  ready: { label: 'Ready', icon: PackageCheck, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-400 animate-pulse' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-400', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-400' },
};

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },
        () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: adminOrderApi.getAdminOrders,
    refetchInterval: 15000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      adminOrderApi.updateStatus(orderId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
    onError: () => toast.error('Failed to update order status'),
  });

  const closeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => adminOrderApi.closeSession(sessionId),
    onSuccess: () => {
      toast.success('Table closed');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  const filteredOrders = orders.filter((order) => {
    const orderTime = new Date(order.created_at);
    const now = new Date();
    const hour = orderTime.getHours();

    if (timeFilter === 'today') {
      const isToday = orderTime.toDateString() === now.toDateString();
      const isBusinessHours = hour >= 7 && hour < 23;
      if (!(isToday && isBusinessHours)) return false;
    }
    if (timeFilter === 'week') {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      if (orderTime < weekAgo) return false;
    }
    if (timeFilter === 'month') {
      const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
      if (orderTime < monthAgo) return false;
    }
    if (timeFilter === '6months') {
      const sixMonthsAgo = new Date(now); sixMonthsAgo.setMonth(now.getMonth() - 6);
      if (orderTime < sixMonthsAgo) return false;
    }
    if (timeFilter === 'year') {
      const yearAgo = new Date(now); yearAgo.setFullYear(now.getFullYear() - 1);
      if (orderTime < yearAgo) return false;
    }
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    return true;
  });

  if (isLoading) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <span className="text-sm text-gray-400">{filteredOrders.length} orders</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
          className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
        >
          {TIME_FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
        >
          <option value="all">All Statuses</option>
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No orders found</p>
          <p className="text-sm mt-1">Try changing the filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const config = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
            const Icon = config.icon;
            const tableNumber = order.table_sessions?.tables?.table_number ?? '—';

            return (
              <div key={order.id} className={`rounded-2xl border ${config.border} ${config.bg} p-4 space-y-3`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                    <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                    <span>Table {tableNumber}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1.5">
                  {order.order_items?.map((item: OrderItem) => {
                    const menu = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items;
                    return (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.quantity}x {menu?.name ?? 'Item'}</span>
                        <span className="text-gray-500 font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-2 border-t border-black/5">
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true // Optional: change to false for 24h format
                    })}
                  </p>
                  <span className="text-sm font-bold text-gray-800">₦{order.total_amount?.toLocaleString()}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatusMutation.mutate({
                      orderId: order.id,
                      status: e.target.value as OrderStatus
                    })}
                    className="flex-1 text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#16A34A] bg-white"
                  >
                    {ORDER_STATUSES.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>

                  {order.status === 'completed' && (
                    <button
                      onClick={() => closeSessionMutation.mutate(order.table_session_id)}
                      className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors shrink-0"
                    >
                      Close Table
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}