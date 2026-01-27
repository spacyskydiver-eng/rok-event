'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Trash2, Package, ExternalLink } from 'lucide-react'
import { 
  createBundle, 
  updateBundle, 
  deleteBundle 
} from '@/lib/actions'
import type { Bundle } from '@/lib/types'

interface BundleManagerProps {
  bundles: Bundle[]
  canEdit: boolean
}

export function BundleManager({ bundles, canEdit }: BundleManagerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    
    let result
    if (editingBundle) {
      result = await updateBundle(editingBundle.id, formData)
    } else {
      result = await createBundle(formData)
    }
    
    if (result.success) {
      toast({ title: editingBundle ? 'Bundle updated' : 'Bundle created' })
      setIsDialogOpen(false)
      setEditingBundle(null)
      router.refresh()
      
      // If new bundle, redirect to edit page for tier table
      if (!editingBundle && result.bundleId) {
        router.push(`/bundles/${result.bundleId}`)
      }
    } else {
      toast({ title: 'Error', description: result.error || 'Something went wrong', variant: 'destructive' })
    }
    
    setIsLoading(false)
  }

  const handleDelete = async (bundleId: string) => {
    if (!confirm('Are you sure you want to delete this bundle? All tier data will be lost.')) return
    
    const result = await deleteBundle(bundleId)
    if (result.success) {
      toast({ title: 'Bundle deleted' })
      router.refresh()
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to delete bundle', variant: 'destructive' })
    }
  }

  const openEditDialog = (bundle: Bundle) => {
    setEditingBundle(bundle)
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingBundle(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Shop Bundles</h3>
        </div>
        {canEdit && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Bundle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingBundle ? 'Edit Bundle' : 'Create Bundle'}</DialogTitle>
                  <DialogDescription>
                    {editingBundle ? 'Update the bundle details.' : 'Add a new shop bundle to track.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Bundle Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingBundle?.name || ''}
                      placeholder="e.g., Growth Fund"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={editingBundle?.description || ''}
                      placeholder="What does this bundle contain?"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL (optional)</Label>
                    <Input
                      id="image_url"
                      name="image_url"
                      defaultValue={editingBundle?.image_url || ''}
                      placeholder="https://..."
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
                        defaultValue={editingBundle?.start_day || 1}
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
                        defaultValue={editingBundle?.end_day || 7}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show_on_calendar">Show on Calendar</Label>
                    <input 
                      type="hidden" 
                      name="show_on_calendar" 
                      value={editingBundle?.show_on_calendar ? 'true' : 'false'} 
                    />
                    <Switch
                      id="show_on_calendar"
                      defaultChecked={editingBundle?.show_on_calendar ?? true}
                      onCheckedChange={(checked) => {
                        const input = document.querySelector('input[name="show_on_calendar"]') as HTMLInputElement
                        if (input) input.value = checked ? 'true' : 'false'
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : (editingBundle ? 'Update' : 'Create')}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {bundles.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No bundles yet. {canEdit && 'Click "Add Bundle" to create one.'}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bundles.map((bundle) => (
            <Card key={bundle.id} className="overflow-hidden">
              {bundle.image_url && (
                <div className="aspect-video relative bg-muted">
                  <img 
                    src={bundle.image_url || "/placeholder.svg"} 
                    alt={bundle.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{bundle.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    Day {bundle.start_day}-{bundle.end_day}
                  </Badge>
                </div>
                {bundle.description && (
                  <CardDescription className="text-sm line-clamp-2">
                    {bundle.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {bundle.show_on_calendar && (
                      <Badge variant="outline" className="text-xs">On Calendar</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/bundles/${bundle.id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {canEdit && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(bundle)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(bundle.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
