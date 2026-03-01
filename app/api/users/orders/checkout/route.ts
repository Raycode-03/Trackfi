import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type MenuItemJoin = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
};

type CartItemRow = {
  id: string;
  quantity: number;
  menu_item_id: string;
  menu_items: MenuItemJoin | MenuItemJoin[] | null;
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: session } = await supabase
      .from('table_sessions')
      .select('id, is_active')
      .eq('session_token', sessionToken)
      .single();

    if (!session?.is_active) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { tableNumber } = await req.json();

    const { data: cartItems } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        menu_item_id,
        menu_items ( id, name, price, image_url )
      `)
      .eq('table_session_id', session.id);

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const lineItems = (cartItems as CartItemRow[]).map((item) => {
  const menu = Array.isArray(item.menu_items)
    ? item.menu_items[0]
    : item.menu_items;

  // Use menu image if exists, otherwise a default placeholder
  const imageUrl = menu?.image_url?.trim() || `${process.env.NEXT_PUBLIC_APP_URL}/images/default_placeholder.png`;

return {
  price_data: {
    currency: 'ngn',
    product_data: {
      name: menu?.name ?? 'Menu Item',
      ...(imageUrl && { images: [imageUrl] }),
    },
    unit_amount: (menu?.price ?? 0) * 100,
  },
  quantity: item.quantity,
};
});
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${tableNumber}/order_success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart/${tableNumber}/`,
      metadata: {
        tableSessionId: session.id,
        tableNumber: String(tableNumber),
      },
    });
     // 2. Clear the cart
  await supabase
    .from('cart_items')
    .delete()
    .eq('table_session_id', session.id);

    return NextResponse.json({ url: checkoutSession.url });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}