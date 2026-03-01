export interface Order {
  id: string;
  table_session_id: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total_amount: number;
  estimated_time: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menu_items: { id: string; name: string; image_url: string } | { id: string; name: string; image_url: string }[] | null;
}

export type OrderWithItems = Order & { order_items: OrderItem[] };

export interface CheckoutResponse {
  url: string;
}