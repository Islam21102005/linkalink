import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Building2, Calendar, TrendingUp, Plus } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { count: businessesCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })

  const { count: bookingsCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })

  const today = new Date().toISOString().split('T')[0]
  const { count: todayBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('booking_date', today)

  const { data: recentBusinesses } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
          <p className="text-gray-500 mt-1">Обзор вашей платформы</p>
        </div>

        <Link
          href="/admin/businesses/new"
          className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-pink-500/50 transition-all"
        >
          <Plus size={20} />
          Создать бизнес
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="text-blue-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{businessesCount || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Бизнесов</h3>
          <p className="text-sm text-gray-500 mt-1">Всего на платформе</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="text-green-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{todayBookings || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Записей сегодня</h3>
          <p className="text-sm text-gray-500 mt-1">Новые заявки</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{bookingsCount || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Всего записей</h3>
          <p className="text-sm text-gray-500 mt-1">За всё время</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Последние бизнесы</h2>
        
        <div className="space-y-3">
          {recentBusinesses?.map((business) => (
            <Link
              key={business.id}
              href={`/admin/businesses/${business.id}`}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {business.name[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{business.name}</h3>
                  <p className="text-sm text-gray-500">/{business.slug}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(business.created_at).toLocaleDateString('ru-RU')}
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/admin/businesses"
          className="block text-center mt-4 text-purple-600 font-medium hover:text-purple-700"
        >
          Смотреть все →
        </Link>
      </div>
    </div>
  )
}