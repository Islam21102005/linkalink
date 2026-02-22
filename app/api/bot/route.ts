import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Жёстко заданные владельцы старых бизнесов (обратная совместимость)
const BARBERSHOP_OWNER_ID = '791282594';
const GLAMPING_OWNER_ID = '5076615429';
const GLAMPING_SLUGS = ['forest-glamp', 'FOREST GLAMPING'];

// ================== Helpers ==================
async function sendMessage(chat_id: any, text: string, reply_markup?: any) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, reply_markup, parse_mode: 'HTML' }),
  });
}

async function editMessage(chat_id: any, message_id: number, text: string, reply_markup?: any) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, message_id, text, reply_markup, parse_mode: 'HTML' }),
  });
}

async function answerCallback(callback_query_id: string, text: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id, text }),
  });
}

// ================== GET ==================
export async function GET() {
  return NextResponse.json({ status: 'Linkalink Notify Bot v2' });
}

// ================== POST ==================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const chatId = body.message?.chat?.id || body.callback_query?.message?.chat?.id;
    const text = body.message?.text || '';
    const data = body.callback_query?.data;
    const queryId = body.callback_query?.id;
    const from = body.message?.from || body.callback_query?.from;

    // ========================================
    // /start — с параметром или без
    // ========================================
    if (text?.startsWith('/start')) {
      const parts = text.split(' ');
      const slug = parts[1]?.trim();

      if (slug) {
        // Подписка на бизнес
        const { data: biz } = await supabase
          .from('businesses')
          .select('name, slug')
          .eq('slug', slug)
          .single();

        if (biz) {
          // Сохраняем подписчика
          await supabase.from('subscribers').upsert(
            {
              business_slug: slug,
              telegram_id: chatId,
              telegram_username: from?.username || null,
              first_name: from?.first_name || null,
            },
            { onConflict: 'business_slug,telegram_id' }
          );

          await sendMessage(
            chatId,
            `✅ <b>Вы подписались на уведомления!</b>\n\n🏢 <b>${biz.name}</b>\n\nТеперь вы будете получать акции и новости от этого заведения.\n\nЧтобы отписаться, напишите /unsubscribe_${slug}`
          );
        } else {
          await sendMessage(chatId, '❌ Заведение не найдено. Проверьте ссылку.');
        }
      } else {
        // Общее приветствие
        await sendMessage(
          chatId,
          `👋 <b>Привет${from?.first_name ? ', ' + from.first_name : ''}!</b>\n\nЯ бот Linkalink — уведомляю о записях и рассылаю акции от заведений.\n\nЧтобы подписаться на заведение, перейдите по ссылке с его страницы.`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // ========================================
    // /unsubscribe_<slug> — отписка
    // ========================================
    if (text?.startsWith('/unsubscribe_')) {
      const slug = text.replace('/unsubscribe_', '').trim();
      await supabase
        .from('subscribers')
        .delete()
        .eq('business_slug', slug)
        .eq('telegram_id', chatId);

      await sendMessage(chatId, `✅ Вы отписались от уведомлений заведения <b>${slug}</b>.`);
      return NextResponse.json({ ok: true });
    }

    // ========================================
    // ADMIN команды (обратная совместимость)
    // ========================================
    const isBarbershopOwner = String(chatId) === BARBERSHOP_OWNER_ID;
    const isGlampingOwner = String(chatId) === GLAMPING_OWNER_ID;

    if (!isBarbershopOwner && !isGlampingOwner) {
      return NextResponse.json({ ok: true });
    }

    // /admin — главное меню
    if (text === '/admin' || data === 'menu_main') {
      let keyboard;
      const msg = '⚙️ <b>Панель управления</b>\nВыбери раздел:';

      if (isBarbershopOwner) {
        keyboard = {
          inline_keyboard: [
            [{ text: '📊 Статистика', callback_data: 'stats_barbershop' }],
            [{ text: '💈 Мастера', callback_data: 'menu_masters' }],
          ],
        };
      }

      if (isGlampingOwner) {
        keyboard = {
          inline_keyboard: [
            [{ text: '📊 Статистика', callback_data: 'stats_glamping' }],
            [{ text: '📂 Брони', callback_data: 'menu_bookings' }],
          ],
        };
      }

      if (data) await editMessage(chatId, body.callback_query.message.message_id, msg, keyboard);
      else await sendMessage(chatId, msg, keyboard);
    }

    // Брони (глэмпинг)
    if (data === 'menu_bookings' || data?.startsWith('menu_bookings_page_')) {
      if (!isGlampingOwner) {
        await answerCallback(queryId, '❌ Нет доступа');
        return NextResponse.json({ ok: true });
      }

      let page = 1;
      if (data?.startsWith('menu_bookings_page_')) {
        page = parseInt(data.split('_')[3]);
      }

      const limit = 10;
      const from2 = (page - 1) * limit;
      const to = from2 + limit - 1;

      const { data: bookings, count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact' })
        .in('business_slug', GLAMPING_SLUGS)
        .order('created_at', { ascending: false })
        .range(from2, to);

      if (!bookings || bookings.length === 0) {
        await editMessage(
          chatId,
          body.callback_query.message.message_id,
          '📂 Брони отсутствуют.',
          { inline_keyboard: [[{ text: '🔙 В меню', callback_data: 'menu_main' }]] }
        );
        return NextResponse.json({ ok: true });
      }

      const buttons: any[] = bookings.map((b) => {
        let icon = '🔴';
        if (b.status === 'confirmed') icon = '🟢';
        if (b.status === 'cancelled') icon = '❌';
        return [{ text: `${icon} ${b.booking_date || 'Дата'} | ${b.client_name || 'Гость'}`, callback_data: `view_booking_${b.id}` }];
      });

      const totalPages = Math.ceil((count || 0) / limit);
      const pagination: any[] = [];
      if (page > 1) pagination.push({ text: '⬅ Назад', callback_data: `menu_bookings_page_${page - 1}` });
      if (page < totalPages) pagination.push({ text: '➡ Вперед', callback_data: `menu_bookings_page_${page + 1}` });
      if (pagination.length > 0) buttons.push(pagination);
      buttons.push([{ text: '🔙 В меню', callback_data: 'menu_main' }]);

      await editMessage(
        chatId,
        body.callback_query.message.message_id,
        `📂 Заявки Forest Glamp\nСтраница ${page} из ${totalPages}`,
        { inline_keyboard: buttons }
      );
    }

    if (data?.startsWith('view_booking_')) {
      const id = data.split('_')[2];
      const { data: b } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .in('business_slug', GLAMPING_SLUGS)
        .single();

      if (!b) { await answerCallback(queryId, '❌ Бронь не найдена'); return NextResponse.json({ ok: true }); }

      let status = '⏳ ОЖИДАЕТ';
      if (b.status === 'confirmed') status = '✅ ПОДТВЕРЖДЕНО';
      if (b.status === 'cancelled') status = '❌ ОТМЕНЕНО';

      const textInfo = `📝 <b>ЗАЯВКА #${b.id}</b>\nСтатус: ${status}\n\n🏷 Дом: ${b.service_name}\n📅 Даты: ${b.booking_date}\n👤 Клиент: ${b.client_name}\n📞 Телефон: ${b.client_phone}`;
      const keyboard: any[] = [];
      if (b.status !== 'confirmed') keyboard.push([{ text: '✅ Подтвердить', callback_data: `confirm_${id}` }]);
      if (b.status !== 'cancelled') keyboard.push([{ text: '❌ Отменить', callback_data: `cancel_${id}` }]);
      keyboard.push([{ text: '🔙 К списку', callback_data: 'menu_bookings' }]);

      await editMessage(chatId, body.callback_query.message.message_id, textInfo, { inline_keyboard: keyboard });
    }

    if (data?.startsWith('confirm_')) {
      const id = data.split('_')[1];
      await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id).in('business_slug', GLAMPING_SLUGS);
      await answerCallback(queryId, '✅ Бронь подтверждена');
    }

    if (data?.startsWith('cancel_')) {
      const id = data.split('_')[1];
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id).in('business_slug', GLAMPING_SLUGS);
      await answerCallback(queryId, '❌ Бронь отменена');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: true });
  }
}