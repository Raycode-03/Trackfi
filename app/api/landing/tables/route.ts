// app/api/tables/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get ALL tables with their active sessions (if any)
    const { data: tables, error } = await supabase
      .from('tables')
      .select(`
        id,
        table_number,
        is_occupied,
        table_sessions (
          id,
          is_active,
          status,
          expires_at,
          last_activity
        )
      `)
      .order('table_number', { ascending: true }); // This orders by table_number

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format the response - include ALL tables, not just occupied ones
    const formattedTables = tables.map(table => {
      // Find the active session if it exists
      const activeSession = table.table_sessions?.find(
        session => session.is_active === true
      );

      return {
        id: table.id,
        number: table.table_number.toString().padStart(2, '0'),
        status: activeSession ? 'active' : 'available',
        session: activeSession ? {
          id: activeSession.id,
          status: activeSession.status,
          expiresAt: activeSession.expires_at,
          lastActivity: activeSession.last_activity,
        } : null
      };
    });

    return NextResponse.json({ tables: formattedTables }, { status: 200 });

  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}