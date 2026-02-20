import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Edit, ExternalLink } from 'lucide-react'

export default async function BusinessesPage() {
  const supabase = await createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select(`
      *,
      services:services(count),
      masters:masters(count),
      bookings:bookings(count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Бизнесы</h1>
          <p className="text-gray-500 mt-1">Управление сайтами клиентов</p>
        </div>

        <Link
          href="/admin/businesses/new"
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/50 transition-all"
        >
          <Plus size={20} />
          Создать бизнес
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses?.map((business) => (
          <div
            key={business.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="h-32 bg-gradient-to-r from-pink-500 to-purple-600 relative">
              {business.bg_image && (
                <img
                  src={business.bg_image}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{business.name}</h3>
                  <p className="text-sm text-gray-500">/{business.slug}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  business.is_active 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {business.is_active ? 'Активен' : 'Отключен'}
                </span>
              </div>

              <div className="flex gap-4 mb-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">{business.services?.[0]?.count || 0}</span> услуг
                </div>
                <div>
                  <span className="font-medium">{business.masters?.[0]?.count || 0}</span> мастеров
                </div>
                <div>
                  <span className="font-medium">{business.bookings?.[0]?.count || 0}</span> записей
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/businesses/${business.id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Edit size={16} />
                  Редактировать
                </Link>
                <Link
                  href={`/${business.slug}`}
                  target="_blank"
                  className="flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <ExternalLink size={16} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}