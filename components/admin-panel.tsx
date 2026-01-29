'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  CalendarEventWithMeta,
  EventCategory,
  WhitelistUser,
  UserPermissions,
  RewardType
} from '@/lib/types'
import {
  createEvent,
  updateEvent,
  deleteEvent,
  createCategory,
  deleteCategory,
  addToWhitelist,
  removeFromWhitelist
} from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Users, Calendar, Tag, Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AdminPanelProps {
  events: CalendarEventWithMeta[]
  categories: EventCategory[]
  whitelist: WhitelistUser[]
  permissions: UserPermissions
}

const DEFAULT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899'
]

const REWARD_TYPES: { value: RewardType; label: string }[] = [
  { value: 'gems', label: 'Gems' },
  { value: 'gold_keys', label: 'Gold Keys' },
  { value: 'silver_keys', label: 'Silver Keys' },
  { value: 'epic_sculptures', label: 'Epic Sculptures' },
  { value: 'legendary_sculptures', label: 'Legendary Sculptures' },
  { value: 'resource_food', label: 'Food' },
  { value: 'resource_wood', label: 'Wood' },
  { value: 'resource_stone', label: 'Stone' },
  { value: 'resource_gold', label: 'Gold (resource)' },
  { value: 'speedup_universal_minutes', label: 'Universal Speedups (min)' },
  { value: 'speedup_building_minutes', label: 'Building Speedups (min)' },
  { value: 'speedup_research_minutes', label: 'Research Speedups (min)' },
  { value: 'speedup_training_minutes', label: 'Training Speedups (min)' },
  { value: 'speedup_healing_minutes', label: 'Healing Speedups (min)' },
]

type RewardRow = { type: RewardType; amount: number }

export function AdminPanel({ events, categories, whitelist, permissions }: AdminPanelProps) {
  const router = useRouter()
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isWhitelistDialogOpen, setIsWhitelistDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEventWithMeta | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // ===== Rewards editor state =====
  const [assumesFull, setAssumesFull] = useState(false)
  const [rewardRows, setRewardRows] = useState<RewardRow[]>([])

  useEffect(() => {
    if (!isEventDialogOpen) return

    // If creating new event, reset rewards editor cleanly
    if (!editingEvent) {
      setAssumesFull(false)
      setRewardRows([])
      return
    }

    const r = editingEvent.rewards
    setAssumesFull(Boolean(r?.assumes_full_completion))
    setRewardRows(
      (r?.items || [])
        .map(it => ({ type: it.type, amount: it.amount }))
        .filter(it => (it.amount ?? 0) > 0)
    )
  }, [isEventDialogOpen, editingEvent])

  const rewardsJson = useMemo(() => {
    const cleaned = rewardRows
      .map(r => ({ ...r, amount: Number(r.amount) || 0 }))
      .filter(r => r.amount > 0)

    return JSON.stringify({
      assumes_full_completion: assumesFull,
      items: cleaned,
    })
  }, [assumesFull, rewardRows])

  const handleEventSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    // ✅ THIS is what you were missing — without this, rewards never save
    formData.set('rewards_json', rewardsJson)

    const result = editingEvent
      ? await updateEvent(editingEvent.id, formData)
      : await createEvent(formData)

    if (result.success) {
      toast({ title: editingEvent ? 'Event updated' : 'Event created' })
      setIsEventDialogOpen(false)
      setEditingEvent(null)
      router.refresh()
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Something went wrong',
        variant: 'destructive'
      })
    }

    setIsLoading(false)
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    const result = await deleteEvent(eventId)
    if (result.success) {
      toast({ title: 'Event deleted' })
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to delete event', variant: 'destructive' })
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    // FIX: convert "none" → empty string so Supabase accepts it
if (formData.get('category_id') === 'none') {
  formData.set('category_id', '')
}

    const result = await createCategory(formData)

    if (result.success) {
      toast({ title: 'Category created' })
      setIsCategoryDialogOpen(false)
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error || 'Something went wrong', variant: 'destructive' })
    }

    setIsLoading(false)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure? Events using this category will lose their category.')) return

    const result = await deleteCategory(categoryId)
    if (result.success) {
      toast({ title: 'Category deleted' })
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to delete category', variant: 'destructive' })
    }
  }

  const handleWhitelistSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await addToWhitelist(formData)

    if (result.success) {
      toast({ title: 'User added to whitelist' })
      setIsWhitelistDialogOpen(false)
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error || 'Something went wrong', variant: 'destructive' })
    }

    setIsLoading(false)
  }

  const handleRemoveFromWhitelist = async (whitelistId: string) => {
    if (!confirm('Are you sure you want to remove this user from the whitelist?')) return

    const result = await removeFromWhitelist(whitelistId)
    if (result.success) {
      toast({ title: 'User removed from whitelist' })
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to remove user', variant: 'destructive' })
    }
  }

  const openCreateDialog = () => {
    setEditingEvent(null)
    setIsEventDialogOpen(true)
  }

  const openEditDialog = (event: CalendarEventWithMeta) => {
    setEditingEvent(event)
    setIsEventDialogOpen(true)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Panel
        </CardTitle>
        <CardDescription>
          Manage events, categories, rewards, and user permissions
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categories
            </TabsTrigger>
            {permissions.isAdmin && (
              <TabsTrigger value="whitelist" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Whitelist
              </TabsTrigger>
            )}
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{events.length} events</p>

              <Dialog
                open={isEventDialogOpen}
                onOpenChange={(open) => {
                  setIsEventDialogOpen(open)
                  if (!open) setEditingEvent(null)
                }}
              >
                <DialogTrigger asChild>
                  <Button size="sm" onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                    <DialogDescription>
                      {editingEvent ? 'Update event details' : 'Create a new event for the calendar'}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleEventSubmit} className="space-y-4">
                    {/* Hidden rewards payload (server reads rewards_json) */}
                    <input type="hidden" name="rewards_json" value={rewardsJson} />

                    <div className="space-y-2">
                      <Label htmlFor="name">Event Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., Mightiest Governor"
                        defaultValue={editingEvent?.name || ''}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_day">Start Day</Label>
                        <Input
                          id="start_day"
                          name="start_day"
                          type="number"
                          min={1}
                          max={130}
                          placeholder="1"
                          defaultValue={editingEvent?.start_day || ''}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_day">End Day</Label>
                        <Input
                          id="end_day"
                          name="end_day"
                          type="number"
                          min={1}
                          max={130}
                          placeholder="7"
                          defaultValue={editingEvent?.end_day || ''}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category_id">Category</Label>
                      <Select
  name="category_id"
  defaultValue={editingEvent?.category_id ?? 'none'}
