export interface EventCategory {
  id: string
  name: string
  color: string
  created_at: string
}

export type EventTag =
  | 'TRAINING_POINTS'
  | 'BUILDING_POINTS'
  | 'RESEARCH_POINTS'
  | 'GATHERING_POINTS'
  | 'BARBARIAN_KILLS'
  | 'SPEEDUP_USAGE'
  | 'GEM_SPENDING'

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
  tags?: EventTag[]
}

export interface CalendarEventWithMeta extends CalendarEvent {
  rewards?: EventRewards
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

export type RewardType =
  | 'speedup_universal_minutes'
  | 'speedup_building_minutes'
  | 'speedup_research_minutes'
  | 'speedup_training_minutes'
  | 'speedup_healing_minutes'
  | 'resource_food'
  | 'resource_wood'
  | 'resource_stone'
  | 'resource_gold'
  | 'gems'
  | 'gold_keys'
  | 'silver_keys'
  | 'epic_sculptures'
  | 'legendary_sculptures'

export interface EventRewardItem {
  type: RewardType
  amount: number
}

export interface EventRewards {
  items: EventRewardItem[]
  assumes_full_completion: boolean
}

export interface CalendarEventWithMeta extends CalendarEvent {
  rewards?: EventRewards
  // tags already exist on CalendarEvent, but keeping optional here is harmless
  tags?: EventTag[]
}