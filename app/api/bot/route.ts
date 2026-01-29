import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = process.env.TELEGRAM_CHAT_ID; // Только ты сможешь управлять

export async function POST(req: Request) {
  const body = await req.json();

  // 1. Безопасность: проверяем, что пишет именно админ
  const chatId = body.message?.chat.id || body.callback_query?.from.id;
  if (String(chatId) !== String(ADMIN_ID)) return NextResponse.json({ ok: true });

  // 2. Обработка команды /admin (показать список мастеров)
  if (body.message?.text === '/admin') {
    const { data: masters } = await supabase.from('masters').select('*');
    
    const keyboard = masters?.map(m => ([{
      text: `${m.name} [${m.on_duty ? '✅ НА СМЕНЕ' : '❌ ВЫХОДНОЙ'}]`,
      callback_data: `toggle_${m.id}_${m.on_duty}`
    }]));

    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text: "⚡️ Управление сменами мастеров:",
        reply_markup: { inline_keyboard: keyboard }
      }),
    });
  }

  // 3. Обработка нажатия на кнопку (callback_query)
  if (body.callback_query) {
    const [action, id, currentStatus] = body.callback_query.data.split('_');
    const newStatus = currentStatus === 'true' ? false : true;

    if (action === 'toggle') {
      // Обновляем статус в базе
      await supabase.from('masters').update({ on_duty: newStatus }).eq('id', id);

      // Обновляем сообщение в боте, чтобы кнопка изменилась
      const { data: masters } = await supabase.from('masters').select('*');
      const keyboard = masters?.map(m => ([{
        text: `${m.name} [${m.on_duty ? '✅ НА СМЕНЕ' : '❌ ВЫХОДНОЙ'}]`,
        callback_data: `toggle_${m.id}_${m.on_duty}`
      }]));

      await fetch(`https://api.telegram.org/bot${TOKEN}/editMessageReplyMarkup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_ID,
          message_id: body.callback_query.message.message_id,
          reply_markup: { inline_keyboard: keyboard }
        }),
      });
    }
  }

  return NextResponse.json({ ok: true });
}