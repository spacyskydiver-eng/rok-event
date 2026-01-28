'use client'

import { CalendarEventWithMeta, EventRewardItem } from '@/lib/types'

type Props = {
  events: CalendarEventWithMeta[]
}

function sumRewards(events: CalendarEventWithMeta[]): Record<string, number> {
  const totals: Record<string, number> = {}

  events.forEach(event => {
    event.rewards?.items.forEach(item => {
      totals[item.type] = (totals[item.type] || 0) + item.amount
    })
  })

  return totals
}

export default function RewardsSummary({ events }: Props) {
  const totals = sumRewards(events)

if (events.length === 0) {
  return (
    <div className="p-4 text-sm text-gray-400">
      Select events to see a combined rewards summary.
    </div>
  )
}

if (Object.keys(totals).length === 0) {
  return (
    <div className="p-4 text-sm text-gray-400">
      No rewards are attached to these events yet.
    </div>
  )
}


  return (
    <div className="p-4 border rounded bg-black/40">
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
