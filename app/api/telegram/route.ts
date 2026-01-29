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
    
    // Получаем данные с подстраховкой
    const { businessName, service, master, date, time } = body;
    const clientName = body.clientName || body.name || "Не указано";
    const clientPhone = body.clientPhone || body.phone || "Не указано";

    // 1. Сохраняем в БД
    const { error: dbError } = await supabase.from('bookings').insert([
      { 
        business_slug: businessName, 
        client_name: clientName, 
        client_phone: clientPhone, 
        service_name: service, 
        master_name: master, 
        booking_date: date,
        time: time
      }
    ]);

    if (dbError) console.error("Ошибка БД:", dbError);

    // 2. Отправляем в Telegram
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

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: CHAT_ID, 
        text: message, 
        parse_mode: 'HTML' 
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка API:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}