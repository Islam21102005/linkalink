import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = process.env.TELEGRAM_CHAT_ID;

export async function GET() { return NextResponse.json({ status: "Bot is active" }); }

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const chatId = body.message?.chat.id || body.callback_query?.from.id;
    const text = body.message?.text;
    const data = body.callback_query?.data;

    if (!chatId || String(chatId) !== String(ADMIN_ID)) return NextResponse.json({ ok: true });

    // --- ГЛАВНОЕ МЕНЮ (/admin) ---
    if (text === '/admin' || data === 'menu_main') {
      const keyboard = {
        inline_keyboard: [
          [{ text: '💈 Управление мастерами', callback_data: 'menu_masters' }],
          [{ text: '📊 Статистика', callback_data: 'menu_stats' }]
        ]
      };
      const msgText = "👋 Привет, Админ! Что будем делать?";
      
      if (data) await editMessage(chatId, body.callback_query.message.message_id, msgText, keyboard);
      else await sendMessage(chatId, msgText, keyboard);
    }

    // --- МЕНЮ МАСТЕРОВ ---
    if (data === 'menu_masters') {
      const { data: masters } = await supabase.from('masters').select('*').order('id');
      const keyboard = {
        inline_keyboard: [
          ...(masters?.map((m) => [{
            text: `${m.name} ${m.on_duty ? '🟢 НА СМЕНЕ' : '🔴 ВЫХОДНОЙ'}`,
            callback_data: `toggle_${m.id}_${m.on_duty}`
          }]) || []),
          [{ text: '🔙 Назад в меню', callback_data: 'menu_main' }]
        ]
      };
      await editMessage(chatId, body.callback_query.message.message_id, "💈 Управление сменами:", keyboard);
    }

    // --- ПЕРЕКЛЮЧЕНИЕ СМЕНЫ ---
    if (data?.startsWith('toggle_')) {
      const [_, id, currentStatus] = data.split('_');
      const newStatus = currentStatus === 'true' ? false : true;
      await supabase.from('masters').update({ on_duty: newStatus }).eq('id', id);
      
      // Перерисовываем меню мастеров
      const { data: masters } = await supabase.from('masters').select('*').order('id');
      const keyboard = {
        inline_keyboard: [
          ...(masters?.map((m) => [{
            text: `${m.name} ${m.on_duty ? '🟢' : '🔴'}`,
            callback_data: `toggle_${m.id}_${m.on_duty}`
          }]) || []),
          [{ text: '🔙 Назад в меню', callback_data: 'menu_main' }]
        ]
      };
      await editMessage(chatId, body.callback_query.message.message_id, "💈 Статус обновлен:", keyboard);
    }

    // --- МЕНЮ СТАТИСТИКИ (Выбор периода) ---
    if (data === 'menu_stats') {
      const keyboard = {
        inline_keyboard: [
          [{ text: '📅 За сегодня', callback_data: 'stats_1' }],
          [{ text: '🗓 За 7 дней', callback_data: 'stats_7' }],
          [{ text: '📆 За 30 дней', callback_data: 'stats_30' }],
          [{ text: '🔙 Назад в меню', callback_data: 'menu_main' }]
        ]
      };
      await editMessage(chatId, body.callback_query.message.message_id, "📊 Выбери период статистики:", keyboard);
    }

    // --- ПОКАЗ СТАТИСТИКИ ---
    if (data?.startsWith('stats_')) {
      const days = parseInt(data.split('_')[1]);
      
      // Вычисляем дату начала периода
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days === 1 ? 0 : days));
      startDate.setHours(0, 0, 0, 0); // Начало дня

      // 1. Получаем аналитику (клики)
      const { data: events } = await supabase
        .from('analytics')
        .select('event_type')
        .gte('created_at', startDate.toISOString());

      // 2. Получаем записи
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')
        .gte('created_at', startDate.toISOString());

      // Считаем
      const views = events?.filter(e => e.event_type === 'view').length || 0;
      const tgClicks = events?.filter(e => e.event_type === 'click_telegram').length || 0;
      const instClicks = events?.filter(e => e.event_type === 'click_instagram').length || 0;
      const phoneClicks = events?.filter(e => e.event_type === 'click_phone').length || 0;
      const totalBookings = bookings?.length || 0;

      // Конверсия (Записи / Просмотры)
      const conversion = views > 0 ? ((totalBookings / views) * 100).toFixed(1) : 0;

      const report = `
📊 <b>СТАТИСТИКА (${days === 1 ? 'Сегодня' : days + ' дней'})</b>

👀 <b>Просмотров:</b> ${views}
📝 <b>Записей:</b> ${totalBookings}
📈 <b>Конверсия:</b> ${conversion}%

👇 <b>Клики по контактам:</b>
✈️ Telegram: ${tgClicks}
📸 Instagram: ${instClicks}
📞 Телефон: ${phoneClicks}
`;

      const keyboard = {
        inline_keyboard: [[{ text: '🔙 Назад', callback_data: 'menu_stats' }]]
      };

      await editMessage(chatId, body.callback_query.message.message_id, report, keyboard);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: true });
  }
}

async function sendMessage(chat_id: number, text: string, reply_markup?: any) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, reply_markup, parse_mode: 'HTML' }),
  });
}

async function editMessage(chat_id: number, message_id: number, text: string, reply_markup?: any) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, message_id, text, reply_markup, parse_mode: 'HTML' }),
  });
}