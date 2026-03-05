"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminOrderApi } from '@/lib/api';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Order, OrderStatus, ORDER_STATUSES } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { AdminOrdersSkeleton } from '@/components/common/skeleton';
import { ShoppingBag } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Pending', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  preparing: { label: 'Preparing', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400 animate-pulse' },
  ready: { label: 'Ready', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400 animate-pulse' },
  completed: { label: 'Completed', badge: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' },
  cancelled: { label: 'Cancelled', badge: 'bg-red-100 text-red-500', dot: 'bg-red-300' },
};

function EmptyOrders() {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-500">No orders yet</p>
          <p className="text-xs text-gray-400">New orders will appear here in real time</p>
        </div>
      </td>
    </tr>
  );
}

export default function AdminOrders() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['admin-orders'],
    queryFn: adminOrderApi.getAdminOrders,
    refetchInterval: 15000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      adminOrderApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const closeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => adminOrderApi.closeSession(sessionId),
    onSuccess: () => {
      toast.success('Table closed');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => toast.error('Failed to close table'),
  });

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  if (isLoading) return <AdminOrdersSkeleton />;

  // Status pill counts
  const counts = (ORDER_STATUSES as readonly string[]).reduce((acc, s) => {
    const n = orders.filter((o) => o.status === s).length;
    if (n > 0) acc[s] = n;
    return acc;
  }, {} as Record<string, number>);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

        {/* Summary pills */}
        {Object.keys(counts).length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {Object.entries(counts).map(([s, n]) => {
              const cfg = STATUS_CONFIG[s as keyof typeof STATUS_CONFIG];
              return (
                <span key={s} className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${cfg.badge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {n} {cfg.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                {['Table', 'Items', 'Total', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {orders.length === 0 ? (
                <EmptyOrders />
              ) : (
                orders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                  const tableNumber = order.table_sessions?.tables?.table_number ?? '—';
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      {/* Table number */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            Table {tableNumber}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true // Optional: change to false for 24h format
                            })}
                          </p>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          {order.order_items?.map((item) => {
                            const menu = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items;
                            return (
                              <p key={item.id} className="text-sm text-gray-600 dark:text-gray-300">
                                <span className="font-medium text-gray-800 dark:text-gray-100">{item.quantity}×</span>{' '}
                                {menu?.name ?? 'Unknown item'}
                              </p>
                            );
                          })}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                          ₦{order.total_amount?.toLocaleString()}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            disabled={updateStatusMutation.isPending}
                            onChange={(e) =>
                              updateStatusMutation.mutate({
                                orderId: order.id,
                                status: e.target.value as OrderStatus,
                              })
                            }
                            className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>

                          {order.status === 'completed' && (
                            <button
                              onClick={() => closeSessionMutation.mutate(order.table_session_id)}
                              disabled={closeSessionMutation.isPending}
                              className="text-xs font-medium bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {closeSessionMutation.isPending ? 'Closing...' : 'Close Table'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer count */}
      {orders.length > 0 && (
        <p className="text-xs text-gray-400 text-right">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
      )}
    </div>
  );
}