import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BusinessEditorForOwner from './BusinessEditorForOwner'

export default async function BusinessSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!business) notFound()

  const [servicesRes, mastersRes, addonsRes] = await Promise.all([
    supabase.from('services').select('*').eq('business_id', business.id).order('sort_order'),
    supabase.from('masters').select('*').eq('business_id', business.id).order('sort_order'),
    supabase.from('addons').select('*').eq('business_id', business.id).order('sort_order'),
  ])

  return (
    <BusinessEditorForOwner
      business={business}
      services={servicesRes.data || []}
      masters={mastersRes.data || []}
      addons={addonsRes.data || []}
      returnUrl={`/business-admin/${slug}`}
    />
  )
}