'use client'

import { CalendarEventWithMeta } from '@/lib/types'

export default function RewardsSummary({ events }: { events: CalendarEventWithMeta[] }) {
  const selectedCount = events.length

  const totals: Record<string, number> = {}
  for (const e of events) {
    for (const item of e.rewards?.items ?? []) {
      totals[item.type] = (totals[item.type] ?? 0) + item.amount
    }
  }

  const hasTotals = Object.keys(totals).length > 0

  if (selectedCount === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Select events to see a rewards summary.
      </div>
    )
  }

  if (!hasTotals) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {selectedCount} event{selectedCount === 1 ? '' : 's'} selected — no rewards configured yet.
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg bg-black/40">
      <h3 className="font-semibold mb-2">Rewards Summary</h3>
      <ul className="space-y-1 text-sm">
        {Object.entries(totals).map(([type, amount]) => (
          <li key={type} className="flex justify-between">
            <span>{type}</span>
            <span>{amount.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}



