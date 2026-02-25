'use client'

import { use, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'

const PROMO_COLORS = [
  { label: 'Чёрный', value: 'from-gray-900 to-black' },
  { label: 'Фиолетовый', value: 'from-purple-600 to-indigo-700' },
  { label: 'Розовый', value: 'from-pink-500 to-rose-600' },
  { label: 'Синий', value: 'from-blue-500 to-cyan-600' },
  { label: 'Зелёный', value: 'from-emerald-500 to-teal-600' },
  { label: 'Оранжевый', value: 'from-orange-500 to-red-500' },
]

interface Promo { title: string; desc: string; color: string }

export default function PromotionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const supabase = createClient()

  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bizId, setBizId] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('businesses').select('id, promotions').eq('slug', slug).single()
      if (data) {
        setBizId(data.id)
        setPromos(data.promotions || [])
      }
      setLoading(false)
    }
    load()
  }, [slug])

  const addPromo = () => setPromos(p => [...p, { title: '', desc: '', color: 'from-gray-900 to-black' }])
  const removePromo = (i: number) => setPromos(p => p.filter((_, idx) => idx !== i))
  const updatePromo = (i: number, key: keyof Promo, val: string) =>
    setPromos(p => p.map((pr, idx) => idx === i ? { ...pr, [key]: val } : pr))

  const handleSave = async () => {
    if (!bizId) return
    setSaving(true)
    await supabase.from('businesses').update({ promotions: promos }).eq('id', bizId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <Loader2 className="animate-spin mr-2" size={20} /> Загрузка...
    </div>
  )

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Акции</h1>
          <p className="text-gray-500 mt-1">Отображаются прокручивающейся лентой на странице бизнеса</p>
        </div>
        <button onClick={addPromo}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-medium text-sm transition-colors">
          <Plus size={16} /> Добавить акцию
        </button>
      </div>

      {/* Превью */}
      {promos.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Превью</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {promos.map((promo, i) => (
              <div key={i}
                className={`min-w-[220px] h-24 rounded-2xl p-5 text-white flex flex-col justify-center overflow-hidden bg-gradient-to-r ${promo.color || 'from-gray-900 to-black'} flex-shrink-0`}>
                <p className="font-black text-lg uppercase italic leading-tight">{promo.title || 'Название акции'}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-1">{promo.desc || 'Описание'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Список акций */}
      <div className="space-y-4">
        {promos.map((promo, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Акция #{i + 1}</span>
              <button onClick={() => removePromo(i)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Заголовок</label>
                <input value={promo.title} onChange={e => updatePromo(i, 'title', e.target.value)}
                  placeholder="Скидка 20% на первый визит"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Подзаголовок / условия</label>
                <input value={promo.desc} onChange={e => updatePromo(i, 'desc', e.target.value)}
                  placeholder="Только до 31 марта"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Цвет карточки</label>
              <div className="flex flex-wrap gap-2">
                {PROMO_COLORS.map(c => (
                  <button key={c.value} onClick={() => updatePromo(i, 'color', c.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${c.value} ${promo.color === c.value ? 'ring-2 ring-offset-2 ring-purple-500' : 'opacity-80 hover:opacity-100'} transition-all`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {promos.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
            <p className="text-gray-400 text-sm mb-4">Акций пока нет</p>
            <button onClick={addPromo}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl font-medium text-sm transition-colors mx-auto">
              <Plus size={16} /> Добавить первую акцию
            </button>
          </div>
        )}
      </div>

      {promos.length > 0 && (
        <button onClick={handleSave} disabled={saving}
          className="mt-6 flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? '✅ Сохранено!' : saving ? 'Сохранение...' : 'Сохранить акции'}
        </button>
      )}
    </div>
  )
}