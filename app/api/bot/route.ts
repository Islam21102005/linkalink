import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ID владельцев
const BARBERSHOP_OWNER_ID = '791282594'; // Владелец барбершопа
const GLAMPING_OWNER_ID = '5076615429';  // Владелец глэмпинга


// GET для проверки работоспособности
export async function GET() { 
  return NextResponse.json({ status: "Bot is active (Multi-Admin Version)" }); 
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Получаем данные из обновления Telegram
    const chatId =
    body.message?.chat.id || body.callback_query?.message?.chat?.id;
    const text = body.message?.text;
    const data = body.callback_query?.data;
    const queryId = body.callback_query?.id;

    // Проверка: пишет ли разрешенный пользователь
    const isBarbershopOwner = String(chatId) === BARBERSHOP_OWNER_ID;
    const isGlampingOwner = String(chatId) === GLAMPING_OWNER_ID;

    if (!isBarbershopOwner && !isGlampingOwner) {
      // Если чужой человек - игнорируем
      return NextResponse.json({ ok: true });
    }

    // ==================================================
    // ГЛАВНОЕ МЕНЮ (/admin) - РАЗНОЕ ДЛЯ КАЖДОГО ВЛАДЕЛЬЦА
    // ==================================================
    if (text === '/admin' || data === 'menu_main') {
      let keyboard;
      let msg = "⚙️ <b>Панель управления</b>\nВыбери раздел:";

      if (isBarbershopOwner) {
        // Меню для владельца БАРБЕРШОПА
        keyboard = {
          inline_keyboard: [
            [{ text: '📊 Статистика (Elegant Barbershop)', callback_data: 'stats_barbershop' }],
            [{ text: '💈 Мастера', callback_data: 'menu_masters' }]
          ]
        };
      } else if (isGlampingOwner) {
        // Меню для владельца ГЛЭМПИНГА
        keyboard = {
          inline_keyboard: [
            [{ text: '📊 Статистика (Forest Glamp)', callback_data: 'stats_glamping' }],
            [{ text: '📂 Брони', callback_data: 'menu_bookings' }]
          ]
        };
      }
      
      if (data) await editMessage(chatId, body.callback_query.message.message_id, msg, keyboard);
      else await sendMessage(chatId, msg, keyboard);
    }

    // ==================================================
    // БЛОК БРОНИРОВАНИЙ (ТОЛЬКО ДЛЯ ГЛЭМПИНГА)
    // ==================================================
    
    // --- СПИСОК БРОНЕЙ (только forest-glamp) ---
    if (data === 'menu_bookings' || data?.startsWith('menu_bookings_page_')) {

      if (!isGlampingOwner) {
        await answerCallback(queryId, "❌ У вас нет доступа к этому разделу");
        return NextResponse.json({ ok: true });
      }

      // -------- Определяем страницу --------
      let page = 1;

      if (data?.startsWith('menu_bookings_page_')) {
        page = parseInt(data.split('_')[3]);
      }

      const limit = 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // -------- Получаем брони с диапазоном --------
      const { data: bookings, count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' })
        .eq('business_slug', 'forest-glamp')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!bookings || bookings.length === 0) {
        await editMessage(
          chatId,
          body.callback_query.message.message_id,
          "📂 Брони отсутствуют.",
          { inline_keyboard: [[{ text: '🔙 В главное меню', callback_data: 'menu_main' }]] }
        );
        return NextResponse.json({ ok: true });
      }

      // -------- Формируем кнопки --------
      const buttons: any[] = bookings.map((b) => {
        let icon = '🔴';
        if (b.status === 'confirmed') icon = '🟢';
        if (b.status === 'cancelled') icon = '❌';

        const shortDate = b.booking_date?.split(' — ')[0] || 'Дата?';
        const shortClient = b.client_name || 'Гость';

        return [{
          text: `${icon} ${shortDate} | ${shortClient}`,
          callback_data: `view_booking_${b.id}`
        }];
      });

      // -------- Кнопки пагинации --------
      const totalPages = Math.ceil((count || 0) / limit);
      const paginationRow: any[] = [];

      if (page > 1) {
        paginationRow.push({
          text: '⬅ Назад',
          callback_data: `menu_bookings_page_${page - 1}`
        });
      }

      if (page < totalPages) {
        paginationRow.push({
          text: '➡ Вперед',
          callback_data: `menu_bookings_page_${page + 1}`
        });
      }

      if (paginationRow.length > 0) {
        buttons.push(paginationRow);
      }

      buttons.push([{ text: '🔙 В главное меню', callback_data: 'menu_main' }]);

      await editMessage(
        chatId,
        body.callback_query.message.message_id,
        `📂 Заявки Forest Glamp\nСтраница ${page} из ${totalPages}`,
        { inline_keyboard: buttons }
      );
    }

    // --- ПРОСМОТР ДЕТАЛЕЙ БРОНИ ---
    if (data?.startsWith('view_booking_')) {
      // Проверка доступа
      if (!isGlampingOwner) {
        await answerCallback(queryId, "❌ У вас нет доступа");
        return NextResponse.json({ ok: true });
      }

      const id = data.split('_')[2];
      const { data: b } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .eq('business_slug', 'forest-glamp') // ИСПРАВЛЕНО: Проверяем что это бронь глэмпинга
        .single();

      if (b) {
        let statusText = '⏳ ОЖИДАЕТ';
        if (b.status === 'confirmed') statusText = '✅ ПОДТВЕРЖДЕНО';
        if (b.status === 'cancelled') statusText = '❌ ОТМЕНЕНО';

        const info = `
📝 <b>ЗАЯВКА #${b.id}</b>
Статус: ${statusText}

🏷 <b>Дом:</b> ${b.service_name}
📅 <b>Даты:</b> ${b.booking_date}
💰 <b>Инфо:</b> ${b.time}

👤 <b>Клиент:</b> ${b.client_name}
📞 <b>Телефон:</b> ${b.client_phone}
        `;

        const kbd = [];
        if (b.status !== 'cancelled') {
            if (b.status !== 'confirmed') kbd.push([{ text: '✅ Подтвердить', callback_data: `confirm_${id}` }]);
            kbd.push([{ text: '❌ Отменить бронь', callback_data: `cancel_${id}` }]);
        }
        kbd.push([{ text: '🔙 К списку', callback_data: 'menu_bookings' }]);

        await editMessage(chatId, body.callback_query.message.message_id, info, { inline_keyboard: kbd });
      } else {
        await answerCallback(queryId, "❌ Бронь не найдена или у вас нет доступа");
      }
    }

    // --- ДЕЙСТВИЕ: ПОДТВЕРДИТЬ (только глэмпинг) ---
    if (data?.startsWith('confirm_')) {
      // Проверка доступа
      if (!isGlampingOwner) {
        await answerCallback(queryId, "❌ У вас нет доступа");
        return NextResponse.json({ ok: true });
      }

      const id = data.split('_')[1];
      
      // ИСПРАВЛЕНО: Обновляем только если это бронь глэмпинга
      await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', id)
        .eq('business_slug', 'forest-glamp');
      
      await answerCallback(queryId, "✅ Бронь подтверждена! Даты закрыты в календаре.");
      
      const { data: b } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .eq('business_slug', 'forest-glamp')
        .single();

      if (b) {
        const info = `✅ <b>БРОНЬ #${b.id} ПОДТВЕРЖДЕНА!</b>\n\n🏷 ${b.service_name}\n📅 ${b.booking_date}\n👤 ${b.client_name}`;
        
        await editMessage(chatId, body.callback_query.message.message_id, info, { 
            inline_keyboard: [[{ text: '🔙 К списку', callback_data: 'menu_bookings' }]] 
        });
      }
    }

    // --- ДЕЙСТВИЕ: ОТМЕНИТЬ (только глэмпинг) ---
    if (data?.startsWith('cancel_')) {
      // Проверка доступа
      if (!isGlampingOwner) {
        await answerCallback(queryId, "❌ У вас нет доступа");
        return NextResponse.json({ ok: true });
      }

      const id = data.split('_')[1];
      
      // ИСПРАВЛЕНО: Отменяем только если это бронь глэмпинга
      await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('business_slug', 'forest-glamp');
      
      await answerCallback(queryId, "❌ Бронь отменена! Даты освобождены.");
      
      const { data: b } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .eq('business_slug', 'forest-glamp')
        .single();

      if (b) {
        const info = `❌ <b>БРОНЬ #${b.id} ОТМЕНЕНА</b>\n\n🏷 ${b.service_name}\n📅 ${b.booking_date}\n👤 ${b.client_name}`;

        await editMessage(chatId, body.callback_query.message.message_id, info, { 
            inline_keyboard: [[{ text: '🔙 К списку', callback_data: 'menu_bookings' }]] 
        });
      }
    }

    // ==================================================
    // БЛОК МАСТЕРОВ (ТОЛЬКО ДЛЯ БАРБЕРШОПА)
    // ==================================================
    
    if (data === 'menu_masters') {
      // Проверка доступа
      if (!isBarbershopOwner) {
        await answerCallback(queryId, "❌ У вас нет доступа к этому разделу");
        return NextResponse.json({ ok: true });
      }

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
      // Проверка доступа
      if (!isBarbershopOwner) {
        await answerCallback(queryId, "❌ У вас нет доступа");
        return NextResponse.json({ ok: true });
      }

      const [_, id, currentStatus] = data.split('_');
      const newStatus = currentStatus === 'true' ? false : true;
      await supabase.from('masters').update({ on_duty: newStatus }).eq('id', id);
      
      const { data: masters } = await supabase.from('masters').select('*').order('id');
      const buttons = masters?.map(m => ([{
        text: `${m.name} ${m.on_duty ? '🟢 НА СМЕНЕ' : '🔴 ВЫХОДНОЙ'}`,
        callback_data: `toggle_${m.id}_${m.on_duty}`
      }])) || [];
      buttons.push([{ text: '🔙 В главное меню', callback_data: 'menu_main' }]);

      await editMessage(chatId, body.callback_query.message.message_id, "💈 Статус обновлен:", { inline_keyboard: buttons });
    }

    // ==================================================
    // БЛОК СТАТИСТИКИ
    // ==================================================

    // --- СТАТИСТИКА БАРБЕРШОПА ---
    if (data === 'stats_barbershop') {
      // Проверка доступа
      if (!isBarbershopOwner) {
        await answerCallback(queryId, "❌ У вас нет доступа к этому разделу");
        return NextResponse.json({ ok: true });
      }

      const keyboard = {
        inline_keyboard: [
          [{ text: '📅 Сегодня', callback_data: 'calc_stats_barbershop_1' }],
          [{ text: '🗓 7 дней', callback_data: 'calc_stats_barbershop_7' }],
          [{ text: '📆 30 дней', callback_data: 'calc_stats_barbershop_30' }],
          [{ text: '♾ За все время', callback_data: 'calc_stats_barbershop_all' }],
          [{ text: '🔙 В главное меню', callback_data: 'menu_main' }]
        ]
      };
      await editMessage(chatId, body.callback_query.message.message_id, "📊 Статистика Elegant Barbershop\nВыбери период:", keyboard);
    }

    // --- СТАТИСТИКА ГЛЭМПИНГА ---
    if (data === 'stats_glamping') {
      // Проверка доступа
      if (!isGlampingOwner) {
        await answerCallback(queryId, "❌ У вас нет доступа к этому разделу");
        return NextResponse.json({ ok: true });
      }

      const keyboard = {
        inline_keyboard: [
          [{ text: '📅 Сегодня', callback_data: 'calc_stats_glamping_1' }],
          [{ text: '🗓 7 дней', callback_data: 'calc_stats_glamping_7' }],
          [{ text: '📆 30 дней', callback_data: 'calc_stats_glamping_30' }],
          [{ text: '♾ За все время', callback_data: 'calc_stats_glamping_all' }],
          [{ text: '🔙 В главное меню', callback_data: 'menu_main' }]
        ]
      };
      await editMessage(chatId, body.callback_query.message.message_id, "📊 Статистика Forest Glamp\nВыбери период:", keyboard);
    }

    // --- РАСЧЕТ СТАТИСТИКИ ---
    if (data?.startsWith('calc_stats_')) {
      const parts = data.split('_');
      const businessType = parts[2]; // 'barbershop' или 'glamping'
      const period = parts[3]; // '1', '7', '30', 'all'
      
      // Проверка доступа
      if (businessType === 'barbershop' && !isBarbershopOwner) {
        await answerCallback(queryId, "❌ У вас нет доступа");
        return NextResponse.json({ ok: true });
      }
      if (businessType === 'glamping' && !isGlampingOwner) {
        await answerCallback(queryId, "❌ У вас нет доступа");
        return NextResponse.json({ ok: true });
      }
      
      const businessSlug = businessType === 'barbershop' ? 'elegant-barbershop' : 'forest-glamp';
      const businessName = businessType === 'barbershop' ? 'Elegant Barbershop' : 'Forest Glamp';
      
      let queryAnalytics = supabase
        .from('analytics')
        .select('event_type')
        .eq('business_slug', businessSlug);
      
      let queryBookings = supabase
        .from('bookings')
        .select('id')
        .eq('business_slug', businessSlug);
      
      let periodText = "За все время";

      if (period !== 'all') {
        const days = parseInt(period);
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
📊 <b>${businessName}</b>
<b>${periodText}</b>

👀 <b>Просмотров:</b> ${views}
📝 <b>Всего заявок:</b> ${totalBookings}
📈 <b>Конверсия:</b> ${conversion}%

👇 <b>Клики по контактам:</b>
✈️ Telegram: ${tgClicks}
📸 Instagram: ${instClicks}
📞 Телефон: ${phoneClicks}
      `;

      const backButton = businessType === 'barbershop' ? 'stats_barbershop' : 'stats_glamping';
      const keyboard = { inline_keyboard: [[{ text: '🔙 Назад к выбору', callback_data: backButton }]] };
      
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