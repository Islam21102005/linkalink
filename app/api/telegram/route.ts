import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Карта соответствия slug -> chat_id
// Добавьте сюда все ваши бизнесы с их telegram chat_id
const BUSINESS_CHAT_IDS: Record<string, string> = {
  'elegant-barbershop': process.env.TELEGRAM_CHAT_ID_BARBERSHOP || process.env.TELEGRAM_CHAT_ID!,
  'forest-glamp': process.env.TELEGRAM_CHAT_ID_GLAMP || process.env.TELEGRAM_CHAT_ID!,
  'linkalink-main': process.env.TELEGRAM_CHAT_ID!, // Заявки с главной страницы
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Данные от клиента
    const { businessName, service, master, date, time } = body;
    const clientName = body.clientName || body.name || "Не указано";
    const clientPhone = body.clientPhone || body.phone || "Не указано";

    // Определяем тип бизнеса и получаем нужный chat_id
    const isBarbershop = businessName === 'elegant-barbershop';
    const isGlamping = businessName === 'forest-glamp';
    const isMainPage = businessName === 'linkalink-main';

    // Получаем chat_id для конкретного бизнеса
    const CHAT_ID = BUSINESS_CHAT_IDS[businessName] || process.env.TELEGRAM_CHAT_ID!;

    if (!CHAT_ID) {
      console.error(`❌ Не найден CHAT_ID для бизнеса: ${businessName}`);
      return NextResponse.json({ error: 'Chat ID not configured' }, { status: 500 });
    }

    // БАРБЕРШОП: автоматическое подтверждение, статус = confirmed
    // ГЛЭМПИНГ: ожидание подтверждения, статус = pending
    // ГЛАВНАЯ СТРАНИЦА: заявка без статуса
    const initialStatus = isBarbershop ? 'confirmed' : (isGlamping ? 'pending' : 'new');

    // 1. Сохраняем в Supabase (кроме заявок с главной страницы - их можно не сохранять в bookings)
    let bookingId = null;
    
    if (!isMainPage) {
      const { data: insertedData, error: dbError } = await supabase
        .from('bookings')
        .insert([
          { 
            business_slug: businessName, 
            client_name: clientName, 
            client_phone: clientPhone, 
            service_name: service, 
            master_name: master, 
            booking_date: date,
            time: time,
            status: initialStatus
          }
        ])
        .select()
        .single();

      if (dbError) {
        console.error("❌ Ошибка БД:", dbError);
        // Не останавливаем выполнение, просто логируем
      } else {
        bookingId = insertedData.id;
      }
    }

    // 2. Формируем сообщение в зависимости от типа бизнеса
    let message = '';
    let keyboard = undefined;

    if (isMainPage) {
      // ЗАЯВКА С ГЛАВНОЙ СТРАНИЦЫ
      message = `
🔥 <b>НОВАЯ ЗАЯВКА С ГЛАВНОЙ СТРАНИЦЫ</b>
🌐 <b>Linkalink.ru</b>

👤 <b>Имя:</b> ${clientName}
📞 <b>Телефон:</b> ${clientPhone}

📝 <b>Сообщение:</b> ${master}

📅 <b>Дата:</b> ${date}
⏰ <b>Время:</b> ${time}
`;
      keyboard = undefined;

    } else if (isBarbershop) {
      // БАРБЕРШОП: простое информационное сообщение БЕЗ кнопок
      message = `
✅ <b>НОВАЯ ЗАПИСЬ ${bookingId ? `#${bookingId}` : ''}</b> (автоматически подтверждена)
💈 <b>Elegant Barbershop</b>

👤 <b>Клиент:</b> ${clientName}
📞 <b>Телефон:</b> ${clientPhone}

✂️ <b>Услуга:</b> ${service}
👨‍💼 <b>Мастер:</b> ${master}
📅 <b>Дата:</b> ${date}
⏰ <b>Время:</b> ${time}
`;
      keyboard = undefined;

    } else if (isGlamping) {
      // ГЛЭМПИНГ: сообщение с кнопками подтверждения
      message = `
🔥 <b>НОВАЯ ЗАЯВКА ${bookingId ? `#${bookingId}` : ''}</b>
🏕 <b>Forest Glamp</b>

👤 <b>Гость:</b> ${clientName}
📞 <b>Связь:</b> ${clientPhone}

🏠 <b>Объект:</b> ${service}
📅 <b>Даты:</b> ${date}
💰 <b>Инфо:</b> ${time}
`;
      
      // Кнопки для глэмпинга (только если есть bookingId)
      if (bookingId) {
        keyboard = {
          inline_keyboard: [
            [
              { text: '✅ Подтвердить', callback_data: `confirm_${bookingId}` },
              { text: '❌ Отменить', callback_data: `cancel_${bookingId}` }
            ]
          ]
        };
      }
    }

    // 3. Отправляем в Телеграм
    const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: CHAT_ID, 
        text: message, 
        parse_mode: 'HTML',
        reply_markup: keyboard
      }),
    });

    const telegramData = await telegramResponse.json();
    
    if (!telegramResponse.ok) {
      console.error("❌ Telegram API Error:", telegramData);
      return NextResponse.json({ 
        error: 'Telegram send failed', 
        details: telegramData 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, bookingId });

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}