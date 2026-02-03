import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Данные от клиента
    const { businessName, service, master, date, time } = body;
    const clientName = body.clientName || body.name || "Не указано";
    const clientPhone = body.clientPhone || body.phone || "Не указано";

    // Определяем тип бизнеса
    const isBarbershop = businessName === 'elegant-barbershop';
    const isGlamping = businessName === 'forest-glamp';

    // БАРБЕРШОП: автоматическое подтверждение, статус = confirmed
    // ГЛЭМПИНГ: ожидание подтверждения, статус = pending
    const initialStatus = isBarbershop ? 'confirmed' : 'pending';

    // 1. Сохраняем в Supabase
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
          status: initialStatus // Барбершоп сразу confirmed, глэмпинг pending
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error("❌ Ошибка БД:", dbError);
      return NextResponse.json({ error: 'DB Error' }, { status: 500 });
    }

    const bookingId = insertedData.id;

    // 2. Формируем сообщение в зависимости от типа бизнеса
    let message = '';
    let keyboard = undefined;

    if (isBarbershop) {
      // БАРБЕРШОП: простое информационное сообщение БЕЗ кнопок
      message = `
✅ <b>НОВАЯ ЗАПИСЬ #${bookingId}</b> (автоматически подтверждена)
💈 <b>Elegant Barbershop</b>

👤 <b>Клиент:</b> ${clientName}
📞 <b>Телефон:</b> ${clientPhone}

✂️ <b>Услуга:</b> ${service}
👨‍💼 <b>Мастер:</b> ${master}
📅 <b>Дата:</b> ${date}
⏰ <b>Время:</b> ${time}
`;
      // Кнопок нет для барбершопа
      keyboard = undefined;

    } else if (isGlamping) {
      // ГЛЭМПИНГ: сообщение с кнопками подтверждения
      message = `
🔥 <b>НОВАЯ ЗАЯВКА #${bookingId}</b>
🏕 <b>Forest Glamp</b>

👤 <b>Гость:</b> ${clientName}
📞 <b>Связь:</b> ${clientPhone}

🏠 <b>Объект:</b> ${service}
📅 <b>Даты:</b> ${date}
💰 <b>Инфо:</b> ${time}
`;
      
      // Кнопки для глэмпинга
      keyboard = {
        inline_keyboard: [
          [
            { text: '✅ Подтвердить', callback_data: `confirm_${bookingId}` },
            { text: '❌ Отменить', callback_data: `cancel_${bookingId}` }
          ]
        ]
      };
    }

    // 3. Отправляем в Телеграм
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: CHAT_ID, 
        text: message, 
        parse_mode: 'HTML',
        reply_markup: keyboard // Для барбершопа undefined, для глэмпинга есть кнопки
      }),
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}