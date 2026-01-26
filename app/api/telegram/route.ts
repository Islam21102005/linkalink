import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Подключаем базу для записи
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessName, service, master, date, time, clientName, clientPhone } = body;

    // 1. СОХРАНЯЕМ В БАЗУ ДАННЫХ (чтобы время занялось)
    await supabase.from('bookings').insert([
      { 
        business_slug: businessName, 
        client_name: clientName, 
        client_phone: clientPhone, 
        service_name: service, 
        master_name: master, 
        booking_date: date,
        time: time // Отдельно время
      }
    ]);

    // 2. ОТПРАВЛЯЕМ В ТЕЛЕГРАМ
    const message = `
🔥 <b>НОВАЯ ЗАПИСЬ!</b>
🏢 <b>${businessName}</b>

👤 Клиент: ${clientName} (${clientPhone})
💇‍♂️ Услуга: ${service}
👨‍🎨 Мастер: ${master}
📅 Время: ${date} в ${time}
`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'HTML' }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}