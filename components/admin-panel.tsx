'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CalendarEvent, EventCategory, WhitelistUser, UserPermissions } from '@/lib/types'
import { createEvent, updateEvent, deleteEvent, createCategory, deleteCategory, addToWhitelist, removeFromWhitelist } from '@/lib/actions'
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
  events: CalendarEvent[]
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
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isWhitelistDialogOpen, setIsWhitelistDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleEventSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = editingEvent 
      ? await updateEvent(editingEvent.id, formData)
      : await createEvent(formData)

    if (result.success) {
      toast({ title: editingEvent ? 'Event updated' : 'Event created' })
      setIsEventDialogOpen(false)
      setEditingEvent(null)
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error || 'Something went wrong', variant: 'destructive' })
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

  const openEditDialog = (event: CalendarEvent) => {
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
          Manage events, categories, and user permissions
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
              <Dialog open={isEventDialogOpen} onOpenChange={(open) => {
                setIsEventDialogOpen(open)
                if (!open) setEditingEvent(null)
              }}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                    <DialogDescription>
                      {editingEvent ? 'Update event details' : 'Create a new event for the calendar'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEventSubmit} className="space-y-4">
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
                      <Select name="category_id" defaultValue={editingEvent?.category_id || 'none'}>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(event)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
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
                    <DialogDescription>
                      Create a category to organize events
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">Category Name</Label>
                      <Input
                        id="cat-name"
                        name="name"
                        placeholder="e.g., Training Events"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {DEFAULT_COLORS.map(color => (
                          <label key={color} className="cursor-pointer">
                            <input
                              type="radio"
                              name="color"
                              value={color}
                              className="sr-only peer"
                              required
                            />
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
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-sm">{category.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Whitelist Tab - Admin Only */}
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
                      <DialogDescription>
                        Grant edit permissions to a user
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleWhitelistSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-email">User Email</Label>
                        <Input
                          id="user-email"
                          name="email"
                          type="email"
                          placeholder="user@example.com"
                          required
                        />
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
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-sm">{user.email}</p>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFromWhitelist(user.id)}
                      >
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
