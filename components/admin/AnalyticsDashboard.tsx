'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'
import {
  Users, Eye, RefreshCw, Smartphone, Monitor, Tablet,
  Globe, TrendingUp, CalendarCheck, Clock, MousePointer,
  ArrowDownUp, Zap, Activity, HelpCircle, X
} from 'lucide-react'

type Period = 'day' | 'week' | 'month' | 'quarter' | 'half' | 'all'

const PERIOD_LABELS: Record<Period, string> = {
  day: 'Сегодня', week: 'Неделя', month: 'Месяц',
  quarter: 'Квартал', half: 'Пол года', all: 'Всё время',
}

const DEVICE_ICONS: Record<string, any> = { mobile: Smartphone, desktop: Monitor, tablet: Tablet }
const SOURCE_LABELS: Record<string, string> = { direct: 'Прямой', organic: 'Поиск', social: 'Соцсети', referral: 'Реферал' }
const EVENT_LABELS: Record<string, string> = {
  pageview: 'Просмотры', scroll_25: 'Скролл 25%', scroll_50: 'Скролл 50%',
  scroll_75: 'Скролл 75%', scroll_100: 'Скролл 100%',
  engaged: 'Вовлечённые', time_on_site: 'Время на сайте',
}
const PALETTE = ['#a855f7', '#ec4899', '#6366f1', '#8b5cf6', '#06b6d4', '#10b981']
const DEVICE_COLORS: Record<string, string> = { mobile: '#a855f7', desktop: '#6366f1', tablet: '#ec4899', unknown: '#9ca3af' }

// Подсказки для каждой метрики
const METRIC_HINTS: Record<string, string> = {
  visits: 'Общее число загрузок страницы. Один человек, зашедший трижды, даст 3 визита.',
  unique: 'Число отдельных браузерных сессий. Грубо говоря — сколько разных людей зашло на сайт.',
  returning: 'Посетители, которые уже были на сайте раньше (в предыдущем периоде) и вернулись снова. Высокий показатель — признак лояльности аудитории.',
  engaged: 'Сессии, в которых пользователь провёл на сайте более 30 секунд. Это реальный интерес, а не случайный заход.',
  bounce: 'Процент сессий, где пользователь ушёл не проскроллив страницу и не совершив действий. Норма: 40–60%. Выше 70% — сигнал проблемы.',
  scroll: 'Средняя глубина прокрутки страницы по всем сессиям. 50%+ означает что пользователи доходят до середины страницы.',
  time: 'Среднее время, проведённое пользователем на странице. Чем выше — тем интереснее контент.',
  conversion: 'Отношение числа оформленных записей к числу уникальных сессий. Показывает насколько эффективно сайт превращает посетителей в клиентов.',
  events: 'Все отслеживаемые действия пользователей: просмотры, скролл, вовлечённость и другие.',
}

