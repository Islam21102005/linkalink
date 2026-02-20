'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NewBusinessPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    businessType: 'barbershop',
    telegramChatId: '',
  })
  const [creating, setCreating] = useState(false)

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      // Проверить, занят ли slug
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', formData.slug)
        .single()

      if (existing) {
        alert('Этот URL уже занят')
        setCreating(false)
        return
      }

      // Создать бизнес
      const { data: business, error } = await supabase
        .from('businesses')
        .insert({
          name: formData.name,
          slug: formData.slug,
          business_type: formData.businessType,
          telegram_chat_id: formData.telegramChatId || null,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      // Перейти к редактированию
      router.push(`/admin/businesses/${business.id}`)
    } catch (error) {
      console.error(error)
      alert('Ошибка создания бизнеса')
      setCreating(false)
    }
  }

  return (
    <div className="p-8">
      <Link
        href="/admin/businesses"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
      >
        <ArrowLeft size={20} />
        Назад к списку
      </Link>

      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Создать новый бизнес
        </h1>
        <p className="text-gray-500 mb-8">
          Заполните основную информацию. Остальное настроите позже.
        </p>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название бизнеса *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Барбершоп Elegant"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL (slug) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="elegant-barbershop"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Сайт будет доступен по адресу: linkalink.ru/{formData.slug}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип бизнеса *
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="barbershop">💈 Барбершоп</option>
                <option value="salon">💅 Салон красоты</option>
                <option value="glamping">🏕 Глэмпинг</option>
                <option value="cafe">☕️ Кафе</option>
                <option value="restaurant">🍽 Ресторан</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telegram Chat ID (опционально)
              </label>
              <input
                type="text"
                value={formData.telegramChatId}
                onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="-1001234567890"
              />
              <p className="text-sm text-gray-500 mt-1">
                Можно добавить позже
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href="/admin/businesses"
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-medium text-center transition-colors"
              >
                Отмена
              </Link>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Создание...
                  </>
                ) : (
                  'Создать бизнес'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}