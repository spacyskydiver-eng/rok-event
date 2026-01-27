'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Plus, Trash2, Save, Package } from 'lucide-react'
import { 
  addBundleTier, 
  updateBundleTier, 
  deleteBundleTier,
  addBundleColumn,
  updateBundleColumn,
  deleteBundleColumn,
  updateBundleCell
} from '@/lib/actions'
import type { BundleWithDetails } from '@/lib/types'

interface BundleDetailViewProps {
  bundle: BundleWithDetails
  canEdit: boolean
}

export function BundleDetailView({ bundle, canEdit }: BundleDetailViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [newTierName, setNewTierName] = useState('')
  const [newTierPrice, setNewTierPrice] = useState('')
  const [newColumnName, setNewColumnName] = useState('')
  
  // Local state for optimistic updates
  const [tiers, setTiers] = useState(bundle.tiers)
  const [columns, setColumns] = useState(bundle.columns)
  const [cells, setCells] = useState(bundle.cells)

  const handleAddTier = async () => {
    if (!newTierName.trim()) return
    setIsLoading(true)
    
    const result = await addBundleTier(bundle.id, newTierName, newTierPrice || null)
    
    if (result.success && result.tier) {
      setTiers([...tiers, result.tier])
      setNewTierName('')
      setNewTierPrice('')
      toast({ title: 'Tier added' })
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
    
    setIsLoading(false)
  }

  const handleDeleteTier = async (tierId: string) => {
    if (!confirm('Delete this tier row?')) return
    
    const result = await deleteBundleTier(tierId)
    
    if (result.success) {
      setTiers(tiers.filter(t => t.id !== tierId))
      setCells(cells.filter(c => c.tier_id !== tierId))
      toast({ title: 'Tier deleted' })
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
  }

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return
    setIsLoading(true)
    
    const result = await addBundleColumn(bundle.id, newColumnName)
    
    if (result.success && result.column) {
      setColumns([...columns, result.column])
      setNewColumnName('')
      toast({ title: 'Column added' })
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
    
    setIsLoading(false)
  }

  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm('Delete this column?')) return
    
    const result = await deleteBundleColumn(columnId)
    
    if (result.success) {
      setColumns(columns.filter(c => c.id !== columnId))
      setCells(cells.filter(c => c.column_id !== columnId))
      toast({ title: 'Column deleted' })
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
  }

  const handleCellChange = async (tierId: string, columnId: string, value: string) => {
    // Optimistic update
    const existingCellIndex = cells.findIndex(c => c.tier_id === tierId && c.column_id === columnId)
    
    if (existingCellIndex >= 0) {
      const newCells = [...cells]
      newCells[existingCellIndex] = { ...newCells[existingCellIndex], value }
      setCells(newCells)
    } else {
      setCells([...cells, { id: `temp-${tierId}-${columnId}`, tier_id: tierId, column_id: columnId, value, created_at: new Date().toISOString() }])
    }

    // Save to database
    const result = await updateBundleCell(tierId, columnId, value)
    
    if (!result.success) {
      toast({ title: 'Error saving', description: result.error, variant: 'destructive' })
    }
  }

  const getCellValue = (tierId: string, columnId: string): string => {
    const cell = cells.find(c => c.tier_id === tierId && c.column_id === columnId)
    return cell?.value || ''
  }

  const handleTierNameChange = async (tierId: string, name: string) => {
    const tier = tiers.find(t => t.id === tierId)
    if (!tier) return
    
    // Optimistic update
    setTiers(tiers.map(t => t.id === tierId ? { ...t, name } : t))
    
    const result = await updateBundleTier(tierId, name, tier.price)
    if (!result.success) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
  }

  const handleTierPriceChange = async (tierId: string, price: string) => {
    const tier = tiers.find(t => t.id === tierId)
    if (!tier) return
    
    // Optimistic update
    setTiers(tiers.map(t => t.id === tierId ? { ...t, price } : t))
    
    const result = await updateBundleTier(tierId, tier.name, price || null)
    if (!result.success) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
  }

  const handleColumnNameChange = async (columnId: string, name: string) => {
    // Optimistic update
    setColumns(columns.map(c => c.id === columnId ? { ...c, name } : c))
    
    const result = await updateBundleColumn(columnId, name)
    if (!result.success) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calendar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-muted-foreground" />
              <div>
                <CardTitle className="text-2xl">{bundle.name}</CardTitle>
                {bundle.description && (
                  <CardDescription className="mt-1">{bundle.description}</CardDescription>
                )}
              </div>
            </div>
            <Badge variant="secondary">Day {bundle.start_day}-{bundle.end_day}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {bundle.image_url && (
            <div className="rounded-lg overflow-hidden bg-muted max-w-md">
              <img 
                src={bundle.image_url || "/placeholder.svg"} 
                alt={bundle.name}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Tier Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Spending Tiers</h3>
            </div>

            {tiers.length === 0 && columns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                {canEdit ? 'Add columns and tiers below to build your rewards table.' : 'No tier data yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 font-medium text-muted-foreground">Tier</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">Price</th>
                      {columns.map((column) => (
                        <th key={column.id} className="text-left p-2 font-medium text-muted-foreground min-w-[120px]">
                          {canEdit ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={column.name}
                                onChange={(e) => handleColumnNameChange(column.id, e.target.value)}
                                className="h-7 text-sm"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteColumn(column.id)}
                                className="h-7 w-7 p-0 shrink-0"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          ) : (
                            column.name
                          )}
                        </th>
                      ))}
                      {canEdit && <th className="w-10" />}
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.map((tier) => (
                      <tr key={tier.id} className="border-b border-border">
                        <td className="p-2">
                          {canEdit ? (
                            <Input
                              value={tier.name}
                              onChange={(e) => handleTierNameChange(tier.id, e.target.value)}
                              className="h-8 text-sm"
                            />
                          ) : (
                            <span className="font-medium">{tier.name}</span>
                          )}
                        </td>
                        <td className="p-2">
                          {canEdit ? (
                            <Input
                              value={tier.price || ''}
                              onChange={(e) => handleTierPriceChange(tier.id, e.target.value)}
                              placeholder="$0.00"
                              className="h-8 text-sm w-24"
                            />
                          ) : (
                            <span>{tier.price || '-'}</span>
                          )}
                        </td>
                        {columns.map((column) => (
                          <td key={column.id} className="p-2">
                            {canEdit ? (
                              <Input
                                value={getCellValue(tier.id, column.id)}
                                onChange={(e) => handleCellChange(tier.id, column.id, e.target.value)}
                                className="h-8 text-sm"
                                placeholder="-"
                              />
                            ) : (
                              <span>{getCellValue(tier.id, column.id) || '-'}</span>
                            )}
                          </td>
                        ))}
                        {canEdit && (
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTier(tier.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add Column / Add Tier Controls */}
            {canEdit && (
              <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Input
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="New column name"
                    className="w-40"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddColumn}
                    disabled={isLoading || !newColumnName.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Column
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={newTierName}
                    onChange={(e) => setNewTierName(e.target.value)}
                    placeholder="Tier name (e.g., Tier 1)"
                    className="w-40"
                  />
                  <Input
                    value={newTierPrice}
                    onChange={(e) => setNewTierPrice(e.target.value)}
                    placeholder="Price (optional)"
                    className="w-28"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTier}
                    disabled={isLoading || !newTierName.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Tier
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
