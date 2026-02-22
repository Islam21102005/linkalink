import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { business_slug, telegram_id, telegram_username, first_name } = await req.json();

    if (!business_slug || !telegram_id) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    // upsert — если уже есть, просто обновляем имя
    await supabase.from('subscribers').upsert(
      { business_slug, telegram_id, telegram_username, first_name },
      { onConflict: 'business_slug,telegram_id' }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}