// Tooltip-подсказка
function Hint({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const text = METRIC_HINTS[id]
  if (!text) return null
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(v => !v)}
        className="text-gray-300 hover:text-gray-500 transition-colors ml-1"
      >
        <HelpCircle size={13} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 left-0 top-6 w-64 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-2xl leading-relaxed">
            {text}
            <button onClick={() => setOpen(false)} className="absolute top-2 right-2 opacity-50 hover:opacity-100">
              <X size={11} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function formatTime(seconds: number): string {
  if (!seconds) return '0с'
  if (seconds < 60) return `${seconds}с`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}м ${s}с` : `${m}м`
}

function formatDateLabel(dateStr: string, period: Period) {
  const d = new Date(dateStr)
  if (period === 'week') return d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' })
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function StatCard({ label, value, icon: Icon, sub, accent = false, color = '', hintId = '' }: {
  label: string; value: string | number; icon: any; sub?: string
  accent?: boolean; color?: string; hintId?: string
}) {
  return (
    <div className={`rounded-2xl p-5 border shadow-sm flex items-start gap-4 ${
      accent ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-purple-100' : 'bg-white border-gray-100'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        accent ? 'bg-purple-100' : 'bg-gray-50'
      }`}>
        <Icon size={18} className={color || (accent ? 'text-purple-500' : 'text-gray-400')} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
        <div className="flex items-center">
          <p className="text-sm font-medium text-gray-700">{label}</p>
          {hintId && <Hint id={hintId} />}
        </div>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

interface AnalyticsData {
  totalVisits: number; uniqueSessions: number; returningCount: number; conversions: number
  bounceRate: number; avgScrollDepth: number; engagedSessions: number; avgTimeOnSite: number
  devices: { type: string; count: number }[]
  sources: { source: string; count: number }[]
  hourly: { hour: number; count: number }[]
  daily: { date: string; count: number }[]
  scrollFunnel: { label: string; count: number }[]
  topEvents: { event: string; count: number }[]
}

export default function AnalyticsDashboard({ page = 'landing', title = 'Аналитика' }: {
  page?: string; title?: string
}) {
  const [period, setPeriod] = useState<Period>('week')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics/data?period=${period}&page=${page}`)
      setData(await res.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [period, page])

  useEffect(() => { fetchData() }, [fetchData])

  const dailyData = (data?.daily || []).map(d => ({ ...d, label: formatDateLabel(d.date, period) }))
  const hourlyData = (data?.hourly || []).map(h => ({ ...h, label: `${h.hour}:00` }))
  const convRate = data && data.uniqueSessions > 0
    ? ((data.conversions / data.uniqueSessions) * 100).toFixed(1) : '0'
  const returnRate = data && data.uniqueSessions > 0
    ? Math.round((data.returningCount / data.uniqueSessions) * 100) : 0
  const engageRate = data && data.uniqueSessions > 0
    ? Math.round((data.engagedSessions / data.uniqueSessions) * 100) : 0

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-1 text-sm">Наведите на <HelpCircle size={12} className="inline text-gray-400" /> рядом с показателем для объяснения</p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Обновить
        </button>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              period === p
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-purple-200'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <RefreshCw size={24} className="animate-spin mr-2" /> Загрузка...
        </div>
      )}

      {!loading && data && (
        <>
          {/* Блок 1: Основные метрики */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard label="Визиты" value={data.totalVisits} icon={Eye} sub="Всего загрузок страницы" hintId="visits" />
            <StatCard label="Уникальных" value={data.uniqueSessions} icon={Users} sub="Отдельных сессий" hintId="unique" />
            <StatCard label="Вернулись" value={`${data.returningCount} (${returnRate}%)`} icon={TrendingUp} sub="Повторные визиты" hintId="returning" />
            <StatCard label="Вовлечённых" value={`${data.engagedSessions} (${engageRate}%)`} icon={Zap} sub="30+ сек на сайте" accent hintId="engaged" />
          </div>

          {/* Блок 2: Поведение */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Отказы" value={`${data.bounceRate}%`} icon={MousePointer}
              sub="Ушли без действий" hintId="bounce"
              color={data.bounceRate > 60 ? 'text-red-400' : data.bounceRate > 40 ? 'text-amber-400' : 'text-green-500'} />
            <StatCard label="Глубина скролла" value={`${data.avgScrollDepth}%`} icon={ArrowDownUp} sub="Средняя по сессиям" hintId="scroll" />
            <StatCard label="Время на сайте" value={formatTime(data.avgTimeOnSite)} icon={Clock} sub="Среднее по сессиям" hintId="time" />
            {page !== 'landing'
              ? <StatCard label="Конверсия" value={`${data.conversions} (${convRate}%)`} icon={CalendarCheck} sub="Записи / сессии" accent hintId="conversion" />
              : <StatCard label="Все события" value={data.topEvents.reduce((a, b) => a + b.count, 0)} icon={Activity} sub="Всего действий" hintId="events" />
            }
          </div>

          {/* График по дням */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Посещаемость по дням</h2>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2} fill="url(#areaG)" name="Визиты" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">Нет данных за период</div>
            )}
          </div>

          {/* Скролл-воронка + часы */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Глубина просмотра</h2>
                <Hint id="scroll" />
              </div>
              <div className="space-y-2.5">
                {(data.scrollFunnel || []).map((item, i) => {
                  const max = data.scrollFunnel[0]?.count || 1
                  const pct = max > 0 ? Math.round((item.count / max) * 100) : 0
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24 flex-shrink-0">{item.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: PALETTE[i % PALETTE.length] }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-10 text-right">{item.count}</span>
                      <span className="text-xs text-gray-400 w-9 text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Активность по времени суток</h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={hourlyData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }} />
                  <Bar dataKey="count" name="Визиты" radius={[3, 3, 0, 0]}>
                    {hourlyData.map((entry, i) => (
                      <Cell key={i} fill={entry.hour >= 9 && entry.hour <= 21 ? '#a855f7' : '#e9d5ff'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Устройства + источники */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Устройства</h2>
              {data.devices.length > 0 ? (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={data.devices} dataKey="count" nameKey="type" cx="50%" cy="50%" innerRadius={34} outerRadius={54} strokeWidth={0}>
                        {data.devices.map((entry, i) => (
                          <Cell key={i} fill={DEVICE_COLORS[entry.type] || PALETTE[i % PALETTE.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2.5">
                    {data.devices.map((d, i) => {
                      const Icon = DEVICE_ICONS[d.type] || Monitor
                      const total = data.devices.reduce((a, b) => a + b.count, 0)
                      const pct = total > 0 ? Math.round((d.count / total) * 100) : 0
                      return (
                        <div key={d.type} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: DEVICE_COLORS[d.type] || PALETTE[i % PALETTE.length] }} />
                          <Icon size={12} className="text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-600 capitalize">{d.type}</span>
                          <span className="ml-auto text-sm font-semibold text-gray-900">{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-28 flex items-center justify-center text-gray-400 text-sm">Нет данных</div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Источники трафика</h2>
              </div>
              {data.sources.length > 0 ? (
                <div className="space-y-3">
                  {[...data.sources].sort((a, b) => b.count - a.count).map((s, i) => {
                    const total = data.sources.reduce((a, b) => a + b.count, 0)
                    const pct = total > 0 ? Math.round((s.count / total) * 100) : 0
                    return (
                      <div key={s.source} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-20 flex-shrink-0">{SOURCE_LABELS[s.source] || s.source}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: PALETTE[i % PALETTE.length] }} />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8 text-right">{s.count}</span>
                        <span className="text-xs text-gray-400 w-9 text-right">{pct}%</span>
                      </div>
                    )
                  })}
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-400">
                    <p><span className="font-medium text-gray-600">Прямой</span> — зашли напрямую или из закладок</p>
                    <p><span className="font-medium text-gray-600">Поиск</span> — пришли из Google, Яндекс и т.д.</p>
                    <p><span className="font-medium text-gray-600">Соцсети</span> — Instagram, ВК, Telegram и т.д.</p>
                    <p><span className="font-medium text-gray-600">Реферал</span> — перешли по ссылке с другого сайта</p>
                  </div>
                </div>
              ) : (
                <div className="h-20 flex items-center justify-center text-gray-400 text-sm">Нет данных</div>
              )}
            </div>
          </div>

          {/* Все события */}
          {data.topEvents.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1 mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Все события</h2>
                <Hint id="events" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.topEvents.map((e) => (
                  <div key={e.event} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xl font-bold text-gray-900">{e.count}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{EVENT_LABELS[e.event] || e.event}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}