import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. Настройка Next.js: всегда динамический, никогда не кэшировать
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = process.env.TELEGRAM_CHAT_ID;

// 2. Метод GET (Чтобы проверить в браузере)
export async function GET() {
  return NextResponse.json({ 
    status: "Bot API is running correctly!",
    env_check: {
      hasToken: !!TOKEN,
      hasAdminId: !!ADMIN_ID
    }
  });
}

// 3. Метод POST (Для самого Телеграма)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming Telegram Update:", JSON.stringify(body)); // Логируем входящие

    // Определяем ID чата (из сообщения или нажатия кнопки)
    const chatId = body.message?.chat.id || body.callback_query?.from.id;
    const text = body.message?.text;

    // --- ПРОВЕРКА БЕЗОПАСНОСТИ ---
    // Если пишет не админ — игнорируем
    if (!chatId || String(chatId) !== String(ADMIN_ID)) {
      console.log(`Unauthorized access attempt from ID: ${chatId}`);
      return NextResponse.json({ ok: true });
    }

    // --- ЛОГИКА: КОМАНДА /admin ---
    if (text === '/admin') {
      const { data: masters, error } = await supabase.from('masters').select('*');
      
      if (error) {
        console.error("Supabase Error:", error);
        await sendMessage(chatId, "Ошибка получения данных из базы.");
        return NextResponse.json({ ok: true });
      }

      if (!masters || masters.length === 0) {
        await sendMessage(chatId, "Мастера не найдены в базе.");
        return NextResponse.json({ ok: true });
      }

      // Формируем кнопки
      const keyboard = {
        inline_keyboard: masters.map((m) => [{
          text: `${m.name} ${m.on_duty ? '🟢' : '🔴'}`,
          callback_data: `toggle_${m.id}_${m.on_duty}`
        }])
      };

      await sendMessage(chatId, "Управление сменами:", keyboard);
    }

    // --- ЛОГИКА: НАЖАТИЕ КНОПКИ ---
    if (body.callback_query) {
      const { data } = body.callback_query;
      const [action, id, currentStatus] = data.split('_');

      if (action === 'toggle') {
        const newStatus = currentStatus === 'true' ? false : true;

        // Обновляем базу
        await supabase.from('masters').update({ on_duty: newStatus }).eq('id', id);

        // Обновляем кнопки, чтобы видно было изменение
        const { data: masters } = await supabase.from('masters').select('*');
        const keyboard = {
          inline_keyboard: masters?.map((m) => [{
            text: `${m.name} ${m.on_duty ? '🟢' : '🔴'}`,
            callback_data: `toggle_${m.id}_${m.on_duty}`
          }])
        };

        await editMessage(chatId, body.callback_query.message.message_id, "Статус обновлен:", keyboard);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ ok: true });
  }
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
async function sendMessage(chat_id: string | number, text: string, reply_markup?: any) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, reply_markup }),
  });
}

async function editMessage(chat_id: string | number, message_id: number, text: string, reply_markup?: any) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, message_id, text, reply_markup }),
  });
}