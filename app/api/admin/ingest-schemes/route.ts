import { NextResponse } from 'next/server';
import { syncGovernmentSchemesData } from '@/lib/scheme-ingestion';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient();

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

    if (externalPayloads.length === 0) {
      try {
        const host = req.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const response = await fetch(`${protocol}://${host}/mock-gov-feed.json`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.schemes)) {
            externalPayloads = data.schemes;
          }
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (fetchErr) {
        console.warn('Failed to fetch mock-gov-feed.json via HTTP, reading from file system:', fetchErr);
        try {
          const fs = await import('fs/promises');
          const path = await import('path');
          const filePath = path.join(process.cwd(), 'public', 'mock-gov-feed.json');
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(fileContent);
          if (Array.isArray(data.schemes)) {
            externalPayloads = data.schemes;
          }
        } catch (fsErr) {
          console.error('Failed to read mock-gov-feed.json from file system:', fsErr);
        }
      }
    }

    // 3. Execute scheme sync with request-scoped authenticated server client
    const result = await syncGovernmentSchemesData(externalPayloads, supabase);

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
