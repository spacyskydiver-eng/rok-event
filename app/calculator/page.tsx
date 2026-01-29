'use client'

import { useState } from 'react'
import RewardsSummary from '@/components/rewards-summary'
import { useSelectedEvents } from '@/lib/selected-events'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CalculatorPage() {
  const selectedEvents = useSelectedEvents(state => state.events)

  const [includeEventRewards, setIncludeEventRewards] = useState(true)

const [speedups, setSpeedups] = useState({
  universal: 0,
  building: 0,
  research: 0,
  training: 0,
})

const [resources, setResources] = useState({
  food: 0,
  wood: 0,
  stone: 0,
  gold: 0,
})

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

      {/* PAGE INTRO */}
<div className="space-y-4">
  <div>
    <a
      href="/"
      className="text-sm text-muted-foreground hover:text-foreground transition"
    >
      ← Back to Calendar
    </a>
  </div>

  <div className="space-y-2">
    <h1 className="text-3xl font-bold">Progression Calculator</h1>
    <p className="text-muted-foreground max-w-2xl">
      Calculate whether your current resources — plus upcoming event rewards —
      are enough to reach your goals.
    </p>
  </div>
</div>

      {/* PLAYER RESOURCES */}
<Card>
  <CardHeader>
    <CardTitle>Your Current Inventory</CardTitle>
  </CardHeader>

  <CardContent className="space-y-6">

    {/* SPEEDUPS */}
    <div>
      <h3 className="font-medium mb-3">Speedups (minutes)</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Input
          type="number"
          placeholder="Universal"
          value={speedups.universal}
          onChange={e =>
            setSpeedups(s => ({ ...s, universal: Number(e.target.value) }))
          }
        />
        <Input
          type="number"
          placeholder="Building"
          value={speedups.building}
          onChange={e =>
            setSpeedups(s => ({ ...s, building: Number(e.target.value) }))
          }
        />
        <Input
          type="number"
          placeholder="Research"
          value={speedups.research}
          onChange={e =>
            setSpeedups(s => ({ ...s, research: Number(e.target.value) }))
          }
        />
        <Input
          type="number"
          placeholder="Training"
          value={speedups.training}
          onChange={e =>
            setSpeedups(s => ({ ...s, training: Number(e.target.value) }))
          }
        />
      </div>
    </div>

    {/* RESOURCES */}
    <div>
      <h3 className="font-medium mb-3">Resources</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Input
          type="number"
          placeholder="Food"
          value={resources.food}
          onChange={e =>
            setResources(r => ({ ...r, food: Number(e.target.value) }))
          }
        />
        <Input
          type="number"
          placeholder="Wood"
          value={resources.wood}
          onChange={e =>
            setResources(r => ({ ...r, wood: Number(e.target.value) }))
          }
        />
        <Input
          type="number"
          placeholder="Stone"
          value={resources.stone}
          onChange={e =>
            setResources(r => ({ ...r, stone: Number(e.target.value) }))
          }
        />
        <Input
          type="number"
          placeholder="Gold"
          value={resources.gold}
          onChange={e =>
            setResources(r => ({ ...r, gold: Number(e.target.value) }))
          }
        />
      </div>
    </div>

  </CardContent>
</Card>

      {/* EVENT REWARDS */}
      <Card>
        <CardHeader>
          <CardTitle>Event Rewards</CardTitle>
        </CardHeader>

        <CardContent className="flex items-center gap-4">
          <Switch
            checked={includeEventRewards}
            onCheckedChange={setIncludeEventRewards}
          />
          <Label>
            Include rewards from calendar events
          </Label>
        </CardContent>

        {includeEventRewards && (
          <CardContent>
            <RewardsSummary events={selectedEvents} />
          </CardContent>
        )}
      </Card>

      {/* NEXT STEP PLACEHOLDER */}
      <div className="pt-4">
        <Button disabled>
          Calculate (next step)
        </Button>
      </div>

    </div>
  )
}
