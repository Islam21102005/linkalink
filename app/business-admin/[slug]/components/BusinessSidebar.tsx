'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Calendar, BarChart2, Megaphone, Tag, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function BusinessSidebar({ user, bizUser, business, slug }: {
  user: any; bizUser: any; business: any; slug: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push(`/business-admin/${slug}/login`)
    router.refresh()
  }

  const base = `/business-admin/${slug}`

  const links = [
    { href: base,                 label: 'Главная',   icon: LayoutDashboard },
    { href: `${base}/bookings`,   label: 'Записи',    icon: Calendar },
    { href: `${base}/analytics`,  label: 'Аналитика', icon: BarChart2 },
    { href: `${base}/promotions`, label: 'Акции',     icon: Tag },
    { href: `${base}/broadcasts`, label: 'Рассылки',  icon: Megaphone },
  ]

  const avatarUrl = business?.logo_url || business?.avatar_url
  const initial = (business?.name?.[0] || slug[0]).toUpperCase()
  const isActive = (href: string) => href === base ? pathname === base : pathname.startsWith(href)

  return (
    <div className="w-60 bg-gray-900 text-white flex flex-col">
      {/* Бизнес */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt={business?.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-white text-sm truncate">{business?.name}</p>
            <a href={`/${slug}`} target="_blank"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              /{slug} ↗
            </a>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium ${
              isActive(href)
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Пользователь */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {user.email?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">{bizUser?.name || user.email}</p>
            <p className="text-xs text-gray-500">Администратор</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm">
          <LogOut size={16} /> Выйти
        </button>
      </div>
    </div>
  )
}