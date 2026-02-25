import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'

export default async function BusinessAnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <AnalyticsDashboard page={slug} title="Аналитика" />
}