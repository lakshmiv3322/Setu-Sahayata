import { NextResponse } from 'next/server';
import { syncGovernmentSchemesData } from '@/lib/scheme-ingestion';
import { supabase } from '@/lib/supabase-client';

export async function POST(req: Request) {
  try {
    // 1. Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    // 2. Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile || !profile.is_admin) {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required.' }, { status: 403 });
    }

    let externalPayloads = [];
    try {
      const body = await req.json();
      if (Array.isArray(body.schemes)) {
        externalPayloads = body.schemes;
      }
    } catch {
      // Body optional — syncs default open-data set if no body provided
    }

    // 3. Execute scheme sync
    const result = await syncGovernmentSchemesData(externalPayloads);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Ingestion failed' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Government schemes data sync successful',
      syncedCount: result.count,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[/api/admin/ingest-schemes] Error:', err);
    return NextResponse.json({ error: 'Internal server error during ingestion' }, { status: 500 });
  }
}
