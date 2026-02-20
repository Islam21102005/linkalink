import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BusinessEditor from './BusinessEditor'

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single()

  if (!business) notFound()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', id)
    .order('sort_order')

  const { data: masters } = await supabase
    .from('masters')
    .select('*')
    .eq('business_id', id)
    .order('sort_order')

  const { data: addons } = await supabase
    .from('addons')
    .select('*')
    .eq('business_id', id)
    .order('sort_order')

  return (
    <BusinessEditor
      business={business}
      services={services || []}
      masters={masters || []}
      addons={addons || []}
    />
  )
}