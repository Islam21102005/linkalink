'use client'

import { useState } from 'react'
import {
  Instagram, Phone, MessageCircle, Globe, Twitter, Youtube,
  Mail, MapPin, Info, ExternalLink, Clock,
  ChevronLeft, ChevronRight, X
} from 'lucide-react'

interface SocialLink {
  type: string
  url: string
  label?: string
}

interface Schedule {
  open: string
  close: string
  closed: boolean
}

interface LinkaLinkWidgetProps {
  business: {
    name: string
    short_description?: string
    about_text?: string
    about_address?: string
    logo_url?: string
    avatar_url?: string
    gallery_photos?: string[]
    social_links?: SocialLink[]
    phone?: string
    schedule?: Record<string, Schedule>
    show_yandex_map?: boolean
    yandex_map_link?: string
    map_link?: string
  }
}

const DAY_ORDER  = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAY_SHORT  = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
const DAY_LABELS: Record<string,string> = {
  monday:'Пн', tuesday:'Вт', wednesday:'Ср',
  thursday:'Чт', friday:'Пт', saturday:'Сб', sunday:'Вс',
}

const SOCIAL_META: Record<string, { icon: any; label: string; bg: string }> = {
  instagram:  { icon: Instagram,     label: 'Instagram',     bg: 'from-purple-500 to-pink-500' },
  whatsapp:   { icon: MessageCircle, label: 'WhatsApp',      bg: 'from-green-400 to-emerald-500' },
  telegram:   { icon: MessageCircle, label: 'Telegram',      bg: 'from-sky-400 to-blue-500' },
  phone:      { icon: Phone,         label: 'Позвонить',     bg: 'from-indigo-400 to-purple-500' },
  website:    { icon: Globe,         label: 'Сайт',          bg: 'from-gray-500 to-slate-600' },
  twitter:    { icon: Twitter,       label: 'Twitter / X',   bg: 'from-sky-400 to-blue-600' },
  youtube:    { icon: Youtube,       label: 'YouTube',       bg: 'from-red-500 to-rose-600' },
  email:      { icon: Mail,          label: 'Email',         bg: 'from-violet-400 to-purple-600' },
  maps:       { icon: MapPin,        label: 'На карте',      bg: 'from-amber-400 to-orange-500' },
  tiktok:     { icon: Globe,         label: 'TikTok',        bg: 'from-gray-800 to-gray-900' },
  vk:         { icon: Globe,         label: 'ВКонтакте',     bg: 'from-blue-500 to-blue-700' },
}

function buildHref(type: string, url: string): string {
  const c = url.trim()
  switch (type) {
    case 'phone':     return `tel:${c.replace(/\s/g, '')}`
    case 'whatsapp':  return `https://wa.me/${c.replace(/\D/g, '')}`
    case 'telegram':  return `https://t.me/${c.replace(/^(https?:\/\/)?(t\.me\/)?@?/, '')}`
    case 'instagram': return `https://instagram.com/${c.replace(/^(https?:\/\/)?(www\.)?instagram\.com\/?@?/, '').replace(/^@/, '')}`
    case 'vk':        return `https://vk.com/${c.replace(/^(https?:\/\/)?(www\.)?vk\.com\//, '').replace(/^@/, '')}`
    case 'tiktok':    return `https://tiktok.com/@${c.replace(/^(https?:\/\/)?(www\.)?tiktok\.com\/?@?/, '').replace(/^@/, '')}`
    case 'youtube':   return c.startsWith('http') ? c : `https://youtube.com/${c}`
    case 'email':     return `mailto:${c}`
    case 'maps':      return c.startsWith('http') ? c : `https://maps.google.com/?q=${encodeURIComponent(c)}`
    default:          return c.startsWith('http') ? c : `https://${c}`
  }
}

// ─── Кнопка соцсети ──────────────────────────────────────────────────────────
function SocialButton({ link }: { link: SocialLink }) {
  const meta = SOCIAL_META[link.type] || { icon: ExternalLink, label: link.label || link.type, bg: 'from-gray-500 to-slate-600' }
  const Icon = meta.icon
  return (
    <a
      href={buildHref(link.type, link.url)}
      target={['phone','email'].includes(link.type) ? '_self' : '_blank'}
      rel="noopener noreferrer"
      className="relative flex items-center w-full px-4 py-3.5 rounded-3xl bg-white/15 border border-white/25 text-white hover:bg-white/25 active:scale-[0.97] transition-all duration-200 shadow-sm backdrop-blur-sm"
    >
      <div className={`absolute left-4 w-9 h-9 rounded-2xl bg-gradient-to-br ${meta.bg} flex items-center justify-center shadow-md`}>
        <Icon size={16} className="text-white" />
      </div>
      <span className="w-full text-center font-semibold text-sm tracking-wide">
        {link.label || meta.label}
      </span>
      <ExternalLink size={12} className="absolute right-4 opacity-35" />
    </a>
  )
}

