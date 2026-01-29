import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = process.env.TELEGRAM_CHAT_ID;

// GET для проверки, что бот жив (через браузер)
export async function GET() {
  return NextResponse.json({ status: "Bot is active and secured." });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Получаем ID чата
    const chatId = body.message?.chat.id || body.callback_query?.from.id;
    const text = body.message?.text;

    // ⛔️ ПРОВЕРКА БЕЗОПАСНОСТИ ⛔️
    // Если пишет не Админ — игнорируем (или можно отвечать "Доступ запрещен")
    if (!chatId || String(chatId) !== String(ADMIN_ID)) {
      return NextResponse.json({ ok: true });
    }

    // --- КОМАНДА /admin ---
    if (text === '/admin') {
      const { data: masters } = await supabase.from('masters').select('*').order('id');
      
      const keyboard = {
        inline_keyboard: masters?.map((m) => [{
          text: `${m.name} ${m.on_duty ? '🟢 НА СМЕНЕ' : '🔴 ВЫХОДНОЙ'}`,
          callback_data: `toggle_${m.id}_${m.on_duty}`
        }]) || []
      };

      await sendMessage(chatId, "⚡️ <b>Управление мастерами:</b>\nНажми, чтобы изменить статус.", keyboard);
    }

    // --- НАЖАТИЕ КНОПКИ ---
    if (body.callback_query) {
      const { data, message } = body.callback_query;
      const [action, id, currentStatus] = data.split('_');

      if (action === 'toggle') {
        const newStatus = currentStatus === 'true' ? false : true;

        // 1. Обновляем базу
        await supabase.from('masters').update({ on_duty: newStatus }).eq('id', id);

        // 2. Получаем обновленный список для перерисовки кнопок
        const { data: masters } = await supabase.from('masters').select('*').order('id');
        
        const keyboard = {
          inline_keyboard: masters?.map((m) => [{
            text: `${m.name} ${m.on_duty ? '🟢 НА СМЕНЕ' : '🔴 ВЫХОДНОЙ'}`,
            callback_data: `toggle_${m.id}_${m.on_duty}`
          }]) || []
        };

        // 3. Обновляем сообщение (кнопки меняются на лету)
        await fetch(`https://api.telegram.org/bot${TOKEN}/editMessageReplyMarkup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                message_id: message.message_id,
                reply_markup: keyboard
            }),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Bot Error:", error);
    return NextResponse.json({ ok: true });
  }
}

async function sendMessage(chat_id: string | number, text: string, reply_markup?: any) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        chat_id, 
        text, 
        reply_markup,
        parse_mode: 'HTML' 
    }),
  });
}