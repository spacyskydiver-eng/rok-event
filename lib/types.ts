export interface EventCategory {
  id: string
  name: string
  color: string
  created_at: string
}

export interface CalendarEvent {
  id: string
  name: string
  start_day: number
  end_day: number
  category_id: string | null
  description: string | null
  created_by: string
  created_at: string
  updated_at: string
  category?: EventCategory
}

export interface WhitelistUser {
  id: string
  user_id: string
  email: string
  role: 'admin' | 'editor'
  added_by: string
  created_at: string
}

export interface UserPermissions {
  isAuthenticated: boolean
  isAdmin: boolean
  isEditor: boolean
  canEdit: boolean
}

export interface Bundle {
  id: string
  name: string
  description: string | null
  image_url: string | null
  start_day: number
  end_day: number
  show_on_calendar: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface BundleTier {
  id: string
  bundle_id: string
  name: string
  price: string | null
  sort_order: number
  created_at: string
}

export interface BundleTierColumn {
  id: string
  bundle_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface BundleTierCell {
  id: string
  tier_id: string
  column_id: string
  value: string
  created_at: string
}

export interface BundleWithDetails extends Bundle {
  tiers: BundleTier[]
  columns: BundleTierColumn[]
  cells: BundleTierCell[]
}

export type CalendarItem = {
  id: string
  name: string
  start_day: number
  end_day: number
  type: 'event' | 'bundle'
  color: string
  description?: string | null
}

