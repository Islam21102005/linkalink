import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, TrendingUp, Users, Clock, Plus, ExternalLink } from 'lucide-react'

export default async function BusinessAdminDashboard({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!business) return null

  const today = new Date().toISOString().split('T')[0]

  const [
    { count: totalBookings },
    { count: todayBookings },
    { count: pendingBookings },
    { data: recentBookings },
    { count: subscribers },
  ] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('business_slug', slug),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('business_slug', slug).eq('booking_date', today),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('business_slug', slug).eq('status', 'pending'),
    supabase.from('bookings').select('*').eq('business_slug', slug).order('created_at', { ascending: false }).limit(5),
    supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('business_slug', slug),
  ])

  const base = `/business-admin/${slug}`

  const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending:   { label: 'Ожидает',    color: 'text-amber-600 bg-amber-50' },
    confirmed: { label: 'Подтверждена', color: 'text-green-600 bg-green-50' },
    cancelled: { label: 'Отменена',   color: 'text-red-600 bg-red-50' },
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
          <p className="text-gray-500 mt-1">Панель управления</p>
        </div>
        <div className="flex gap-3">
          <a
            href={`/${slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ExternalLink size={16} />
            Открыть сайт
          </a>
          <Link
            href={`${base}/bookings/new`}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            <Plus size={16} />
            Новая запись
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Записей сегодня', value: todayBookings || 0, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
          { label: 'Ожидают ответа', value: pendingBookings || 0, icon: Clock, color: 'bg-amber-50 text-amber-600' },
          { label: 'Всего записей', value: totalBookings || 0, icon: TrendingUp, color: 'bg-purple-50 text-purple-600' },
          { label: 'Подписчиков', value: subscribers || 0, icon: Users, color: 'bg-green-50 text-green-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={20} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{s.value}</span>
            </div>
            <p className="text-sm text-gray-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Последние записи</h2>
          <Link href={`${base}/bookings`} className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Все записи →
          </Link>
        </div>

        {recentBookings && recentBookings.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {recentBookings.map((b: any) => {
              const status = STATUS_LABELS[b.status] || STATUS_LABELS.pending
              return (
                <div key={b.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {(b.client_name?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{b.client_name}</p>
                      <p className="text-xs text-gray-500">{b.service_name} · {b.booking_date} {b.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                    <Link
                      href={`${base}/bookings/${b.id}`}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 text-sm">
            Пока нет записей
          </div>
        )}
      </div>
    </div>
  )
}