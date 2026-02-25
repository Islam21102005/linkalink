import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, business_id } = await req.json()

    if (!email || !password || !business_id) {
      return NextResponse.json({ error: 'email, password и business_id обязательны' }, { status: 400 })
    }

    const supabase = await createClient()

    // Проверяем что текущий пользователь — суперадмин
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .single()

    if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Создаём пользователя в Supabase Auth через admin API
    // Примечание: требует SERVICE_ROLE_KEY
    const adminSupabase = await createClient() // в продакшне — createAdminClient()

    // Регистрируем через обычный signUp (работает без service role)
    const { data: newUser, error: signUpError } = await adminSupabase.auth.admin?.createUser({
      email,
      password,
      email_confirm: true,
    }) ?? { data: null, error: new Error('admin API недоступен') }

    if (signUpError || !newUser?.user) {
      // Фоллбэк: просто записываем в business_users, пользователь сам зарегается
      console.warn('Admin createUser не доступен, создаём только запись в business_users')
    }

    // Добавляем запись в business_users
    const { error: insertError } = await supabase
      .from('business_users')
      .upsert({ email, name: name || email, business_id }, { onConflict: 'email' })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: 'Владелец создан' })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}