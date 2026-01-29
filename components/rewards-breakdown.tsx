'use client'

import { useState } from 'react'
import type { CalendarEventWithMeta } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'

type Totals = Record<string, number>

function groupRewards(events: CalendarEventWithMeta[]) {
  const perEvent: {
    id: string
    name: string
    totals: Totals
  }[] = []

  const grandTotals: Totals = {}

  for (const e of events) {
    const totals: Totals = {}

    for (const item of e.rewards?.items ?? []) {
      totals[item.type] = (totals[item.type] ?? 0) + item.amount
      grandTotals[item.type] = (grandTotals[item.type] ?? 0) + item.amount
    }

    if (Object.keys(totals).length > 0) {
      perEvent.push({
        id: e.id,
        name: e.name,
        totals,
      })
    }
  }

  return { perEvent, grandTotals }
}

function formatLabel(type: string) {
  return type
    .replace('speedup_', '')
    .replace('_minutes', '')
    .replace('resource_', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

export function RewardsBreakdown({ events }: { events: CalendarEventWithMeta[] }) {
  const [open, setOpen] = useState(false)
  const [openEvent, setOpenEvent] = useState<string | null>(null)

  const { perEvent, grandTotals } = groupRewards(events)

  if (perEvent.length === 0) return null

  return (
    <div className="border border-border rounded-xl bg-black/40">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-white/5 transition"
      >
        <span>Event Rewards Breakdown</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="border-t border-border divide-y divide-border">
          {/* Per-event */}
          {perEvent.map(ev => (
            <div key={ev.id}>
              <button
                onClick={() =>
                  setOpenEvent(prev => (prev === ev.id ? null : ev.id))
                }
                className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-white/5"
              >
                <span>{ev.name}</span>
                {openEvent === ev.id ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {openEvent === ev.id && (
                <div className="px-6 pb-3 text-sm space-y-1">
                  {Object.entries(ev.totals).map(([type, amt]) => (
                    <div key={type} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {formatLabel(type)}
                      </span>
                      <span>{amt.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Grand total */}
          {perEvent.length > 1 && (
            <div className="px-4 py-3 bg-black/30">
              <div className="text-xs font-semibold mb-1 text-muted-foreground">
                Total (All Selected Events)
              </div>
              <div className="space-y-1 text-sm">
                {Object.entries(grandTotals).map(([type, amt]) => (
                  <div key={type} className="flex justify-between">
                    <span>{formatLabel(type)}</span>
                    <span>{amt.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
