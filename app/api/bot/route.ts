import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = process.env.TELEGRAM_CHAT_ID;

// GET для проверки в браузере
export async function GET() {
  return NextResponse.json({ status: "Bot is active (Debug Mode)" });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Update:", JSON.stringify(body)); // Увидим в логах Vercel

    // Получаем ID чата и текст
    const chatId = body.message?.chat.id || body.callback_query?.from.id;
    const text = body.message?.text;

    if (!chatId) return NextResponse.json({ ok: true });

    // 🔥 ОТЛАДКА: Сначала просто ответим эхом, чтобы проверить связь
    // Если это сообщение (не нажатие кнопки), ответим ID пользователя
    if (body.message) {
        const debugMessage = `
🤖 Бот тебя слышит!
Твой ID: <code>${chatId}</code>
ID Админа в Vercel: <code>${ADMIN_ID}</code>
        `;
        
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                chat_id: chatId, 
                text: debugMessage,
                parse_mode: 'HTML'
            }),
        });
    }

    // --- ЛОГИКА АДМИНКИ ---
    if (text === '/admin') {
      // Даже если ID не совпал, попробуем показать меню для теста
      const { data: masters, error } = await supabase.from('masters').select('*');
      
      if (error) {
         await sendMessage(chatId, `Ошибка базы: ${error.message}`);
         return NextResponse.json({ ok: true });
      }

      const keyboard = {
        inline_keyboard: masters?.map((m) => [{
          text: `${m.name} ${m.on_duty ? '🟢' : '🔴'}`,
          callback_data: `toggle_${m.id}_${m.on_duty}`
        }]) || []
      };

      await sendMessage(chatId, "Меню управления:", keyboard);
    }

    // --- НАЖАТИЕ КНОПКИ ---
    if (body.callback_query) {
        const { data } = body.callback_query;
        const [action, id, currentStatus] = data.split('_');

        if (action === 'toggle') {
            const newStatus = currentStatus === 'true' ? false : true;
            await supabase.from('masters').update({ on_duty: newStatus }).eq('id', id);
            
            // Обновляем клавиатуру
            const { data: masters } = await supabase.from('masters').select('*');
            const keyboard = {
                inline_keyboard: masters?.map((m) => [{
                    text: `${m.name} ${m.on_duty ? '🟢' : '🔴'}`,
                    callback_data: `toggle_${m.id}_${m.on_duty}`
                }]) || []
            };

            // Редактируем сообщение
            await fetch(`https://api.telegram.org/bot${TOKEN}/editMessageReplyMarkup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    message_id: body.callback_query.message.message_id,
                    reply_markup: keyboard
                }),
            });
        }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ ok: true });
  }
}

async function sendMessage(chat_id: string | number, text: string, reply_markup?: any) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, reply_markup }),
  });
}