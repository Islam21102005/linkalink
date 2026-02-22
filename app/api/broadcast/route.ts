import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { business_slug, message, business_id } = await req.json();

    if (!business_slug || !message) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    // Получаем всех подписчиков этого бизнеса
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('telegram_id')
      .eq('business_slug', business_slug);

    if (error) throw error;
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ success: true, sent: 0, message: 'Нет подписчиков' });
    }

    let sentCount = 0;
    const errors: number[] = [];

    // Отправляем всем (батчами по 30 для соблюдения лимитов Telegram)
    for (const sub of subscribers) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: sub.telegram_id,
            text: message,
            parse_mode: 'HTML',
          }),
        });
        const data = await res.json();
        if (data.ok) sentCount++;
        else errors.push(sub.telegram_id);
      } catch {
        errors.push(sub.telegram_id);
      }
      // Задержка 50ms между отправками (лимит Telegram ~20/сек)
      await new Promise(r => setTimeout(r, 50));
    }

    // Сохраняем запись о рассылке
    await supabase.from('broadcasts').insert([{
      business_slug,
      message,
      sent_count: sentCount,
    }]);

    return NextResponse.json({
      success: true,
      sent: sentCount,
      total: subscribers.length,
      errors: errors.length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}