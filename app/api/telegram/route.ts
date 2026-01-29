import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Это заставит Next.js не пытаться превратить этот API в статичный файл при сборке
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Безопасность: проверяем ID админа
    const chatId = body.message?.chat.id || body.callback_query?.from.id;
    
    if (!chatId || String(chatId) !== String(ADMIN_ID)) {
      return NextResponse.json({ ok: true });
    }

    // 2. Команда /admin
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

    // 3. Обработка кнопок
    if (body.callback_query) {
      const callbackData = body.callback_query.data;
      const [action, id, currentStatus] = callbackData.split('_');
      const newStatus = currentStatus === 'true' ? false : true;

      if (action === 'toggle') {
        await supabase.from('masters').update({ on_duty: newStatus }).eq('id', id);

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
  } catch (error) {
    console.error('Bot Error:', error);
    // Всегда возвращаем ok: true для Телеграма, чтобы он не слал повторы при ошибках
    return NextResponse.json({ ok: true });
  }
}

// Добавим пустой GET, чтобы исключить ошибку "is not a module"
export async function GET() {
  return NextResponse.json({ status: "Bot API is running" });
}