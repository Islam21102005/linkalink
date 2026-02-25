import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ── Публичные маршруты — пропускаем БЕЗ проверок ────────────────────────
  // Страницы логина всегда доступны
  if (
    pathname === '/login' ||
    pathname.endsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Только защищённые зоны проверяем
  const isAdminZone = pathname.startsWith('/admin')
  const isBizAdminZone = pathname.startsWith('/business-admin/')

  if (!isAdminZone && !isBizAdminZone) {
    return NextResponse.next()
  }

  // ── Создаём Supabase клиент ──────────────────────────────────────────────
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // ── Суперадминка /admin/* ────────────────────────────────────────────────
  if (isAdminZone) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Проверка admin_users делается в layout.tsx — не дублируем здесь
    return response
  }

  // ── Бизнес-админка /business-admin/[slug]/* ──────────────────────────────
  if (isBizAdminZone) {
    const parts = pathname.split('/') // ['', 'business-admin', slug, ...]
    const slug = parts[2]

    if (!user) {
      return NextResponse.redirect(new URL(`/business-admin/${slug}/login`, request.url))
    }

    return response
  }

  return response
}

export const config = {
  // Только защищённые зоны — НЕ все маршруты
  matcher: [
    '/admin/:path*',
    '/business-admin/:path*',
  ],
}