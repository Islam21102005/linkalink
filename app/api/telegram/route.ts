import { NextResponse } from 'next/server';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessName, service, master, date, clientPhone } = body;

    const message = `
🔥 <b>НОВАЯ ЗАПИСЬ!</b>
🏢 <b>${businessName}</b>

💇‍♂️ Услуга: ${service}
👤 Мастер: ${master}
📅 Дата: ${date}
📞 Клиент: ${clientPhone}
`;

    // Отправляем в Telegram
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
    
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка отправки' }, { status: 500 });
  }
}