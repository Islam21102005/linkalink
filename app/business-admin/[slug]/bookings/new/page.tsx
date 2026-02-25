'use client'

import { use, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [services, setServices] = useState<any[]>([])
  const [masters, setMasters] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    client_name: '',
    client_phone: '',
    service_name: '',
    master_name: '',
    booking_date: '',
    time: '',
    notes: '',
    status: 'confirmed',
  })

  useEffect(() => {
    const load = async () => {
      const { data: biz } = await supabase.from('businesses').select('id').eq('slug', slug).single()
      if (!biz) return
      const [{ data: s }, { data: m }] = await Promise.all([
        supabase.from('services').select('name').eq('business_id', biz.id).eq('is_active', true),
        supabase.from('masters').select('name').eq('business_id', biz.id).eq('is_active', true),
      ])
      setServices(s || [])
      setMasters(m || [])
    }
    load()
  }, [slug])

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.startsWith('7') || v.startsWith('8')) v = v.slice(1)
    if (v.length > 10) v = v.slice(0, 10)
    let f = ''
    if (v.length > 0) f = '+7 (' + v.slice(0, 3)
    if (v.length >= 4) f += ') ' + v.slice(3, 6)
    if (v.length >= 7) f += '-' + v.slice(6, 8)
    if (v.length >= 9) f += '-' + v.slice(8, 10)
    setForm(p => ({ ...p, client_phone: f }))
  }

  const handleSave = async () => {
    if (!form.client_name || !form.client_phone) return
    setSaving(true)
    const { data: biz } = await supabase.from('businesses').select('id').eq('slug', slug).single()
    await supabase.from('bookings').insert({
      business_id: biz?.id,
      business_slug: slug,
      client_name: form.client_name,
      client_phone: form.client_phone,
      service_name: form.service_name || null,
      master_name: form.master_name || null,
      booking_date: form.booking_date || null,
      time: form.time || null,
      notes: form.notes || null,
      status: form.status,
    })
    setSaving(false)
    router.push(`/business-admin/${slug}/bookings`)
  }

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={form[key] as string} placeholder={placeholder}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>
  )

  return (
    <div className="p-8 max-w-2xl">
      <Link href={`/business-admin/${slug}/bookings`}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 text-sm">
        <ArrowLeft size={16} /> Назад к записям
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Новая запись</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        {field('Имя клиента *', 'client_name', 'text', 'Иван Иванов')}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Телефон *</label>
          <input type="tel" value={form.client_phone} onChange={handlePhone} placeholder="+7 (___) ___-__-__"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        {services.length > 0 ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Услуга</label>
            <select value={form.service_name} onChange={e => setForm(p => ({ ...p, service_name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">— Не указана —</option>
              {services.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        ) : field('Услуга', 'service_name', 'text', 'Стрижка')}

        {masters.length > 0 ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Мастер</label>
            <select value={form.master_name} onChange={e => setForm(p => ({ ...p, master_name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">— Не указан —</option>
              {masters.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
            </select>
          </div>
        ) : field('Мастер', 'master_name', 'text', 'Алексей')}

        <div className="grid grid-cols-2 gap-4">
          {field('Дата', 'booking_date', 'date')}
          {field('Время', 'time', 'time')}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Статус</label>
          <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="confirmed">✅ Подтверждена</option>
            <option value="pending">⏳ Ожидает</option>
            <option value="cancelled">❌ Отменена</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Примечание</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            rows={3} placeholder="Любые пометки..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
        </div>

        <button onClick={handleSave} disabled={saving || !form.client_name || !form.client_phone}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? <><Loader2 size={16} className="animate-spin" />Сохранение...</> : 'Сохранить запись'}
        </button>
      </div>
    </div>
  )
}