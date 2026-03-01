import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type MenuItemJoin = {
  price: number;
};

type CartItemRow = {
  id: string;
  quantity: number;
  menu_item_id: string;
  menu_items: MenuItemJoin | MenuItemJoin[] | null;
};

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const { tableSessionId } = checkoutSession.metadata!;

    const supabase = await createClient();

    const { data: cartItems } = await supabase
      .from('cart_items')
      .select(`
        id, quantity, menu_item_id,
        menu_items ( price )
      `)
      .eq('table_session_id', tableSessionId);

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ received: true });
    }

    const totalAmount = (cartItems as CartItemRow[]).reduce((sum, item) => {
      const menu = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items;
      return sum + (menu?.price ?? 0) * item.quantity;
    }, 0);

    const { data: order } = await supabase
      .from('orders')
      .insert({
        table_session_id: tableSessionId,
        status: 'pending',
        total_amount: totalAmount,
        estimated_time: 15,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!order) return NextResponse.json({ received: true });

    const orderItems = (cartItems as CartItemRow[]).map((item) => {
      const menu = Array.isArray(item.menu_items) ? item.menu_items[0] : item.menu_items;
      return {
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        price: menu?.price ?? 0,
      };
    });

    await supabase.from('order_items').insert(orderItems);

    await supabase
      .from('cart_items')
      .delete()
      .eq('table_session_id', tableSessionId);
  }

  return NextResponse.json({ received: true });
}