import { notFound } from 'next/navigation'
import { getBundleWithDetails, getUserPermissions } from '@/lib/actions'
import { BundleDetailView } from '@/components/bundle-detail-view'

interface BundlePageProps {
  params: Promise<{ id: string }>
}

export default async function BundlePage({ params }: BundlePageProps) {
  const { id } = await params
  const [bundle, permissions] = await Promise.all([
    getBundleWithDetails(id),
    getUserPermissions()
  ])

  if (!bundle) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <BundleDetailView bundle={bundle} canEdit={permissions.canEdit} />
    </main>
  )
}
