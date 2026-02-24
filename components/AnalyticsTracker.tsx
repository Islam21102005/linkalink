'use client'

import { useEffect } from 'react'

function getDeviceType(): string {
  const ua = navigator.userAgent
  if (/iPad|Tablet/i.test(ua)) return 'tablet'
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'mobile'
  return 'desktop'
}

function getTrafficSource(referrer: string): string {
  if (!referrer) return 'direct'
  const social = ['instagram', 'facebook', 'vk.com', 'tiktok', 'twitter', 't.me', 'telegram']
  if (social.some(d => referrer.includes(d))) return 'social'
  const search = ['google', 'yandex', 'bing', 'mail.ru']
  if (search.some(d => referrer.includes(d))) return 'organic'
  return 'referral'
}

function getOrCreateSessionId(): string {
  const key = 'll_sid'
  let sid = sessionStorage.getItem(key)
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem(key, sid)
  }
  return sid
}

// page = 'landing' для главной страницы, или slug бизнеса для страниц бизнеса
export default function AnalyticsTracker({ page = 'landing' }: { page?: string }) {
  useEffect(() => {
    const sessionId = getOrCreateSessionId()
    const deviceType = getDeviceType()
    const referrer = document.referrer
    const trafficSource = getTrafficSource(referrer)
    const hourOfDay = new Date().getHours()

    // Трекаем pageview — поле page маппится на business_slug в API
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page,                         // → business_slug: 'landing' или slug
        event_type: 'pageview',
        session_id: sessionId,
        device_type: deviceType,
        referrer: referrer || null,
        traffic_source: trafficSource,
        hour_of_day: hourOfDay,
        user_agent: navigator.userAgent,
      }),
    }).catch(() => {})

    // Трекаем время на сайте через beforeunload
    const startTime = Date.now()
    const handleUnload = () => {
      const seconds = Math.round((Date.now() - startTime) / 1000)
      navigator.sendBeacon(
        '/api/analytics/track',
        JSON.stringify({
          page,
          event: 'time_on_site',
          session_id: sessionId,
          value: seconds,
        })
      )
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [page])

  return null
}