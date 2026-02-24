'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, Upload, Trash2, Plus, GripVertical, ExternalLink } from 'lucide-react'

interface Service {
  id: number
  business_id: number
  name: string
  category: string
  price: number
  duration_minutes: number
  description: string
  is_active: boolean
  sort_order: number
  // Поля для инфо о доме (глэмпинг / аренда)
  show_details?: boolean
  photo_url?: string
  photos?: string[]
  features?: string
}

interface Master {
  id: number
  business_id: number
  name: string
  specialization: string
  photo_url: string
  bio: string
  is_active: boolean
  sort_order: number
}

interface Addon {
  id: number
  business_id: number
  name: string
  price: number
  description: string
  is_active: boolean
  sort_order: number
  show_details: boolean
  photos: string[]
  video_url: string
}

export default function BusinessEditor({
  business,
  services: initialServices,
  masters: initialMasters,
  addons: initialAddons,
}: {
  business: any
  services: Service[]
  masters: Master[]
  addons: Addon[]
}) {
  const router = useRouter()
  const supabase = createClient()

  // Основные настройки
  const [name, setName] = useState(business.name)
  const [slug, setSlug] = useState(business.slug)
  const [shortDescription, setShortDescription] = useState(business.short_description || '')
  const [businessType, setBusinessType] = useState(business.business_type || 'barbershop')
  const [logoUrl, setLogoUrl] = useState(business.logo_url || business.avatar_url || '')
  const [bgImage, setBgImage] = useState(business.bg_image || '')
  const [telegramChatId, setTelegramChatId] = useState(business.telegram_chat_id || '')
  const [managerTelegram, setManagerTelegram] = useState(business.manager_telegram || business.telegram || '')
  
  // О нас
  const [aboutText, setAboutText] = useState(business.about_text || business.description || '')
  const [aboutAddress, setAboutAddress] = useState(business.about_address || business.address || '')
  
  // График работы
  const defaultSchedule = {
    monday: { open: '10:00', close: '20:00', closed: false },
    tuesday: { open: '10:00', close: '20:00', closed: false },
    wednesday: { open: '10:00', close: '20:00', closed: false },
    thursday: { open: '10:00', close: '20:00', closed: false },
    friday: { open: '10:00', close: '20:00', closed: false },
    saturday: { open: '10:00', close: '20:00', closed: false },
    sunday: { open: '10:00', close: '20:00', closed: false },
  }
  const [schedule, setSchedule] = useState(business.schedule || defaultSchedule)
  
  // Яндекс карты
  const [showYandexMap, setShowYandexMap] = useState(business.show_yandex_map || false)
  const [yandexMapLink, setYandexMapLink] = useState(business.yandex_map_link || '')
  
  // Галерея фото
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>(business.gallery_photos || [])
  
  // Соцсети
  const [socialLinks, setSocialLinks] = useState<any[]>(business.social_links || [])
  
  // Акции
  const [promotions, setPromotions] = useState<any[]>(business.promotions || [])
  
  // Рассылка
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [broadcastLoading, setBroadcastLoading] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState<{sent: number, total: number} | null>(null)
  const [subscribersCount, setSubscribersCount] = useState<number | null>(null)
  
  // Услуги, мастера, доп. услуги
  const [services, setServices] = useState(initialServices)
  const [masters, setMasters] = useState(initialMasters)
  const [addons, setAddons] = useState(initialAddons)
  
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'about' | 'social' | 'services' | 'addons' | 'masters' | 'promotions' | 'broadcast'>('general')

  // Загрузка изображений — санитизация имени файла для любых форматов и кириллицы
  const uploadImage = async (file: File, path: string) => {
    const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage
      .from('business-assets')
      .upload(`${path}/${safeName}`, file, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage
      .from('business-assets')
      .getPublicUrl(data.path)
    return publicUrl
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadImage(file, `logos/${business.id}`)
      setLogoUrl(url)
    } catch (error) {
      alert('Ошибка загрузки логотипа')
    }
  }

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadImage(file, `backgrounds/${business.id}`)
      setBgImage(url)
    } catch (error) {
      alert('Ошибка загрузки фона')
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadImage(file, `gallery/${business.id}`)
      setGalleryPhotos([...galleryPhotos, url])
      e.target.value = '' // Сброс input для повторной загрузки
    } catch (error) {
      alert('Ошибка загрузки фото')
    }
  }

  // Соцсети
  const addSocialLink = () => setSocialLinks([...socialLinks, { type: 'instagram', url: '', label: '' }])
  const updateSocialLink = (index: number, field: string, value: string) => {
    const updated = [...socialLinks]
    updated[index][field] = value
    setSocialLinks(updated)
  }
  const removeSocialLink = (index: number) => setSocialLinks(socialLinks.filter((_, i) => i !== index))

  // Услуги
  const addService = () => setServices([...services, {
    id: Date.now(), business_id: business.id, name: '', category: '', price: 0,
    duration_minutes: 30, description: '', is_active: true, sort_order: services.length,
    show_details: false, photo_url: '', photos: [], features: ''
  }])
  const updateService = (index: number, field: string, value: any) => {
    const updated = [...services]
    updated[index] = { ...updated[index], [field]: value }
    setServices(updated)
  }
  const removeService = (index: number) => setServices(services.filter((_, i) => i !== index))

  // Доп. услуги
  const addAddon = () => setAddons([...addons, {
    id: Date.now(), business_id: business.id, name: '', price: 0,
    description: '', is_active: true, sort_order: addons.length,
    show_details: false, photos: [], video_url: ''
  }])
  const updateAddon = (index: number, field: string, value: any) => {
    const updated = [...addons]
    updated[index] = { ...updated[index], [field]: value }
    setAddons(updated)
  }
  const removeAddon = (index: number) => setAddons(addons.filter((_, i) => i !== index))

  // Мастера
  const addMaster = () => setMasters([...masters, {
    id: Date.now(), business_id: business.id, name: '', specialization: '',
    photo_url: '', bio: '', is_active: true, sort_order: masters.length
  }])
  const updateMaster = (index: number, field: string, value: any) => {
    const updated = [...masters]
    updated[index] = { ...updated[index], [field]: value }
    setMasters(updated)
  }
  const removeMaster = (index: number) => setMasters(masters.filter((_, i) => i !== index))

  // Удаление бизнеса
  const handleDelete = async () => {
    if (!confirm(`Удалить бизнес "${name}" навсегда? Это действие нельзя отменить!`)) return
    
    try {
      await supabase.from('businesses').delete().eq('id', business.id)
      alert('✅ Бизнес удален')
      router.push('/admin/businesses')
    } catch (error) {
      alert('❌ Ошибка удаления')
    }
  }

  // Сохранение
  const handleSave = async () => {
    setSaving(true)
    try {
      // Обновить бизнес
      await supabase.from('businesses').update({
        name, 
        slug, 
        short_description: shortDescription, 
        business_type: businessType, 
        logo_url: logoUrl, 
        avatar_url: logoUrl, 
        bg_image: bgImage, 
        telegram_chat_id: telegramChatId,
        manager_telegram: managerTelegram, 
        about_text: aboutText, 
        description: aboutText,
        about_address: aboutAddress, 
        address: aboutAddress, 
        schedule: schedule, 
        show_yandex_map: showYandexMap, 
        yandex_map_link: yandexMapLink,
        gallery_photos: galleryPhotos, 
        social_links: socialLinks,
        promotions: promotions
      }).eq('id', business.id)

      // Сохранить услуги
      const oldServiceIds = initialServices.map(s => s.id)
      const currentServiceIds = services.filter(s => s.id < 1000000000000).map(s => s.id)
      const toDeleteServices = oldServiceIds.filter(id => !currentServiceIds.includes(id))
      if (toDeleteServices.length > 0) await supabase.from('services').delete().in('id', toDeleteServices)
      for (const service of services) {
        const serviceData = {
          business_id: service.business_id,
          name: service.name,
          category: service.category,
          price: service.price,
          duration_minutes: service.duration_minutes,
          description: service.description,
          is_active: service.is_active,
          sort_order: service.sort_order,
          show_details: service.show_details || false,
          photo_url: service.photo_url || '',
          photos: service.photos || [],
          features: service.features || '',
        }
        if (service.id > 1000000000000) {
          await supabase.from('services').insert(serviceData)
        } else {
          await supabase.from('services').update(serviceData).eq('id', service.id)
        }
      }

      // Сохранить доп. услуги
      const oldAddonIds = initialAddons.map(a => a.id)
      const currentAddonIds = addons.filter(a => a.id < 1000000000000).map(a => a.id)
      const toDeleteAddons = oldAddonIds.filter(id => !currentAddonIds.includes(id))
      if (toDeleteAddons.length > 0) await supabase.from('addons').delete().in('id', toDeleteAddons)
      for (const addon of addons) {
        if (addon.id > 1000000000000) {
          const { id, ...data } = addon
          await supabase.from('addons').insert(data)
        } else {
          await supabase.from('addons').update(addon).eq('id', addon.id)
        }
      }

      // Сохранить мастеров
      const oldMasterIds = initialMasters.map(m => m.id)
      const currentMasterIds = masters.filter(m => m.id < 1000000000000).map(m => m.id)
      const toDeleteMasters = oldMasterIds.filter(id => !currentMasterIds.includes(id))
      if (toDeleteMasters.length > 0) await supabase.from('masters').delete().in('id', toDeleteMasters)
      for (const master of masters) {
        if (master.id > 1000000000000) {
          const { id, ...data } = master
          await supabase.from('masters').insert(data)
        } else {
          await supabase.from('masters').update(master).eq('id', master.id)
        }
      }

      alert('✅ Сохранено!')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('❌ Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const getPlaceholder = (type: string) => {
    if (type === 'instagram') return '@username'
    if (type === 'telegram') return 't.me/username'
    if (type === 'whatsapp') return '+79991234567'
    return '+79991234567'
  }

  const dayNames: Record<string, string> = {
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье',
  }

  // Загрузка числа подписчиков
  const loadSubscribersCount = async () => {
    const { count } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('business_slug', business.slug)
    setSubscribersCount(count || 0)
  }

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return
    setBroadcastLoading(true)
    setBroadcastResult(null)
    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_slug: business.slug, message: broadcastMsg }),
      })
      const data = await res.json()
      setBroadcastResult({ sent: data.sent, total: data.total })
      setBroadcastMsg('')
    } catch {
      alert('Ошибка отправки рассылки')
    } finally {
      setBroadcastLoading(false)
    }
  }

  const PROMO_COLORS = [
    { label: 'Красный', value: 'from-red-500 to-pink-600' },
    { label: 'Фиолетовый', value: 'from-purple-500 to-pink-500' },
    { label: 'Синий', value: 'from-blue-500 to-cyan-500' },
    { label: 'Зелёный', value: 'from-green-500 to-teal-500' },
    { label: 'Оранжевый', value: 'from-orange-500 to-amber-500' },
    { label: 'Чёрный', value: 'from-gray-900 to-black' },
  ]

  const addPromo = () => setPromotions([...promotions, { title: '', desc: '', color: 'from-gray-900 to-black' }])
  const updatePromo = (i: number, field: string, value: string) => {
    const updated = [...promotions]; updated[i] = { ...updated[i], [field]: value }; setPromotions(updated)
  }
  const removePromo = (i: number) => setPromotions(promotions.filter((_, idx) => idx !== i))

  const tabs = [
    { id: 'general', label: 'Основное' },
    { id: 'about', label: 'О нас' },
    { id: 'social', label: 'Соцсети' },
    { id: 'promotions', label: '🔥 Акции' },
    { id: 'services', label: 'Услуги' },
    { id: 'addons', label: 'Доп. услуги' },
    { id: 'masters', label: 'Мастера' },
    { id: 'broadcast', label: '📣 Рассылка' },
  ]

  return (
    <div className="p-8">
      {/* ШАПКА */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
          <p className="text-gray-500 mt-1">Редактирование бизнеса</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors">
            🗑️ Удалить
          </button>
          <a href={`/${slug}`} target="_blank" className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-medium transition-colors">
            <ExternalLink size={20} />
            Предпросмотр
          </a>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all">
            <Save size={20} />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      {/* ТАБЫ */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* КОНТЕНТ */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        
        {/* ТАБ: ОСНОВНОЕ */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название бизнеса</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL (slug)</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                <p className="text-xs text-gray-500 mt-1">linkalink.ru/{slug}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Краткое описание (под названием)</label>
              <input type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} 
                placeholder="Лучший барбершоп в городе" 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Тип бизнеса</label>
              <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="barbershop">💈 Барбершоп</option>
                <option value="salon">💅 Салон красоты</option>
                <option value="glamping">🏕 Глэмпинг</option>
                <option value="rental">🏢 Аренда помещения</option>
                <option value="cafe">☕️ Кафе</option>
                <option value="linkalink">🔗 Linkalink (страница со ссылками)</option>
              </select>
              <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 space-y-1">
                {businessType === 'barbershop' && <p>💈 <b>Барбершоп</b> — запись к мастеру на конкретное время. Клиент выбирает услугу → мастера → дату/время → оставляет контакты.</p>}
                {businessType === 'salon' && <p>💅 <b>Салон красоты</b> — аналогично барбершопу, запись к мастеру. Отличие в визуальном оформлении и категориях услуг. Подходит для маникюра, причёсок, косметологии.</p>}
                {businessType === 'glamping' && <p>🏕 <b>Глэмпинг</b> — бронирование домика на даты. Клиент выбирает дом → даты → допуслуги → связывается с менеджером для оплаты. Заблокированные даты подтягиваются автоматически.</p>}
                {businessType === 'rental' && <p>🏢 <b>Аренда помещения</b> — почасовая аренда. Клиент выбирает помещение → день → временные слоты (шаг 30 мин). Занятое время блокируется автоматически.</p>}
                {businessType === 'cafe' && <p>☕️ <b>Кафе</b> — запись на столик или оформление заказа. Аналогично барбершопу, мастера = официанты/столики.</p>}
              </div>
            </div>
            
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📲</span>
                <div>
                  <h4 className="font-bold text-blue-900 text-sm">Telegram-настройки</h4>
                  <p className="text-xs text-blue-700 mt-0.5">Два разных поля с разными задачами — заполните оба</p>
                </div>
              </div>

              {/* FIELD 1: Chat ID for notifications */}
              <div className="bg-white rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔔</span>
                  <label className="text-sm font-bold text-gray-800">Куда приходят уведомления о записях</label>
                </div>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="-1001234567890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 font-mono text-sm"
                />
                <div className="text-xs text-gray-500 space-y-1 pt-1">
                  <p>Это <b>числовой ID</b> вашего Telegram-чата или личного аккаунта.</p>
                  <p>Когда клиент оформляет запись — бот <code className="bg-gray-100 px-1 rounded">@linkalink_notify_bot</code> отправит сообщение туда.</p>
                  <p className="text-blue-600 font-medium">Как узнать свой ID: напишите боту <code className="bg-blue-50 px-1 rounded">@userinfobot</code> в Telegram — он пришлёт ваш числовой ID.</p>
                  <p>Для группы/канала: добавьте бота в группу, сделайте его администратором, затем перешлите любое сообщение из группы боту <code className="bg-gray-100 px-1 rounded">@getidsbot</code>.</p>
                </div>
              </div>

              {/* FIELD 2: Manager username (glamping only) */}
              {businessType === 'glamping' && (
                <div className="bg-white rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💬</span>
                    <label className="text-sm font-bold text-gray-800">Username менеджера для оплаты</label>
                  </div>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 font-mono">@</span>
                    <input
                      type="text"
                      value={managerTelegram}
                      onChange={(e) => setManagerTelegram(e.target.value.replace('@', '').trim())}
                      placeholder="ivan_manager"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-blue-400 font-mono text-sm"
                    />
                  </div>
                  <div className="text-xs text-gray-500 space-y-1 pt-1">
                    <p>Это <b>username</b> (логин) аккаунта менеджера в Telegram, без @.</p>
                    <p>После выбора дат клиент нажимает кнопку «Связаться для оплаты» — открывается диалог с <b>этим</b> аккаунтом. Туда приходит готовое сообщение с деталями брони.</p>
                    <p>Это отдельно от уведомлений: уведомление приходит боту по Chat ID выше, а клиент пишет напрямую менеджеру сюда.</p>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Логотип</label>
              <div className="flex items-center gap-4">
                {logoUrl && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer transition-colors">
                  <Upload size={20} />
                  {logoUrl ? 'Изменить логотип' : 'Загрузить логотип'}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {logoUrl && (
                  <button onClick={() => setLogoUrl('')} className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Фоновое изображение</label>
              <div className="space-y-4">
                {bgImage && (
                  <div className="w-full h-48 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img src={bgImage} alt="Background" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer transition-colors">
                    <Upload size={20} />
                    {bgImage ? 'Изменить фон' : 'Загрузить фон'}
                    <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
                  </label>
                  {bgImage && (
                    <button onClick={() => setBgImage('')} className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ТАБ: О НАС */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Полное описание (в разделе "О нас")</label>
              <textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)} rows={6}
                placeholder="Расскажите о вашем бизнесе..." 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
              <input type="text" value={aboutAddress} onChange={(e) => setAboutAddress(e.target.value)} 
                placeholder="г. Москва, ул. Примерная, д. 1"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">График работы</label>
              <div className="space-y-3">
                {Object.entries(schedule).map(([day, hours]: [string, any]) => (
                  <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-32 font-medium text-gray-700">{dayNames[day]}</div>
                    
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={hours.closed}
                        onChange={(e) => setSchedule({ ...schedule, [day]: { ...hours, closed: e.target.checked } })}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                      <span className="text-sm text-gray-700">Выходной</span>
                    </label>
                    
                    {!hours.closed && (
                      <>
                        <input type="time" value={hours.open}
                          onChange={(e) => setSchedule({ ...schedule, [day]: { ...hours, open: e.target.value } })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                        <span className="text-gray-500">—</span>
                        <input type="time" value={hours.close}
                          onChange={(e) => setSchedule({ ...schedule, [day]: { ...hours, close: e.target.value } })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input type="checkbox" checked={showYandexMap}
                  onChange={(e) => setShowYandexMap(e.target.checked)} 
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                <span className="text-sm font-medium text-gray-700">Показывать Яндекс Карту на сайте</span>
              </label>
              
              {showYandexMap && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ссылка на Яндекс Карты (iframe src)</label>
                  <input type="text" value={yandexMapLink} onChange={(e) => setYandexMapLink(e.target.value)}
                    placeholder="https://yandex.ru/map-widget/v1/..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  <p className="text-xs text-gray-500 mt-1">
                    Яндекс Карты → Поделиться → HTML-код → скопируйте ссылку из src="..."
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Галерея фото (для раздела "О нас")</label>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {galleryPhotos.map((photo, i) => (
                  <div key={i} className="relative group">
                    <img src={photo} alt={`Photo ${i+1}`} className="w-full h-32 object-cover rounded-lg border-2 border-gray-200" />
                    <button
                      onClick={() => setGalleryPhotos(galleryPhotos.filter((_, idx) => idx !== i))}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer transition-colors w-fit">
                <Upload size={20} />
                Загрузить фото
                <input type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
              </label>
              <p className="text-xs text-gray-500 mt-2">Можно загружать по одному фото. Они будут отображаться каруселью.</p>
            </div>
          </div>
        )}

        {/* ТАБ: СОЦСЕТИ */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Добавьте ссылки на соцсети. Они будут отображаться кнопками на странице.
              </p>
              <button onClick={addSocialLink} className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors">
                <Plus size={18} />
                Добавить
              </button>
            </div>
            
            <div className="space-y-4">
              {socialLinks.map((link, i) => (
                <div key={i} className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl">
                  <select value={link.type} onChange={(e) => updateSocialLink(i, 'type', e.target.value)} 
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option value="instagram">Instagram</option>
                    <option value="telegram">Telegram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="phone">Телефон</option>
                  </select>
                  
                  <input type="text" value={link.url} onChange={(e) => updateSocialLink(i, 'url', e.target.value)}
                    placeholder={getPlaceholder(link.type)} 
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  
                  <input type="text" value={link.label || ''} onChange={(e) => updateSocialLink(i, 'label', e.target.value)}
                    placeholder="Название (опц.)" 
                    className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  
                  <button onClick={() => removeSocialLink(i)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              
              {socialLinks.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  Нет добавленных соцсетей
                </div>
              )}
            </div>
          </div>
        )}

        {/* ТАБ: УСЛУГИ */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Управление услугами и ценами</p>
              <button onClick={addService} className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors">
                <Plus size={18} />
                Добавить услугу
              </button>
            </div>
            
            <div className="space-y-4">
              {services.map((s, i) => (
                <div key={s.id} className="p-6 bg-gray-50 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="text-gray-400 cursor-move" size={20} />
                      <span className="font-medium text-gray-900">Услуга #{i + 1}</span>
                    </div>
                    <button onClick={() => removeService(i)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Название</label>
                      <input type="text" value={s.name} onChange={(e) => updateService(i, 'name', e.target.value)} 
                        placeholder={businessType === 'glamping' ? 'Домик «Берёза»' : businessType === 'rental' ? 'Большой зал' : 'Стрижка мужская'} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                    </div>
                    {businessType !== 'glamping' && businessType !== 'rental' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Категория</label>
                        <input type="text" value={s.category || ''} onChange={(e) => updateService(i, 'category', e.target.value)} 
                          placeholder="Стрижки" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Цена (₽{businessType === 'glamping' ? ' / ночь' : businessType === 'rental' ? ' / час' : ''})</label>
                      <input type="number" value={s.price || 0} onChange={(e) => updateService(i, 'price', +e.target.value)} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                    </div>
                    {businessType !== 'glamping' && businessType !== 'rental' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Длительность (мин)</label>
                        <input type="number" value={s.duration_minutes || 30} onChange={(e) => updateService(i, 'duration_minutes', +e.target.value)} 
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Описание (опционально)</label>
                    <textarea value={s.description || ''} onChange={(e) => updateService(i, 'description', e.target.value)} 
                      rows={2} placeholder="Описание услуги" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  </div>
                  
                  {/* Блок «Инфо о доме» — для глэмпинга и аренды */}
                  {(businessType === 'glamping' || businessType === 'rental') && (
                    <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
                      <label className="flex items-center gap-3 cursor-pointer mb-3">
                        <input type="checkbox" checked={s.show_details || false}
                          onChange={(e) => updateService(i, 'show_details', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                        <div>
                          <span className="text-sm font-semibold text-blue-800">🏠 Есть информация о доме</span>
                          <p className="text-xs text-blue-600 mt-0.5">На карточке появится фото, при клике — детальная страница с каруселью, описанием и особенностями</p>
                        </div>
                      </label>
                      
                      {s.show_details && (
                        <div className="space-y-4 pt-2 border-t border-blue-200">
                          {/* Обложка */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Фото обложки (показывается на карточке)</label>
                            <div className="flex items-center gap-3">
                              {s.photo_url && (
                                <img src={s.photo_url} alt="" className="w-20 h-14 object-cover rounded-lg border border-gray-200" />
                              )}
                              <div className="flex-1 space-y-2">
                                <label className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-lg cursor-pointer text-sm w-fit">
                                  <Upload size={16} />
                                  Загрузить обложку
                                  <input type="file" accept="image/*" className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0]
                                      if (!file) return
                                      try {
                                        const url = await uploadImage(file, `services/${business.id}`)
                                        updateService(i, 'photo_url', url)
                                        e.target.value = ''
                                      } catch { alert('Ошибка загрузки') }
                                    }} />
                                </label>
                                <input type="text" value={s.photo_url || ''}
                                  onChange={(e) => updateService(i, 'photo_url', e.target.value)}
                                  placeholder="или вставьте URL"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                              </div>
                              {s.photo_url && (
                                <button onClick={() => updateService(i, 'photo_url', '')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Карусель фото */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Фотографии (карусель в детальном просмотре)</label>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                              {(s.photos || []).map((photo: string, pi: number) => (
                                <div key={pi} className="relative group">
                                  <img src={photo} alt="" className="w-full h-20 object-cover rounded-lg border-2 border-gray-200" />
                                  <button
                                    onClick={() => {
                                      const newPhotos = (s.photos || []).filter((_: string, idx: number) => idx !== pi)
                                      updateService(i, 'photos', newPhotos)
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <label className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-lg cursor-pointer text-sm w-fit">
                              <Upload size={16} />
                              Добавить фото
                              <input type="file" accept="image/*" className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (!file) return
                                  try {
                                    const url = await uploadImage(file, `services/${business.id}`)
                                    updateService(i, 'photos', [...(s.photos || []), url])
                                    e.target.value = ''
                                  } catch { alert('Ошибка загрузки') }
                                }} />
                            </label>
                          </div>

                          {/* Особенности */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Особенности / удобства (каждая с новой строки)</label>
                            <textarea value={s.features || ''}
                              onChange={(e) => updateService(i, 'features', e.target.value)}
                              rows={3}
                              placeholder={"Wi-Fi\nКондиционер\nЧайник и кофе\nВид на лес"}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                            <p className="text-xs text-gray-400 mt-1">Отображаются иконками ✓ в детальном просмотре дома</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={s.is_active} onChange={(e) => updateService(i, 'is_active', e.target.checked)} 
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                    <span className="text-sm font-medium text-gray-700">Активна (отображается на сайте)</span>
                  </label>
                </div>
              ))}
              
              {services.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  Нет добавленных услуг
                </div>
              )}
            </div>
          </div>
        )}

        {/* ТАБ: ДОП. УСЛУГИ */}
        {activeTab === 'addons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Дополнительные услуги</p>
                <p className="text-xs text-gray-400 mt-1">Отображаются как информационные карточки на странице бизнеса</p>
              </div>
              <button onClick={addAddon} className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors">
                <Plus size={18} />
                Добавить
              </button>
            </div>
            
            <div className="space-y-4">
              {addons.map((addon, i) => (
                <div key={addon.id} className="p-6 bg-gray-50 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Доп. услуга #{i + 1}</span>
                    <button onClick={() => removeAddon(i)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Название</label>
                      <input type="text" value={addon.name} onChange={(e) => updateAddon(i, 'name', e.target.value)} 
                        placeholder="Например: Укладка" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Цена (₽)</label>
                      <input type="number" value={addon.price || 0} onChange={(e) => updateAddon(i, 'price', +e.target.value)} 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Описание</label>
                    <textarea value={addon.description || ''} onChange={(e) => updateAddon(i, 'description', e.target.value)} 
                      rows={2} placeholder="Краткое описание услуги" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  </div>

                  {/* Show details toggle */}
                  <div className="border border-purple-200 rounded-xl p-4 bg-purple-50">
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <input type="checkbox" checked={addon.show_details || false}
                        onChange={(e) => updateAddon(i, 'show_details', e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                      <div>
                        <span className="text-sm font-semibold text-purple-800">Подробнее об услуге</span>
                        <p className="text-xs text-purple-600 mt-0.5">Показывать карточку с медиа на странице</p>
                      </div>
                    </label>
                    
                    {addon.show_details && (
                      <div className="space-y-4 pt-2 border-t border-purple-200">
                        {/* Photos */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Фотографии (карусель)</label>
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            {(addon.photos || []).map((photo: string, pi: number) => (
                              <div key={pi} className="relative group">
                                <img src={photo} alt="" className="w-full h-20 object-cover rounded-lg border-2 border-gray-200" />
                                <button
                                  onClick={() => {
                                    const newPhotos = (addon.photos || []).filter((_: string, idx: number) => idx !== pi)
                                    updateAddon(i, 'photos', newPhotos)
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                          <label className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-lg cursor-pointer text-sm transition-colors w-fit">
                            <Upload size={16} />
                            Добавить фото
                            <input type="file" accept="image/*" className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                try {
                                  const url = await uploadImage(file, `addons/${business.id}`)
                                  updateAddon(i, 'photos', [...(addon.photos || []), url])
                                  e.target.value = ''
                                } catch { alert('Ошибка загрузки фото') }
                              }} />
                          </label>
                        </div>

                        {/* Video URL */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Видео (URL iframe)</label>
                          <input type="text" value={addon.video_url || ''}
                            onChange={(e) => updateAddon(i, 'video_url', e.target.value)}
                            placeholder="https://www.youtube.com/embed/..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
                          <p className="text-xs text-gray-400 mt-1">YouTube / Vimeo embed-ссылка</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={addon.is_active} 
                      onChange={(e) => updateAddon(i, 'is_active', e.target.checked)} 
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                    <span className="text-sm font-medium text-gray-700">Активна (отображается на сайте)</span>
                  </label>
                </div>
              ))}
              
              {addons.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  Нет добавленных дополнительных услуг
                </div>
              )}
            </div>
          </div>
        )}

        {/* ТАБ: МАСТЕРА */}
        {activeTab === 'masters' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Управление мастерами/персоналом</p>
              <button onClick={addMaster} className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors">
                <Plus size={18} />
                Добавить мастера
              </button>
            </div>
            
            <div className="space-y-4">
              {masters.map((m, i) => (
                <div key={m.id} className="p-6 bg-gray-50 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="text-gray-400 cursor-move" size={20} />
                      <span className="font-medium text-gray-900">Мастер #{i + 1}</span>
                    </div>
                    <button onClick={() => removeMaster(i)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Имя</label>
                      <input type="text" value={m.name} onChange={(e) => updateMaster(i, 'name', e.target.value)} 
                        placeholder="Иван Иванов" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Специализация</label>
                      <input type="text" value={m.specialization || ''} onChange={(e) => updateMaster(i, 'specialization', e.target.value)} 
                        placeholder="Барбер" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Фото мастера</label>
                    <div className="flex items-center gap-3">
                      {m.photo_url && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-200 shrink-0">
                          <img src={m.photo_url} alt={m.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer text-sm transition-colors w-fit">
                          <Upload size={16} />
                          {m.photo_url ? 'Изменить фото' : 'Загрузить фото'}
                          <input type="file" accept="image/*" className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              try {
                                const url = await uploadImage(file, `masters/${business.id}`)
                                updateMaster(i, 'photo_url', url)
                                e.target.value = ''
                              } catch { alert('Ошибка загрузки') }
                            }} />
                        </label>
                        <input type="text" value={m.photo_url || ''} onChange={(e) => updateMaster(i, 'photo_url', e.target.value)} 
                          placeholder="или вставьте URL фото" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500" />
                      </div>
                      {m.photo_url && (
                        <button onClick={() => updateMaster(i, 'photo_url', '')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">О мастере</label>
                    <textarea value={m.bio || ''} onChange={(e) => updateMaster(i, 'bio', e.target.value)} 
                      rows={2} placeholder="Опыт работы, достижения..." 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                  </div>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={m.is_active} onChange={(e) => updateMaster(i, 'is_active', e.target.checked)} 
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                    <span className="text-sm font-medium text-gray-700">Активен (доступен для записи)</span>
                  </label>
                </div>
              ))}
              
              {masters.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  Нет добавленных мастеров
                </div>
              )}
            </div>
          </div>
        )}

        {/* ТАБ: АКЦИИ */}
        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Акции и спецпредложения</p>
                <p className="text-xs text-gray-400 mt-1">Отображаются прокручивающейся лентой на странице бизнеса</p>
              </div>
              <button onClick={addPromo} className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg font-medium transition-colors">
                <Plus size={18} />
                Добавить акцию
              </button>
            </div>

            {/* Превью */}
            {promotions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Превью</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {promotions.map((promo, i) => (
                    <div key={i}
                      className={`min-w-[220px] h-24 rounded-2xl p-5 text-white flex flex-col justify-center relative overflow-hidden bg-gradient-to-r ${promo.color || 'from-gray-900 to-black'}`}>
                      <p className="font-black text-lg uppercase italic leading-tight">{promo.title || 'Название акции'}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-1">{promo.desc || 'Описание'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {promotions.map((promo, i) => (
                <div key={i} className="p-6 bg-gray-50 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Акция #{i + 1}</span>
                    <button onClick={() => removePromo(i)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Заголовок акции</label>
                      <input type="text" value={promo.title} onChange={(e) => updatePromo(i, 'title', e.target.value)}
                        placeholder="Скидка 20% на первый визит"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Подзаголовок / условия</label>
                      <input type="text" value={promo.desc} onChange={(e) => updatePromo(i, 'desc', e.target.value)}
                        placeholder="Только до 31 марта"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Цвет карточки</label>
                    <div className="flex flex-wrap gap-2">
                      {PROMO_COLORS.map((c) => (
                        <button key={c.value} onClick={() => updatePromo(i, 'color', c.value)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${c.value} ${promo.color === c.value ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {promotions.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  Нет добавленных акций
                </div>
              )}
            </div>

            {promotions.length > 0 && (
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all">
                <Save size={20} />
                {saving ? 'Сохранение...' : 'Сохранить акции'}
              </button>
            )}
          </div>
        )}

        {/* ТАБ: РАССЫЛКА */}
        {activeTab === 'broadcast' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-bold text-blue-900 mb-2">📣 Рассылка через Telegram-бот</h3>
              <p className="text-sm text-blue-700 mb-3">
                Клиенты могут подписаться на уведомления, нажав кнопку на странице бизнеса или перейдя по ссылке:
              </p>
              <code className="block bg-white text-sm px-4 py-2 rounded-lg border border-blue-200 text-blue-800 break-all">
                https://t.me/linkalink_notify_bot?start={business.slug}
              </code>
              <button onClick={loadSubscribersCount}
                className="mt-3 text-sm text-blue-600 underline hover:text-blue-800">
                Проверить число подписчиков
              </button>
              {subscribersCount !== null && (
                <p className="mt-2 text-sm font-bold text-blue-900">
                  👥 Подписчиков: {subscribersCount}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Сообщение рассылки</label>
              <p className="text-xs text-gray-400 mb-2">Поддерживается HTML-разметка: &lt;b&gt;жирный&lt;/b&gt;, &lt;i&gt;курсив&lt;/i&gt;, &lt;a href=&quot;...&quot;&gt;ссылка&lt;/a&gt;</p>
              <textarea value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)}
                rows={6}
                placeholder={`🔥 <b>Горячая акция!</b>\n\nСкидка 20% на все услуги до конца недели!\n\nЗаписывайтесь: ваш-сайт.ru`}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-mono text-sm" />
              <p className="text-xs text-gray-400 mt-1">{broadcastMsg.length} символов</p>
            </div>

            {/* Превью сообщения */}
            {broadcastMsg && (
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Превью</p>
                <div className="text-sm text-gray-800 whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: broadcastMsg }} />
              </div>
            )}

            <button
              onClick={handleBroadcast}
              disabled={!broadcastMsg.trim() || broadcastLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold text-base uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {broadcastLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Отправляем...
                </>
              ) : '📣 Отправить рассылку всем подписчикам'}
            </button>

            {broadcastResult && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-green-800 font-bold text-lg">✅ Рассылка отправлена!</p>
                <p className="text-green-600 text-sm mt-1">
                  Доставлено: {broadcastResult.sent} из {broadcastResult.total} подписчиков
                </p>
              </div>
            )}

            {/* История рассылок */}
            <BroadcastHistory businessSlug={business.slug} supabase={supabase} />
          </div>
        )}
      </div>
    </div>
  )
}

function BroadcastHistory({ businessSlug, supabase }: { businessSlug: string, supabase: any }) {
  const [history, setHistory] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  const load = async () => {
    const { data } = await supabase
      .from('broadcasts')
      .select('*')
      .eq('business_slug', businessSlug)
      .order('created_at', { ascending: false })
      .limit(10)
    setHistory(data || [])
    setLoaded(true)
  }

  return (
    <div>
      {!loaded ? (
        <button onClick={load} className="text-sm text-gray-500 underline">Показать историю рассылок</button>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">История рассылок</p>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">Рассылок ещё не было</p>
          ) : (
            history.map((b) => (
              <div key={b.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{new Date(b.created_at).toLocaleString('ru-RU')}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                    Отправлено: {b.sent_count}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{b.message.replace(/<[^>]+>/g, '')}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}