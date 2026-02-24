import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const eventType = body.event_type || body.event || 'pageview'

    // time_on_site — обновляем существующую сессию (или просто пишем отдельную запись)
    if (eventType === 'time_on_site') {
      await supabase.from('analytics').insert({
        business_slug: body.page || 'landing',
        event_type: 'time_on_site',
        session_id: body.session_id ?? null,
        // Храним секунды в поле user_agent (временно, пока нет колонки value)
        user_agent: String(body.value ?? 0),
      })
      return NextResponse.json({ ok: true })
    }

    // scroll_*, engaged, pageview и прочие события
    const { error } = await supabase.from('analytics').insert({
      business_slug: body.page || 'landing',
      event_type: eventType,
      session_id: body.session_id ?? null,
      device_type: body.device_type ?? null,
      referrer: body.referrer ?? null,
      traffic_source: body.traffic_source ?? null,
      hour_of_day: body.hour_of_day ?? null,
      user_agent: body.user_agent ?? null,
    })

    if (error) {
      console.error('[analytics/track]', error.message)
      return NextResponse.json({ ok: false, reason: error.message })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[analytics/track] crash:', e?.message)
    return NextResponse.json({ ok: false, reason: e?.message })
  }
}