>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No category</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: cat.color }}
                                />
                                {cat.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Event details..."
                        defaultValue={editingEvent?.description || ''}
                      />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <Label>Event Tags</Label>
                      <div className="flex flex-col gap-1 text-sm">
                        {(['TRAINING_POINTS', 'BUILDING_POINTS', 'RESEARCH_POINTS'] as const).map(t => (
                          <label key={t} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              name="tags"
                              value={t}
                              defaultChecked={Boolean(editingEvent?.tags?.includes(t))}
                            />
                            {t === 'TRAINING_POINTS'
                              ? 'Training (MGE / Troops / Power)'
                              : t === 'BUILDING_POINTS'
                                ? 'Building'
                                : 'Research'}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Rewards */}
                    <div className="space-y-2">
                      <Label>Rewards</Label>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={assumesFull}
                          onChange={(e) => setAssumesFull(e.target.checked)}
                        />
                        Assumes full completion
                      </label>

                      <div className="space-y-2">
                        {rewardRows.map((row, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="flex-1">
                              <select
                                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
                                value={row.type}
                                onChange={(e) => {
                                  const v = e.target.value as RewardType
                                  setRewardRows(prev => prev.map((r, i) => i === idx ? { ...r, type: v } : r))
                                }}
                              >
                                {REWARD_TYPES.map(rt => (
                                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                                ))}
                              </select>
                            </div>

                            <Input
                              className="w-28"
                              type="number"
                              min={0}
                              value={row.amount}
                              onChange={(e) => {
                                const amt = Number(e.target.value)
                                setRewardRows(prev => prev.map((r, i) => i === idx ? { ...r, amount: amt } : r))
                              }}
                            />

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setRewardRows(prev => prev.filter((_, i) => i !== idx))}
                              title="Remove reward"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setRewardRows(prev => [...prev, { type: 'gems', amount: 0 }])}
                      >
                        + Add reward
                      </Button>

                      <p className="text-xs text-muted-foreground">
                        Rewards are saved on the event and included in Rewards Summary when you select events on the timeline.
                      </p>
                    </div>

                    <DialogFooter>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : editingEvent ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No events yet. Add your first event!</p>
              ) : (
                events.map(event => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {event.category && (
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: event.category.color }}
                        />
                      )}
                      <div>
                        <p className="font-medium text-sm">{event.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Days {event.start_day} - {event.end_day}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(event)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{categories.length} categories</p>
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>Create a category to organize events</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">Category Name</Label>
                      <Input id="cat-name" name="name" placeholder="e.g., Training Events" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {DEFAULT_COLORS.map(color => (
                          <label key={color} className="cursor-pointer">
                            <input type="radio" name="color" value={color} className="sr-only peer" required />
                            <span
                              className="block w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-foreground peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-offset-background transition-all"
                              style={{ backgroundColor: color }}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No categories yet. Add your first category!</p>
              ) : (
                categories.map(category => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                      <span className="font-medium text-sm">{category.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Whitelist Tab */}
          {permissions.isAdmin && (
            <TabsContent value="whitelist" className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">{whitelist.length} whitelisted users</p>
                <Dialog open={isWhitelistDialogOpen} onOpenChange={setIsWhitelistDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add User to Whitelist</DialogTitle>
                      <DialogDescription>Grant edit permissions to a user</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleWhitelistSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-email">User Email</Label>
                        <Input id="user-email" name="email" type="email" placeholder="user@example.com" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="user-role">Role</Label>
                        <Select name="role" defaultValue="editor">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="editor">Editor - Can add/edit events</SelectItem>
                            <SelectItem value="admin">Admin - Full access</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Adding...' : 'Add User'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {whitelist.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No whitelisted users yet.</p>
                ) : (
                  whitelist.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-sm">{user.email}</p>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveFromWhitelist(user.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}

