'use client'

import React, { useEffect, useState } from 'react'
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

export function AdminPanel({ events, categories, whitelist, permissions }: AdminPanelProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isWhitelistDialogOpen, setIsWhitelistDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEventWithMeta | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleEventSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      const result = editingEvent
        ? await updateEvent(editingEvent.id, formData)
        : await createEvent(formData)

      if (!result.success) {
        throw new Error(result.error || 'Failed to save event')
      }

      toast({ title: editingEvent ? 'Event updated' : 'Event created' })
      setIsEventDialogOpen(false)
      setEditingEvent(null)
      router.refresh()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Something went wrong',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
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

    const result = await createCategory(new FormData(e.currentTarget))
    if (result.success) {
      toast({ title: 'Category created' })
      setIsCategoryDialogOpen(false)
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error || 'Something went wrong', variant: 'destructive' })
    }

    setIsLoading(false)
  }

  const handleWhitelistSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const result = await addToWhitelist(new FormData(e.currentTarget))
    if (result.success) {
      toast({ title: 'User added to whitelist' })
      setIsWhitelistDialogOpen(false)
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error || 'Something went wrong', variant: 'destructive' })
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Panel
        </CardTitle>
        <CardDescription>Manage events, categories, and users</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="events">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events"><Calendar className="h-4 w-4 mr-1" /> Events</TabsTrigger>
            <TabsTrigger value="categories"><Tag className="h-4 w-4 mr-1" /> Categories</TabsTrigger>
            {permissions.isAdmin && (
              <TabsTrigger value="whitelist"><Users className="h-4 w-4 mr-1" /> Whitelist</TabsTrigger>
            )}
          </TabsList>

          {/* EVENTS */}
          <TabsContent value="events" className="mt-4">
            <div className="flex justify-between mb-4">
              <p className="text-sm text-muted-foreground">{events.length} events</p>
              <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Event</Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleEventSubmit} className="space-y-4">
                    <Input name="name" placeholder="Event name" defaultValue={editingEvent?.name || ''} required />
                    <div className="grid grid-cols-2 gap-2">
                      <Input name="start_day" type="number" min={1} max={130} defaultValue={editingEvent?.start_day} required />
                      <Input name="end_day" type="number" min={1} max={130} defaultValue={editingEvent?.end_day} required />
                    </div>
                    <Textarea name="description" placeholder="Description" defaultValue={editingEvent?.description || ''} />
                    <DialogFooter>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving…' : 'Save'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {events.map(e => (
              <div key={e.id} className="flex justify-between p-2 bg-muted rounded mb-2">
                <span>{e.name}</span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => { setEditingEvent(e); setIsEventDialogOpen(true) }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDeleteEvent(e.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* CATEGORIES */}
          <TabsContent value="categories" className="mt-4">
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Category</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <Input name="name" placeholder="Category name" required />
                  <div className="flex gap-2 flex-wrap">
                    {DEFAULT_COLORS.map(c => (
                      <label key={c}>
                        <input type="radio" name="color" value={c} className="sr-only peer" required />
                        <span className="w-6 h-6 rounded-full inline-block peer-checked:ring-2" style={{ backgroundColor: c }} />
                      </label>
                    ))}
                  </div>
                  <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* WHITELIST */}
          {permissions.isAdmin && (
            <TabsContent value="whitelist" className="mt-4">
              <Dialog open={isWhitelistDialogOpen} onOpenChange={setIsWhitelistDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add User</Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleWhitelistSubmit} className="space-y-4">
                    <Input name="email" type="email" placeholder="Email" required />
                    <Select name="role" defaultValue="editor">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <DialogFooter><Button type="submit">Add</Button></DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {whitelist.map(w => (
                <div key={w.id} className="flex justify-between p-2 bg-muted rounded mt-2">
                  <span>{w.email}</span>
                  <Badge>{w.role}</Badge>
                </div>
              ))}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}

