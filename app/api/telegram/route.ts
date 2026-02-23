import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Резервные chat_id через env (для старых бизнесов без telegram_chat_id в БД)
const FALLBACK_CHAT_IDS: Record<string, string> = {
  'elegant-barbershop': process.env.TELEGRAM_CHAT_ID_BARBERSHOP || process.env.TELEGRAM_CHAT_ID!,
  'forest-glamp':       process.env.TELEGRAM_CHAT_ID_GLAMP!,
  'linkalink-main':     process.env.TELEGRAM_CHAT_ID!,
};

async function sendTelegram(chatId: string, text: string, keyboard?: any) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', reply_markup: keyboard }),
  });
  return res.json();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const businessSlug = body.businessSlug || body.businessName || body.slug || 'linkalink-main';
    const { service, master, date, time } = body;
    const clientName  = body.clientName || body.name  || 'Не указано';
    const clientPhone = body.clientPhone || body.phone || 'Не указано';
    const notes = body.notes || '';

    // 1. Получаем данные бизнеса из БД
    const { data: biz } = await supabase
      .from('businesses')
      .select('id, name, telegram_chat_id')
      .eq('slug', businessSlug)
      .single();

    const businessId   = biz?.id || null;
    const businessName = biz?.name || businessSlug;
    const isMainPage   = businessSlug === 'linkalink-main';

    // Определяем chat_id — из БД или env-fallback
    const chatId: string | null = biz?.telegram_chat_id
      ? String(biz.telegram_chat_id)
      : FALLBACK_CHAT_IDS[businessSlug] || null;

    // 2. Сохраняем бронирование в БД
    let bookingId: number | null = null;
    if (!isMainPage) {
      const { data: inserted, error: dbErr } = await supabase
        .from('bookings')
        .insert([{
          business_id:   businessId,
          business_slug: businessSlug,
          client_name:   clientName,
          client_phone:  clientPhone,
          service_name:  service   || null,
          master_name:   master    || null,
          booking_date:  date      || null,
          time:          time      || null,
          status:       'confirmed',
        }])
        .select('id')
        .single();

      if (!dbErr && inserted) bookingId = inserted.id;
      else if (dbErr) console.error('DB insert error:', dbErr.message);
    }

    // 3. Формируем Telegram-сообщение
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

    // 4. Отправляем в Telegram
    if (chatId) {
      const tgRes = await sendTelegram(chatId, message);
      if (!tgRes.ok) console.error('Telegram API error:', JSON.stringify(tgRes));
    } else {
      console.warn(`No chat_id configured for business: ${businessSlug}`);
    }

    return NextResponse.json({ success: true, bookingId });
  } catch (error: any) {
    console.error('API Error:', error?.message || error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}