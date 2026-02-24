import { NextRequest, NextResponse } from 'next/server'

const EMPTY: Record<string, any> = {
  totalVisits: 0, uniqueSessions: 0, returningCount: 0, conversions: 0,
  bounceRate: 0, avgScrollDepth: 0, engagedSessions: 0,
  avgTimeOnSite: 0,
  devices: [], sources: [], hourly: Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 })),
  daily: [], scrollFunnel: [], topEvents: [],
}

function getFromDate(period: string): string | null {
  const now = new Date()
  const map: Record<string, () => void> = {
    day:     () => now.setHours(0, 0, 0, 0),
    week:    () => now.setDate(now.getDate() - 7),
    month:   () => now.setMonth(now.getMonth() - 1),
    quarter: () => now.setMonth(now.getMonth() - 3),
    half:    () => now.setMonth(now.getMonth() - 6),
  }
  if (!map[period]) return null
  map[period]()
  return now.toISOString()
}

export async function GET(req: NextRequest) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'week'
    const slug   = searchParams.get('page')   || 'landing'
    const fromDate = getFromDate(period)

    // Все события за период
    let q = supabase
      .from('analytics')
      .select('id, created_at, session_id, event_type, device_type, traffic_source, hour_of_day, user_agent')
      .eq('business_slug', slug)
      .order('created_at', { ascending: true })
    if (fromDate) q = q.gte('created_at', fromDate)
    const { data: rows, error } = await q

    if (error) {
      console.error('[analytics/data]', error.message)
      return NextResponse.json({ ...EMPTY, _error: error.message })
    }

    const all = rows || []

    // Разбивка по типам событий
    const pageviews  = all.filter(r => r.event_type === 'pageview')
    const timeEvents = all.filter(r => r.event_type === 'time_on_site')
    const engaged    = all.filter(r => r.event_type === 'engaged')
    const scroll25   = all.filter(r => r.event_type === 'scroll_25')
    const scroll50   = all.filter(r => r.event_type === 'scroll_50')
    const scroll75   = all.filter(r => r.event_type === 'scroll_75')
    const scroll100  = all.filter(r => r.event_type === 'scroll_100')

    const totalVisits    = pageviews.length
    const uniqueSessions = new Set(pageviews.map(r => r.session_id).filter(Boolean)).size

    // Вернувшиеся пользователи
    let returningCount = 0
    if (fromDate && uniqueSessions > 0) {
      const { data: prev } = await supabase
        .from('analytics').select('session_id')
        .eq('business_slug', slug).eq('event_type', 'pageview')
        .lt('created_at', fromDate).not('session_id', 'is', null)
      if (prev) {
        const prevSet = new Set(prev.map(r => r.session_id))
        returningCount = [...new Set(pageviews.map(r => r.session_id).filter(Boolean))]
          .filter(s => prevSet.has(s)).length
      }
    }

    // Bounce rate: сессии с только 1 pageview и без scroll событий
    const sessionPageviews: Record<string, number> = {}
    pageviews.forEach(r => {
      if (r.session_id) sessionPageviews[r.session_id] = (sessionPageviews[r.session_id] || 0) + 1
    })
    const scrollSessions = new Set([...scroll25, ...scroll50, ...scroll75, ...scroll100].map(r => r.session_id))
    const bounceSessions = Object.entries(sessionPageviews)
      .filter(([sid, count]) => count === 1 && !scrollSessions.has(sid)).length
    const bounceRate = uniqueSessions > 0 ? Math.round((bounceSessions / uniqueSessions) * 100) : 0

    // Среднее время на сайте (из user_agent поля где мы храним секунды)
    const timeSecs = timeEvents.map(r => parseInt(r.user_agent || '0', 10)).filter(n => n > 0 && n < 3600)
    const avgTimeOnSite = timeSecs.length > 0 ? Math.round(timeSecs.reduce((a, b) => a + b, 0) / timeSecs.length) : 0

    // Engaged sessions
    const engagedCount = new Set(engaged.map(r => r.session_id).filter(Boolean)).size

    // Глубина скролла
    const scrollFunnel = [
      { label: 'Начало (0%)',  count: totalVisits },
      { label: '25%',          count: new Set(scroll25.map(r => r.session_id)).size },
      { label: '50%',          count: new Set(scroll50.map(r => r.session_id)).size },
      { label: '75%',          count: new Set(scroll75.map(r => r.session_id)).size },
      { label: 'Конец (100%)', count: new Set(scroll100.map(r => r.session_id)).size },
    ]

    const avgScrollDepth = scrollFunnel[1].count > 0
      ? Math.round((
          (scrollFunnel[1].count * 25 + scrollFunnel[2].count * 50 +
           scrollFunnel[3].count * 75 + scrollFunnel[4].count * 100) /
          (scrollFunnel[1].count + scrollFunnel[2].count + scrollFunnel[3].count + scrollFunnel[4].count || 1)
        ))
      : 0

    // Устройства
    const deviceMap: Record<string, number> = {}
    pageviews.forEach(r => { const d = r.device_type || 'unknown'; deviceMap[d] = (deviceMap[d] || 0) + 1 })

    // Источники
    const sourceMap: Record<string, number> = {}
    pageviews.forEach(r => { const s = r.traffic_source || 'direct'; sourceMap[s] = (sourceMap[s] || 0) + 1 })

    // Часы
    const hourMap: Record<number, number> = {}
    for (let h = 0; h < 24; h++) hourMap[h] = 0
    pageviews.forEach(r => { if (r.hour_of_day != null) hourMap[r.hour_of_day] = (hourMap[r.hour_of_day] || 0) + 1 })

    // По дням
    const dayMap: Record<string, number> = {}
    pageviews.forEach(r => { const d = r.created_at?.slice(0, 10); if (d) dayMap[d] = (dayMap[d] || 0) + 1 })

    // Top events
    const eventMap: Record<string, number> = {}
    all.forEach(r => { eventMap[r.event_type] = (eventMap[r.event_type] || 0) + 1 })
    const topEvents = Object.entries(eventMap)
      .sort(([, a], [, b]) => b - a)
      .map(([event, count]) => ({ event, count }))

    // Конверсии из bookings
    let conversions = 0
    if (slug !== 'landing') {
      let bq = supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('business_slug', slug)
      if (fromDate) bq = bq.gte('created_at', fromDate)
      const { count } = await bq
      conversions = count || 0
    }

    return NextResponse.json({
      totalVisits, uniqueSessions, returningCount, conversions,
      bounceRate, avgScrollDepth, engagedSessions: engagedCount, avgTimeOnSite,
      devices:  Object.entries(deviceMap).map(([type, count]) => ({ type, count })),
      sources:  Object.entries(sourceMap).map(([source, count]) => ({ source, count })),
      hourly:   Object.entries(hourMap).map(([h, count]) => ({ hour: Number(h), count })),
      daily:    Object.entries(dayMap).sort(([a],[b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count })),
      scrollFunnel, topEvents,
    })
  } catch (e: any) {
    console.error('[analytics/data] crash:', e?.message)
    return NextResponse.json({ ...EMPTY, _error: e?.message })
  }
}