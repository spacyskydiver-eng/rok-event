'use client'

import { CalendarEventWithMeta } from '@/lib/types'

const REWARD_LABELS: Record<string, string> = {
  gems: 'Gems',
  gold_keys: 'Gold Keys',
  silver_keys: 'Silver Keys',
  epic_sculptures: 'Epic Sculptures',
  legendary_sculptures: 'Legendary Sculptures',
  resource_food: 'Food',
  resource_wood: 'Wood',
  resource_stone: 'Stone',
  resource_gold: 'Gold',
  speedup_universal_minutes: 'Universal Speedups (min)',
  speedup_building_minutes: 'Building Speedups (min)',
  speedup_research_minutes: 'Research Speedups (min)',
  speedup_training_minutes: 'Training Speedups (min)',
  speedup_healing_minutes: 'Healing Speedups (min)',
}


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
    <details className="p-4 border rounded-lg bg-black/40">
      <summary className="cursor-pointer text-sm text-muted-foreground">
        {selectedCount} event{selectedCount === 1 ? '' : 's'} selected — click to view events
      </summary>

      <div className="mt-3 space-y-2">
        {events.map(ev => (
          <div key={ev.id} className="border rounded p-3 text-sm">
            <p className="font-medium">{ev.name}</p>
            <p className="text-muted-foreground text-xs">
              No rewards configured for this event
            </p>
          </div>
        ))}
      </div>
    </details>
  )
}

return (
  <details className="p-4 border rounded-lg bg-black/40">
    <summary className="cursor-pointer font-semibold">
      Rewards Summary (click to expand)
    </summary>

    {/* TOTALS */}
    <div className="mt-3">
      <h4 className="font-medium mb-1">Total Rewards</h4>
      <ul className="space-y-1 text-sm">
        {Object.entries(totals).map(([type, amount]) => (
          <li key={type} className="flex justify-between">
            <span>{REWARD_LABELS[type] ?? type}</span>
            <span>{amount.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>

    {/* PER EVENT */}
    <div className="mt-4 space-y-2">
      {events.map(ev => (
        <details key={ev.id} className="border rounded p-3">
          <summary className="cursor-pointer text-sm font-medium">
            {ev.name}
          </summary>

          {!ev.rewards?.items?.length ? (
            <p className="text-xs text-muted-foreground mt-2">
              No rewards configured
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {ev.rewards.items.map((r, i) => (
                <li key={i} className="flex justify-between">
                  <span>{REWARD_LABELS[r.type] ?? r.type}</span>
                  <span>{r.amount.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </details>
      ))}
    </div>
  </details>
)
}



