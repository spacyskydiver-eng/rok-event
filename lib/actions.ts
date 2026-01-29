'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  CalendarEventWithMeta,
  EventCategory,
  WhitelistUser,
  UserPermissions,
  Bundle,
  BundleWithDetails,
  BundleTier,
  BundleTierColumn,
  BundleTierCell
} from '@/lib/types'

/* =========================
   AUTH / PERMISSIONS
========================= */

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

/* =========================
   EVENTS
========================= */

export async function getEvents(): Promise<CalendarEventWithMeta[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_day')

  if (error) {
    console.error('getEvents:', error)
    return []
  }

  return (data ?? []).map(e => ({
    ...e,
    tags: Array.isArray((e as any).tags) ? (e as any).tags : [],
    rewards: (e as any).rewards ?? null
  }))
}

export async function createEvent(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const name = formData.get('name') as string
    const start_day = Number(formData.get('start_day'))
    const end_day = Number(formData.get('end_day'))

    const rawCategoryId = formData.get('category_id') as string | null
    const category_id = rawCategoryId === 'none' ? null : rawCategoryId

    const description = formData.get('description') as string | null
    const tags = formData.getAll('tags') as string[]

    const rewardsJson = formData.get('rewards_json') as string | null
    const rewards = rewardsJson ? JSON.parse(rewardsJson) : null

    if (!name || !start_day || !end_day) {
      return { success: false, error: 'Missing required fields' }
    }

    const { error } = await supabase.from('events').insert({
      name,
      start_day,
      end_day,
      category_id,
      description,
      tags: tags.length ? tags : null,
      rewards,
      created_by: user.id
    })

    if (error) {
      console.error('createEvent:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error('createEvent crash:', err)
    return { success: false, error: 'Unexpected server error' }
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const name = formData.get('name') as string
    const start_day = Number(formData.get('start_day'))
    const end_day = Number(formData.get('end_day'))

    const rawCategoryId = formData.get('category_id') as string | null
    const category_id = rawCategoryId === 'none' ? null : rawCategoryId

    const description = formData.get('description') as string | null
    const tags = formData.getAll('tags') as string[]

    const rewardsJson = formData.get('rewards_json') as string | null
    const rewards = rewardsJson ? JSON.parse(rewardsJson) : null

    if (!name || !start_day || !end_day) {
      return { success: false, error: 'Missing required fields' }
    }

    const { error } = await supabase
      .from('events')
      .update({
        name,
        start_day,
        end_day,
        category_id,
        description,
        tags: tags.length ? tags : null,
        rewards,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)

    if (error) {
      console.error('updateEvent:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
  } catch (err) {
    console.error('updateEvent crash:', err)
    return { success: false, error: 'Unexpected server error' }
  }
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('events').delete().eq('id', eventId)
  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  return { success: true }
}

/* =========================
   CATEGORIES
========================= */

export async function getCategories(): Promise<EventCategory[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('event_categories').select('*').order('name')
  return data ?? []
}

/* =========================
   WHITELIST
========================= */

export async function getWhitelist(): Promise<WhitelistUser[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('whitelist').select('*')
  return data ?? []
}

/* =========================
   BUNDLES
========================= */

export async function getBundles(): Promise<Bundle[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('bundles').select('*').order('start_day')
  return data ?? []
}

export async function getBundleWithDetails(bundleId: string): Promise<BundleWithDetails | null> {
  const supabase = await createClient()

  const { data: bundle } = await supabase
    .from('bundles')
    .select('*')
    .eq('id', bundleId)
    .single()

  if (!bundle) return null

  const [tiers, columns, cells] = await Promise.all([
    supabase.from('bundle_tiers').select('*').eq('bundle_id', bundleId),
    supabase.from('bundle_tier_columns').select('*').eq('bundle_id', bundleId),
    supabase.from('bundle_tier_cells').select('*')
  ])

  return {
    ...bundle,
    tiers: tiers.data ?? [],
    columns: columns.data ?? [],
    cells: cells.data ?? []
  }
}

/* =========================
   KINGDOM SETTINGS
========================= */

export async function getKingdomSettings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_kingdom_settings')
    .select('kingdom_start_date, monument_day')
    .eq('user_id', user.id)
    .maybeSingle()

  return data ?? { kingdom_start_date: null, monument_day: null }
}

export async function saveKingdomSettings(input: {
  kingdom_start_date: string | null
  monument_day: number | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { error } = await supabase.from('user_kingdom_settings').upsert({
    user_id: user.id,
    ...input,
    updated_at: new Date().toISOString()
  })

  if (error) throw error
}

// Bundle Column Management
export async function addBundleColumn(
  bundleId: string,
  name: string
): Promise<{ success: boolean; error?: string; column?: BundleTierColumn }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('bundle_tier_columns')
    .select('sort_order')
    .eq('bundle_id', bundleId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from('bundle_tier_columns')
    .insert({
      bundle_id: bundleId,
      name,
      sort_order: sortOrder,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/')
  return { success: true, column: data }
}

export async function updateBundleColumn(
  columnId: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('bundle_tier_columns')
    .update({ name })
    .eq('id', columnId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/')
  return { success: true }
}

export async function deleteBundleColumn(
  columnId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('bundle_tier_columns')
    .delete()
    .eq('id', columnId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/')
  return { success: true }
}


