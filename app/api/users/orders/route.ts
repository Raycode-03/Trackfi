// app/api/users/orders/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: session, error: sessionError } = await supabase
      .from('table_sessions')
      .select('id, is_active')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session || !session.is_active) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        table_session_id,
        status,
        total_amount,
        estimated_time,
        created_at,
        updated_at,
        order_items (
          id,
          quantity,
          price,
          menu_items (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('table_session_id', session.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    return NextResponse.json({ orders }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}