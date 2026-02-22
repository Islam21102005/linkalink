import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Резервная таблица chat_id для старых захардкоженных бизнесов
const FALLBACK_CHAT_IDS: Record<string, string> = {
  'elegant-barbershop': process.env.TELEGRAM_CHAT_ID_BARBERSHOP || process.env.TELEGRAM_CHAT_ID!,
  'forest-glamp': process.env.TELEGRAM_CHAT_ID_GLAMP!,
  'linkalink-main': process.env.TELEGRAM_CHAT_ID!,
};

async function sendTelegram(chatId: string, text: string, keyboard?: any) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: keyboard,
    }),
  });
  return res.json();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const businessSlug = body.businessSlug || body.businessName || body.slug || 'linkalink-main';
    const { service, master, date, time } = body;
    const clientName = body.clientName || body.name || 'Не указано';
    const clientPhone = body.clientPhone || body.phone || 'Не указано';
    const notes = body.notes || '';

    // 1. Пробуем получить telegram_chat_id из БД по slug
    let chatId: string | null = null;
    const { data: bizData } = await supabase
      .from('businesses')
      .select('telegram_chat_id, name')
      .eq('slug', businessSlug)
      .single();

    if (bizData?.telegram_chat_id) {
      chatId = String(bizData.telegram_chat_id);
    } else {
      // Fallback на переменные окружения
      chatId = FALLBACK_CHAT_IDS[businessSlug] || null;
    }

    const businessName = bizData?.name || businessSlug;
    const isMainPage = businessSlug === 'linkalink-main';

    // 2. Сохраняем в Supabase (не для главной страницы)
    let bookingId: number | null = null;
    if (!isMainPage) {
      const { data: insertedData, error: dbError } = await supabase
        .from('bookings')
        .insert([{
          business_slug: businessSlug,
          client_name: clientName,
          client_phone: clientPhone,
          service_name: service,
          master_name: master || null,
          booking_date: date,
          time: time,
          status: 'confirmed',
        }])
        .select()
        .single();

      if (!dbError && insertedData) {
        bookingId = insertedData.id;
      }
    }

    // 3. Формируем сообщение
    let message = '';
    if (isMainPage) {
      message = `🔥 <b>НОВАЯ ЗАЯВКА С САЙТА</b>\n🌐 <b>Linkalink.ru</b>\n\n👤 <b>Имя:</b> ${clientName}\n📞 <b>Телефон:</b> ${clientPhone}\n\n📝 <b>Сообщение:</b> ${master || '—'}`;
    } else {
      message = `✅ <b>НОВАЯ ЗАПИСЬ${bookingId ? ` #${bookingId}` : ''}</b>\n🏢 <b>${businessName}</b>\n\n👤 <b>Клиент:</b> ${clientName}\n📞 <b>Телефон:</b> ${clientPhone}`;
      if (service) message += `\n\n📋 <b>Услуга/объект:</b> ${service}`;
      if (master)  message += `\n👨‍💼 <b>Мастер:</b> ${master}`;
      if (date)    message += `\n📅 <b>Дата:</b> ${date}`;
      if (time)    message += `\n⏰ <b>Время:</b> ${time}`;
      if (notes)   message += `\n\n💬 ${notes}`;
    }

    // 4. Отправляем уведомление
    if (chatId) {
      const tgRes = await sendTelegram(chatId, message);
      if (!tgRes.ok) {
        console.error('Telegram error:', tgRes);
      }
    } else {
      console.warn(`No chat_id for business: ${businessSlug}`);
    }

    return NextResponse.json({ success: true, bookingId });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}