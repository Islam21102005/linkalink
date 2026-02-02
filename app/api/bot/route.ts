import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = process.env.TELEGRAM_CHAT_ID;

// GET для проверки работоспособности в браузере
export async function GET() { 
  return NextResponse.json({ status: "Bot is active (Full Version)" }); 
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Получаем данные из обновления Telegram
    const chatId = body.message?.chat.id || body.callback_query?.from.id;
    const text = body.message?.text;
    const data = body.callback_query?.data;
    const queryId = body.callback_query?.id; // ID для ответа на нажатие кнопки

    // 🛡 ПРОВЕРКА БЕЗОПАСНОСТИ
    // Если пишет не Админ — игнорируем
    if (!chatId || String(chatId) !== String(ADMIN_ID)) {
      return NextResponse.json({ ok: true });
    }

    // ==================================================
    // 1. ГЛАВНОЕ МЕНЮ (/admin)
    // ==================================================
    if (text === '/admin' || data === 'menu_main') {
      const keyboard = {
        inline_keyboard: [
          [{ text: '📂 Управление Бронями', callback_data: 'menu_bookings' }],
          [{ text: '💈 Мастера (Салон)', callback_data: 'menu_masters' }],
          [{ text: '📊 Статистика', callback_data: 'menu_stats' }]
        ]
      };
      
      const msg = "⚙️ <b>Панель управления Linkalink</b>\nВыбери раздел:";
      
      if (data) await editMessage(chatId, body.callback_query.message.message_id, msg, keyboard);
      else await sendMessage(chatId, msg, keyboard);
    }

    // ==================================================
    // 2. БЛОК БРОНИРОВАНИЙ (Глэмпинг + Салон)
    // ==================================================
    
    // --- СПИСОК ПОСЛЕДНИХ ЗАЯВОК ---
    if (data === 'menu_bookings') {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      const buttons = bookings?.map((b) => {
        let icon = '🔴'; // Новый/Ожидает
        if (b.status === 'confirmed') icon = '🟢'; // Подтвержден
        if (b.status === 'cancelled') icon = '❌'; // Отменен
        
        // Форматируем дату и название для кнопки
        const shortDate = b.booking_date?.split(' — ')[0] || 'Дата?';
        const shortClient = b.client_name || 'Гость';
        
        return [{
          text: `${icon} ${shortDate} | ${shortClient}`,
          callback_data: `view_booking_${b.id}`
        }];
      }) || [];

      buttons.push([{ text: '🔙 В главное меню', callback_data: 'menu_main' }]);

      await editMessage(chatId, body.callback_query.message.message_id, "📂 Последние 8 заявок:", { inline_keyboard: buttons });
    }

    // --- ПРОСМОТР ДЕТАЛЕЙ ЗАЯВКИ ---
    if (data?.startsWith('view_booking_')) {
      const id = data.split('_')[2];
      const { data: b } = await supabase.from('bookings').select('*').eq('id', id).single();

      if (b) {
        let statusText = '⏳ ОЖИДАЕТ';
        if (b.status === 'confirmed') statusText = '✅ ПОДТВЕРЖДЕНО';
        if (b.status === 'cancelled') statusText = '❌ ОТМЕНЕНО';

        const info = `
📝 <b>ЗАЯВКА #${b.id}</b>
Статус: ${statusText}

🏷 <b>Услуга/Дом:</b> ${b.service_name}
📅 <b>Дата:</b> ${b.booking_date}
💰 <b>Инфо:</b> ${b.time}

👤 <b>Клиент:</b> ${b.client_name}
📞 <b>Телефон:</b> ${b.client_phone}
        `;

        const kbd = [];
        // Логика кнопок:
        // Если статус не отменен -> можно Отменить
        // Если статус не подтвержден -> можно Подтвердить
        if (b.status !== 'cancelled') {
            if (b.status !== 'confirmed') kbd.push([{ text: '✅ Подтвердить', callback_data: `confirm_${id}` }]);
            kbd.push([{ text: '❌ Отменить бронь', callback_data: `cancel_${id}` }]);
        }
        kbd.push([{ text: '🔙 К списку', callback_data: 'menu_bookings' }]);

        await editMessage(chatId, body.callback_query.message.message_id, info, { inline_keyboard: kbd });
      }
    }

    // --- ДЕЙСТВИЕ: ПОДТВЕРДИТЬ ---
    if (data?.startsWith('confirm_')) {
      const id = data.split('_')[1];
      await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id);
      
      // Всплывающее уведомление
      await answerCallback(queryId, "✅ Бронь подтверждена!");
      
      // Обновляем текст сообщения (чтобы статус изменился на глазах)
      const { data: b } = await supabase.from('bookings').select('*').eq('id', id).single();
      const info = `✅ <b>БРОНЬ #${b.id} ПОДТВЕРЖДЕНА!</b>\n\n🏷 ${b.service_name}\n📅 ${b.booking_date}\n👤 ${b.client_name}`;
      
      await editMessage(chatId, body.callback_query.message.message_id, info, { 
          inline_keyboard: [[{ text: '🔙 К списку', callback_data: 'menu_bookings' }]] 
      });
    }

    // --- ДЕЙСТВИЕ: ОТМЕНИТЬ ---
    if (data?.startsWith('cancel_')) {
      const id = data.split('_')[1];
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
      
      // Всплывающее уведомление
      await answerCallback(queryId, "❌ Бронь отменена! Даты освобождены.");
      
      const { data: b } = await supabase.from('bookings').select('*').eq('id', id).single();
      const info = `❌ <b>БРОНЬ #${b.id} ОТМЕНЕНА</b>\n\n🏷 ${b.service_name}\n📅 ${b.booking_date}\n👤 ${b.client_name}`;

      await editMessage(chatId, body.callback_query.message.message_id, info, { 
          inline_keyboard: [[{ text: '🔙 К списку', callback_data: 'menu_bookings' }]] 
      });
    }

    // ==================================================
    // 3. БЛОК МАСТЕРОВ (Только для Салона)
    // ==================================================
    
    // --- СПИСОК МАСТЕРОВ ---
    if (data === 'menu_masters') {
      const { data: masters } = await supabase.from('masters').select('*').order('id');
      
      if (!masters || masters.length === 0) {
         await answerCallback(queryId, "Мастера не найдены в базе.");
         return NextResponse.json({ ok: true });
      }

      const buttons = masters.map(m => ([{
        text: `${m.name} ${m.on_duty ? '🟢 НА СМЕНЕ' : '🔴 ВЫХОДНОЙ'}`,
        callback_data: `toggle_${m.id}_${m.on_duty}`
      }]));
      
      buttons.push([{ text: '🔙 В главное меню', callback_data: 'menu_main' }]);
      
      await editMessage(chatId, body.callback_query.message.message_id, "💈 Управление сменами мастеров:", { inline_keyboard: buttons });
    }

    // --- ПЕРЕКЛЮЧЕНИЕ СМЕНЫ ---
    if (data?.startsWith('toggle_')) {
      const [_, id, currentStatus] = data.split('_');
      const newStatus = currentStatus === 'true' ? false : true;
      await supabase.from('masters').update({ on_duty: newStatus }).eq('id', id);
      
      // Перерисовка меню
      const { data: masters } = await supabase.from('masters').select('*').order('id');
      const buttons = masters?.map(m => ([{
        text: `${m.name} ${m.on_duty ? '🟢 НА СМЕНЕ' : '🔴 ВЫХОДНОЙ'}`,
        callback_data: `toggle_${m.id}_${m.on_duty}`
      }])) || [];
      buttons.push([{ text: '🔙 В главное меню', callback_data: 'menu_main' }]);

      await editMessage(chatId, body.callback_query.message.message_id, "💈 Статус обновлен:", { inline_keyboard: buttons });
    }

    // ==================================================
    // 4. БЛОК СТАТИСТИКИ
    // ==================================================

    // --- ВЫБОР ПЕРИОДА ---
    if (data === 'menu_stats') {
      const keyboard = {
        inline_keyboard: [
          [{ text: '📅 Сегодня', callback_data: 'stats_1' }, { text: '🗓 7 дней', callback_data: 'stats_7' }],
          [{ text: '📆 30 дней', callback_data: 'stats_30' }, { text: '♾ За все время', callback_data: 'stats_all' }],
          [{ text: '🔙 В главное меню', callback_data: 'menu_main' }]
        ]
      };
      await editMessage(chatId, body.callback_query.message.message_id, "📊 Выбери период статистики:", keyboard);
    }

    // --- РАСЧЕТ И ПОКАЗ ---
    if (data?.startsWith('stats_')) {
      const param = data.split('_')[1];
      
      let queryAnalytics = supabase.from('analytics').select('event_type');
      let queryBookings = supabase.from('bookings').select('id');
      let periodText = "За все время";

      if (param !== 'all') {
        const days = parseInt(param);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (days === 1 ? 0 : days));
        startDate.setHours(0, 0, 0, 0);
        const isoDate = startDate.toISOString();
        
        queryAnalytics = queryAnalytics.gte('created_at', isoDate);
        queryBookings = queryBookings.gte('created_at', isoDate);
        periodText = days === 1 ? "За сегодня" : `За ${days} дней`;
      }

      const [resAnalytics, resBookings] = await Promise.all([queryAnalytics, queryBookings]);
      const events = resAnalytics.data || [];
      const totalBookings = resBookings.data?.length || 0;

      const views = events.filter(e => e.event_type === 'view').length || 0;
      const tgClicks = events.filter(e => e.event_type === 'click_telegram').length || 0;
      const instClicks = events.filter(e => e.event_type === 'click_instagram').length || 0;
      const phoneClicks = events.filter(e => e.event_type === 'click_phone').length || 0;
      const conversion = views > 0 ? ((totalBookings / views) * 100).toFixed(1) : 0;

      const report = `
📊 <b>СТАТИСТИКА (${periodText})</b>

👀 <b>Просмотров:</b> ${views}
📝 <b>Всего заявок:</b> ${totalBookings}
📈 <b>Конверсия:</b> ${conversion}%

👇 <b>Клики по контактам:</b>
✈️ Telegram: ${tgClicks}
📸 Instagram: ${instClicks}
📞 Телефон: ${phoneClicks}
      `;

      const keyboard = { inline_keyboard: [[{ text: '🔙 Назад к выбору', callback_data: 'menu_stats' }]] };
      await editMessage(chatId, body.callback_query.message.message_id, report, keyboard);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: true });
  }
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
async function sendMessage(chat_id: any, text: string, reply_markup?: any) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, reply_markup, parse_mode: 'HTML' }),
  });
}

async function editMessage(chat_id: any, message_id: number, text: string, reply_markup?: any) {
  // Простая защита от ошибок редактирования (если текст не изменился)
  try {
    await fetch(`https://api.telegram.org/bot${TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, message_id, text, reply_markup, parse_mode: 'HTML' }),
    });
  } catch (e) { console.log("Edit msg error", e); }
}

async function answerCallback(callback_query_id: string, text: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id, text }),
  });
}