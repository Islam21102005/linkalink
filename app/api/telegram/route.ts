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
    console.log("🔥 Попытка записи:", body); // Увидим в логах Vercel

    // Проверка настроек
    if (!TELEGRAM_TOKEN || !CHAT_ID) {
      console.error("❌ ОШИБКА: Нет токена или ID чата в настройках Vercel");
      return NextResponse.json({ error: 'Config error' }, { status: 500 });
    }

    // Получаем данные (с поддержкой разных форматов)
    const { businessName, service, master, date, time } = body;
    const clientName = body.clientName || body.name || "Не указано";
    const clientPhone = body.clientPhone || body.phone || "Не указано";

    // 1. Сохраняем в Supabase
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

    if (dbError) {
      console.error("❌ Ошибка Supabase:", dbError);
    } else {
      console.log("✅ Запись сохранена в БД");
    }

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

    const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: CHAT_ID, 
        text: message, 
        parse_mode: 'HTML' 
      }),
    });

    const tgResult = await tgResponse.json();
    
    if (!tgResult.ok) {
      console.error("❌ Ошибка Telegram:", tgResult);
    } else {
      console.log("✅ Уведомление отправлено");
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ Критическая ошибка API:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}