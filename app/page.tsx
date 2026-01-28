import { createClient } from '@/lib/supabase/server'
import { getEvents, getCategories, getWhitelist, getUserPermissions, getBundles } from '@/lib/actions'
import { Header } from '@/components/header'
import { CalendarTimeline } from '@/components/calendar-timeline'
import { AdminPanel } from '@/components/admin-panel'
import { BundleManager } from '@/components/bundle-manager'
import { getKingdomSettings } from '@/lib/actions'


export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
const [
  events,
  categories,
  whitelist,
  permissions,
  bundles,
  kingdomSettings,
] = await Promise.all([
  getEvents(),
  getCategories(),
  getWhitelist(),
  getUserPermissions(),
  getBundles(),
  getKingdomSettings(),
])

  return (
    <div className="min-h-screen bg-background">
      <Header permissions={permissions} userEmail={user?.email} />
      
      <main className="container mx-auto px-6 py-6 space-y-6">
        {/* Welcome Section */}
        <section className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Kingdom Event Timeline</h2>
          <p className="text-muted-foreground">
            Track all Rise of Kingdoms events from day 1 to day 130. Use filters to show specific event categories.
          </p>
        </section>

{/* TFN Advert */}
<section className="px-6">
  <div className="rounded-xl border border-border bg-card p-6">
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <p className="text-xs font-semibold text-muted-foreground">Sponsored</p>
        <h3 className="text-lg font-bold">TFN Community</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Join TFN for Rise of Kingdoms guides, KvK prep, jump projects, and daily help.
        </p>
      </div>

      <a
        href="https://discord.gg/YOUR_LINK"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 transition text-white"
      >
        Join Discord
      </a>
    </div>
  </div>
</section>

{/* Calendar Timeline */}
<div className="px-6">
  <CalendarTimeline
    events={events}
    categories={categories}
    bundles={bundles.filter(b => b.show_on_calendar)}
    
  />
</div>

        {/* Shop Bundles Section */}
        <section className="pt-6 border-t border-border">
          <BundleManager bundles={bundles} canEdit={permissions.canEdit} />
        </section>

        {/* Admin Panel - Only visible to editors and admins */}
        {permissions.canEdit && (
          <section className="pt-6 border-t border-border">
            <AdminPanel
              events={events}
              categories={categories}
              whitelist={whitelist}
              permissions={permissions}
            />
          </section>
        )}

        {/* Info for non-editors */}
        {!permissions.canEdit && (
          <section className="pt-6 border-t border-border">
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                {permissions.isAuthenticated 
                  ? "TEST. Contact an admin to get edit permissions."
                  : "Sign in to get edit access (if whitelisted by an admin)."}
              </p>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Rise of Kingdoms Kingdom Calendar - Track your kingdom's journey from day 1 to 130</p>
        </div>
      </footer>
    </div>
  )
}