// ─── Модальное окно "О нас" ───────────────────────────────────────────────────
function AboutModal({ business, onClose }: { business: LinkaLinkWidgetProps['business']; onClose: () => void }) {
  const [photoIdx, setPhotoIdx] = useState(0)

  const gallery: string[] = (() => {
    const g = business.gallery_photos
    if (Array.isArray(g) && g.length > 0) return g
    return []
  })()

  const scheduleEntries = business.schedule
    ? DAY_ORDER.map((day, i) => ({ day, short: DAY_SHORT[i], hours: business.schedule![day] })).filter(e => e.hours)
    : []

  const todayIdx = (new Date().getDay() + 6) % 7 // 0=Пн … 6=Вс

  const formatHours = (h: Schedule) => {
    if (!h) return '–'
    if (h.closed) return 'Вых.'
    return `${h.open.slice(0,5)}–${h.close.slice(0,5)}`
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-[420px] rounded-[40px] overflow-hidden relative text-slate-900 shadow-2xl flex flex-col max-h-[88vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Закрыть */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-black/10 backdrop-blur-xl text-gray-900 rounded-full hover:bg-black/20 z-50 transition"
        >
          <X size={20} />
        </button>

        {/* Карусель фото */}
        {gallery.length > 0 && (
          <div className="relative h-64 w-full shrink-0 bg-black overflow-hidden">
            <img
              src={gallery[photoIdx]}
              alt={`Фото ${photoIdx + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {gallery.length > 1 && (
              <>
                <button
                  onClick={() => setPhotoIdx(i => (i - 1 + gallery.length) % gallery.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition z-10"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setPhotoIdx(i => (i + 1) % gallery.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition z-10"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {gallery.map((_: string, i: number) => (
                    <button key={i} onClick={() => setPhotoIdx(i)}
                      className={`rounded-full transition-all ${i === photoIdx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
                    />
                  ))}
                </div>
                <div className="absolute top-3 right-14 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                  {photoIdx + 1}/{gallery.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Контент */}
        <div className="p-6 overflow-y-auto flex-1" style={{ scrollbarWidth: 'none' }}>
          <h3 className="text-3xl font-black mb-3 uppercase tracking-tighter italic">
            {business.name}
          </h3>

          {business.about_text && (
            <p className="text-gray-500 text-sm mb-6 leading-relaxed font-medium">
              {business.about_text}
            </p>
          )}

          <div className="space-y-6">
            {/* График работы */}
            {scheduleEntries.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 opacity-40">
                  <Clock size={14} />
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em]">График работы</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {scheduleEntries.map(({ day, short, hours }, i) => {
                    const isToday = i === todayIdx
                    return (
                      <div key={day}
                        className={`py-2 rounded-xl border text-center transition-colors ${
                          isToday ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-100'
                        }`}
                      >
                        <div className={`text-[9px] font-bold mb-1 ${isToday ? 'text-white/70' : 'text-gray-400'}`}>
                          {short}
                        </div>
                        <div className={`text-[7.5px] font-black leading-tight ${
                          hours.closed ? 'text-red-400' : isToday ? 'text-white' : 'text-gray-700'
                        }`}>
                          {formatHours(hours)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Адрес — просто текст */}
            {business.about_address && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <MapPin size={20} className="opacity-30 shrink-0" />
                <div>
                  <div className="text-[9px] uppercase text-gray-400 font-bold tracking-widest mb-1">Адрес</div>
                  <div className="text-sm font-bold">{business.about_address}</div>
                </div>
              </div>
            )}

            {/* Яндекс карта — только если включена */}
            {business.show_yandex_map && business.yandex_map_link && (
              <div className="rounded-2xl overflow-hidden border border-gray-100 h-48">
                <iframe
                  src={business.yandex_map_link}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                />
              </div>
            )}

            {/* Кнопка маршрута */}
            {(business.map_link || business.yandex_map_link) && (
              <a
                href={business.map_link || business.yandex_map_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-black text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform uppercase tracking-widest text-sm"
              >
                Построить маршрут
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Главный компонент ────────────────────────────────────────────────────────
export default function LinkaLinkWidget({ business }: LinkaLinkWidgetProps) {
  const [aboutOpen, setAboutOpen] = useState(false)

  const socialLinks: SocialLink[] = business.social_links || []
  const allLinks = [...socialLinks]
  if (business.phone && !allLinks.find(l => l.type === 'phone')) {
    allLinks.unshift({ type: 'phone', url: business.phone, label: 'Позвонить' })
  }

  const hasAbout = !!(
    business.about_text ||
    business.about_address ||
    business.schedule ||
    (Array.isArray(business.gallery_photos) && business.gallery_photos.length > 0)
  )

  return (
    <>
      <div className="flex flex-col gap-2.5 w-full">

        {/* Кнопка О нас */}
        {hasAbout && (
          <button
            onClick={() => setAboutOpen(true)}
            className="relative flex items-center w-full px-4 py-3.5 rounded-3xl bg-white/15 border border-white/25 text-white hover:bg-white/25 active:scale-[0.97] transition-all duration-200 shadow-sm backdrop-blur-sm"
          >
            <div className="absolute left-4 w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
              <Info size={16} className="text-white" />
            </div>
            <span className="w-full text-center font-semibold text-sm tracking-wide">О нас</span>
            <div className="absolute right-4 w-9" />
          </button>
        )}

        {/* Кнопки соцсетей */}
        {allLinks.map((link, i) => (
          <SocialButton key={i} link={link} />
        ))}

      </div>

      {/* Модальное окно */}
      {aboutOpen && (
        <AboutModal business={business} onClose={() => setAboutOpen(false)} />
      )}
    </>
  )
}