'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, RefreshCw, Check, X, Clock, ChevronDown } from 'lucide-react'
import Link from 'next/link'

const STATUS_CONFIG = {
  pending:   { label: 'Ожидает',     color: 'text-amber-700 bg-amber-50 border-amber-200' },
  confirmed: { label: 'Подтверждена', color: 'text-green-700 bg-green-50 border-green-200' },
  cancelled: { label: 'Отменена',    color: 'text-red-700 bg-red-50 border-red-200' },
}

export default function BookingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const supabase = createClient()

  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('bookings')
      .select('*')
      .eq('business_slug', slug)
      .order('created_at', { ascending: false })
    if (statusFilter !== 'all') q = q.eq('status', statusFilter)
    const { data } = await q
    setBookings(data || [])
    setLoading(false)
  }, [slug, statusFilter])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id)
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    setUpdatingId(null)
  }

  const filtered = bookings.filter(b => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      b.client_name?.toLowerCase().includes(q) ||
      b.client_phone?.includes(q) ||
      b.service_name?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Записи</h1>
          <p className="text-gray-500 mt-1">{bookings.length} записей</p>
        </div>
        <Link
          href={`/business-admin/${slug}/bookings/new`}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
        >
          <Plus size={16} /> Добавить запись
        </Link>
      </div>

      {/* Фильтры */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по клиенту, телефону, услуге..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'Все' },
            { value: 'pending', label: 'Ожидают' },
            { value: 'confirmed', label: 'Подтверждены' },
            { value: 'cancelled', label: 'Отменены' },
          ].map(f => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                statusFilter === f.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={fetchBookings}
          className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <RefreshCw size={20} className="animate-spin mr-2" /> Загрузка...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {search ? 'Ничего не найдено' : 'Записей пока нет'}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(b => {
              const sc = STATUS_CONFIG[b.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
              return (
                <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  {/* Аватар */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(b.client_name?.[0] || '?').toUpperCase()}
                  </div>

                  {/* Основная инфа */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{b.client_name}</p>
                    <p className="text-xs text-gray-500">{b.client_phone}</p>
                  </div>

                  {/* Услуга */}
                  <div className="hidden md:block flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{b.service_name || '—'}</p>
                    {b.master_name && <p className="text-xs text-gray-400">{b.master_name}</p>}
                  </div>

                  {/* Дата/время */}
                  <div className="hidden lg:block text-sm text-gray-600 text-right w-32">
                    <p>{b.booking_date || '—'}</p>
                    <p className="text-xs text-gray-400">{b.time || ''}</p>
                  </div>

                  {/* Статус */}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${sc.color} flex-shrink-0`}>
                    {sc.label}
                  </span>

                  {/* Действия */}
                  <div className="flex gap-1 flex-shrink-0">
                    {b.status !== 'confirmed' && (
                      <button
                        onClick={() => updateStatus(b.id, 'confirmed')}
                        disabled={updatingId === b.id}
                        title="Подтвердить"
                        className="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    {b.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(b.id, 'cancelled')}
                        disabled={updatingId === b.id}
                        title="Отменить"
                        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        <X size={14} />
                      </button>
                    )}
                    {b.status !== 'pending' && (
                      <button
                        onClick={() => updateStatus(b.id, 'pending')}
                        disabled={updatingId === b.id}
                        title="В ожидание"
                        className="w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        <Clock size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}