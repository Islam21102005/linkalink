import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Получаем данные. Важно: frontend должен прислать именно эти поля
    const { businessName, service, master, date, time, clientName, clientPhone } = body;

    // 1. Сохраняем в Supabase
    const { error: dbError } = await supabase.from('bookings').insert([
      { 
        business_slug: businessName, // Или slug, если передаешь
        client_name: clientName, 
        client_phone: clientPhone, 
        service_name: service, 
        master_name: master, 
        booking_date: date,
        time: time
      }
    ]);

    if (dbError) {
      console.error("Ошибка записи в БД:", dbError);
    }

    // 2. Формируем сообщение для Телеграм (HTML разметка)
    const message = `
🔥 <b>НОВАЯ ЗАПИСЬ!</b>
🏢 <b>${businessName}</b>

👤 <b>Клиент:</b> ${clientName}
📞 <b>Телефон:</b> ${clientPhone}

✂️ <b>Услуга:</b> ${service}
💈 <b>Мастер:</b> ${master}
📅 <b>Дата:</b> ${date}
⏰ <b>Время:</b> ${time}
`;

    // 3. Отправляем в Телеграм
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: CHAT_ID, 
        text: message, 
        parse_mode: 'HTML' // Важно для жирного шрифта
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка API:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}