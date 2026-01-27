'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'
import type { CalendarEvent, EventCategory, WhitelistUser, UserPermissions, Bundle, BundleWithDetails, BundleTier, BundleTierColumn, BundleTierCell } from '@/lib/types'

export async function getUserPermissions(): Promise<UserPermissions> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { isAuthenticated: false, isAdmin: false, isEditor: false, canEdit: false }
  }

  const { data: whitelistEntry } = await supabase
    .from('whitelist')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const isAdmin = whitelistEntry?.role === 'admin'
  const isEditor = whitelistEntry?.role === 'editor'

  return {
    isAuthenticated: true,
    isAdmin,
    isEditor,
    canEdit: isAdmin || isEditor
  }
}

export async function getEvents(): Promise<CalendarEvent[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_day', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }

  return data || []
}

export async function getCategories(): Promise<EventCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('event_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

export async function createEvent(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const startDay = parseInt(formData.get('start_day') as string)
  const endDay = parseInt(formData.get('end_day') as string)
  const categoryId = formData.get('category_id') as string | null
  const description = formData.get('description') as string | null

  if (!name || !startDay || !endDay) {
    return { success: false, error: 'Missing required fields' }
  }

  if (startDay < 1 || endDay > 130 || startDay > endDay) {
    return { success: false, error: 'Invalid day range (must be 1-130)' }
  }

  const { error } = await supabase.from('events').insert({
    name,
    start_day: startDay,
    end_day: endDay,
    category_id: categoryId || null,
    description: description || null,
    created_by: user.id
  })

  if (error) {
    console.error('Error creating event:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('events', 'max')
  return { success: true }
}

export async function updateEvent(eventId: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const startDay = parseInt(formData.get('start_day') as string)
  const endDay = parseInt(formData.get('end_day') as string)
  const categoryId = formData.get('category_id') as string | null
  const description = formData.get('description') as string | null

  if (!name || !startDay || !endDay) {
    return { success: false, error: 'Missing required fields' }
  }

  if (startDay < 1 || endDay > 130 || startDay > endDay) {
    return { success: false, error: 'Invalid day range (must be 1-130)' }
  }

  const { error } = await supabase
    .from('events')
    .update({
      name,
      start_day: startDay,
      end_day: endDay,
      category_id: categoryId || null,
      description: description || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', eventId)

  if (error) {
    console.error('Error updating event:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('events', 'max')
  return { success: true }
}

export async function deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) {
    console.error('Error deleting event:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('events', 'max')
  return { success: true }
}

export async function createCategory(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const color = formData.get('color') as string

  if (!name || !color) {
    return { success: false, error: 'Missing required fields' }
  }

  const { error } = await supabase.from('event_categories').insert({
    name,
    color
  })

  if (error) {
    console.error('Error creating category:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('categories', 'max')
  return { success: true }
}

export async function deleteCategory(categoryId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('event_categories')
    .delete()
    .eq('id', categoryId)

  if (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('categories', 'max')
  return { success: true }
}

export async function getWhitelist(): Promise<WhitelistUser[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('whitelist')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching whitelist:', error)
    return []
  }

  return data || []
}

export async function addToWhitelist(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const email = formData.get('email') as string
  const role = formData.get('role') as 'admin' | 'editor'

  if (!email || !role) {
    return { success: false, error: 'Missing required fields' }
  }

  // Look up user by email from auth.users via admin API or store email directly
  // For now, we'll add with email and update user_id when they sign in
  const { error } = await supabase.from('whitelist').insert({
    email,
    role,
    user_id: user.id, // Placeholder - will be updated when user signs in
    added_by: user.id
  })

  if (error) {
    console.error('Error adding to whitelist:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('whitelist', 'max')
  return { success: true }
}

export async function removeFromWhitelist(whitelistId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('whitelist')
    .delete()
    .eq('id', whitelistId)

  if (error) {
    console.error('Error removing from whitelist:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('whitelist', 'max')
  return { success: true }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

// Bundle Actions
export async function getBundles(): Promise<Bundle[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bundles')
    .select('*')
    .order('start_day', { ascending: true })

  if (error) {
    console.error('Error fetching bundles:', error)
    return []
  }

  return data || []
}

export async function getBundleWithDetails(bundleId: string): Promise<BundleWithDetails | null> {
  const supabase = await createClient()
  
  const { data: bundle, error: bundleError } = await supabase
    .from('bundles')
    .select('*')
    .eq('id', bundleId)
    .single()

  if (bundleError || !bundle) {
    console.error('Error fetching bundle:', bundleError)
    return null
  }

  const [tiersResult, columnsResult, cellsResult] = await Promise.all([
    supabase.from('bundle_tiers').select('*').eq('bundle_id', bundleId).order('sort_order'),
    supabase.from('bundle_tier_columns').select('*').eq('bundle_id', bundleId).order('sort_order'),
    supabase.from('bundle_tier_cells').select('*').in('tier_id', 
      (await supabase.from('bundle_tiers').select('id').eq('bundle_id', bundleId)).data?.map(t => t.id) || []
    )
  ])

  return {
    ...bundle,
    tiers: tiersResult.data || [],
    columns: columnsResult.data || [],
    cells: cellsResult.data || []
  }
}

export async function createBundle(formData: FormData): Promise<{ success: boolean; error?: string; bundleId?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const imageUrl = formData.get('image_url') as string | null
  const startDay = parseInt(formData.get('start_day') as string)
  const endDay = parseInt(formData.get('end_day') as string)
  const showOnCalendar = formData.get('show_on_calendar') === 'true'

  if (!name || !startDay || !endDay) {
    return { success: false, error: 'Missing required fields' }
  }

  if (startDay < 1 || endDay > 130 || startDay > endDay) {
    return { success: false, error: 'Invalid day range (must be 1-130)' }
  }

  const { data, error } = await supabase.from('bundles').insert({
    name,
    description: description || null,
    image_url: imageUrl || null,
    start_day: startDay,
    end_day: endDay,
    show_on_calendar: showOnCalendar,
    created_by: user.id
  }).select('id').single()

  if (error) {
    console.error('Error creating bundle:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('bundles', 'max')
  return { success: true, bundleId: data.id }
}

export async function updateBundle(bundleId: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string | null
  const imageUrl = formData.get('image_url') as string | null
  const startDay = parseInt(formData.get('start_day') as string)
  const endDay = parseInt(formData.get('end_day') as string)
  const showOnCalendar = formData.get('show_on_calendar') === 'true'

  if (!name || !startDay || !endDay) {
    return { success: false, error: 'Missing required fields' }
  }

  const { error } = await supabase
    .from('bundles')
    .update({
      name,
      description: description || null,
      image_url: imageUrl || null,
      start_day: startDay,
      end_day: endDay,
      show_on_calendar: showOnCalendar,
      updated_at: new Date().toISOString()
    })
    .eq('id', bundleId)

  if (error) {
    console.error('Error updating bundle:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('bundles', 'max')
  return { success: true }
}

export async function deleteBundle(bundleId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('bundles')
    .delete()
    .eq('id', bundleId)

  if (error) {
    console.error('Error deleting bundle:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('bundles', 'max')
  return { success: true }
}

// Bundle Tier Management
export async function addBundleTier(bundleId: string, name: string, price: string | null): Promise<{ success: boolean; error?: string; tier?: BundleTier }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get max sort order
  const { data: existingTiers } = await supabase
    .from('bundle_tiers')
    .select('sort_order')
    .eq('bundle_id', bundleId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const sortOrder = (existingTiers?.[0]?.sort_order ?? -1) + 1

  const { data, error } = await supabase.from('bundle_tiers').insert({
    bundle_id: bundleId,
    name,
    price,
    sort_order: sortOrder
  }).select().single()

  if (error) {
    console.error('Error adding bundle tier:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('bundles', 'max')
  return { success: true, tier: data }
}

export async function updateBundleTier(tierId: string, name: string, price: string | null): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('bundle_tiers')
    .update({ name, price })
    .eq('id', tierId)

  if (error) {
    console.error('Error updating bundle tier:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('bundles', 'max')
  return { success: true }
}

export async function deleteBundleTier(tierId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('bundle_tiers')
    .delete()
    .eq('id', tierId)

  if (error) {
    console.error('Error deleting bundle tier:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('bundles', 'max')
  return { success: true }
}

// Bundle Column Management
export async function addBundleColumn(bundleId: string, name: string): Promise<{ success: boolean; error?: string; column?: BundleTierColumn }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get max sort order
  const { data: existingColumns } = await supabase
    .from('bundle_tier_columns')
    .select('sort_order')
    .eq('bundle_id', bundleId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const sortOrder = (existingColumns?.[0]?.sort_order ?? -1) + 1

  const { data, error } = await supabase.from('bundle_tier_columns').insert({
    bundle_id: bundleId,
    name,
    sort_order: sortOrder
  }).select().single()

  if (error) {
    console.error('Error adding bundle column:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('bundles', 'max')
  return { success: true, column: data }
}

export async function updateBundleColumn(columnId: string, name: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('bundle_tier_columns')
    .update({ name })
    .eq('id', columnId)

  if (error) {
    console.error('Error updating bundle column:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('bundles', 'max')
  return { success: true }
}

export async function deleteBundleColumn(columnId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('bundle_tier_columns')
    .delete()
    .eq('id', columnId)

  if (error) {
    console.error('Error deleting bundle column:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('bundles', 'max')
  return { success: true }
}

// Bundle Cell Management
export async function updateBundleCell(tierId: string, columnId: string, value: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  // Upsert the cell value
  const { error } = await supabase
    .from('bundle_tier_cells')
    .upsert({
      tier_id: tierId,
      column_id: columnId,
      value
    }, {
      onConflict: 'tier_id,column_id'
    })

  if (error) {
    console.error('Error updating bundle cell:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('bundles', 'max')
  return { success: true }
}

// ===== Kingdom Settings (per-user) =====


export async function getKingdomSettings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("user_kingdom_settings")
    .select("kingdom_start_date, monument_day")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) throw error
  return data ?? { kingdom_start_date: null, monument_day: null }
}

export async function saveKingdomSettings(input: {
  kingdom_start_date: string | null // YYYY-MM-DD
  monument_day: number | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not signed in")

  const { error } = await supabase
    .from("user_kingdom_settings")
    .upsert({
      user_id: user.id,
      kingdom_start_date: input.kingdom_start_date,
      monument_day: input.monument_day,
      updated_at: new Date().toISOString(),
    })

  if (error) throw error
}

