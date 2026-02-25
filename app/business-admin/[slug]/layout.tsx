import { createClient } from '@/lib/supabase/server'
import BusinessSidebar from '@/app/business-admin/[slug]/components/BusinessSidebar'

export default async function BusinessAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Страница логина — рендерим без сайдбара
  // (middleware уже пустил нас сюда, layout не делает редиректов)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Нет пользователя — рендерим children (это страница логина)
  if (!user) {
    return <>{children}</>
  }

  // Загружаем данные бизнеса
  const { data: bizUser } = await supabase
    .from('business_users')
    .select('name, business_id, businesses(*)')
    .eq('email', user.email!)
    .single()

  // Нет доступа — рендерим children (страница логина покажет ошибку)
  if (!bizUser) {
    return <>{children}</>
  }

  const business = bizUser.businesses as any

  return (
    <div className="flex h-screen bg-gray-100">
      <BusinessSidebar
        user={user}
        bizUser={bizUser}
        business={business}
        slug={slug}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}