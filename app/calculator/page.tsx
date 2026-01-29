'use client'

import { useState } from 'react'
import RewardsSummary from '@/components/rewards-summary'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSelectedEvents } from '@/lib/selected-events'

export default function CalculatorPage() {
  const selectedEvents = useSelectedEvents(state => state.events)

  const [includeEventRewards, setIncludeEventRewards] = useState(true)

  // Player inputs (foundation only)
  const [universalSpeedMinutes, setUniversalSpeedMinutes] = useState(0)
  const [resourceFood, setResourceFood] = useState(0)
  const [resourceWood, setResourceWood] = useState(0)
  const [resourceStone, setResourceStone] = useState(0)
  const [resourceGold, setResourceGold] = useState(0)

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Progression Calculator</h1>

      {/* Player Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Your Current Resources</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            type="number"
            placeholder="Universal Speedups (minutes)"
            value={universalSpeedMinutes}
            onChange={(e) => setUniversalSpeedMinutes(Number(e.target.value))}
          />
          <Input
            type="number"
            placeholder="Food"
            value={resourceFood}
            onChange={(e) => setResourceFood(Number(e.target.value))}
          />
          <Input
            type="number"
            placeholder="Wood"
            value={resourceWood}
            onChange={(e) => setResourceWood(Number(e.target.value))}
          />
          <Input
            type="number"
            placeholder="Stone"
            value={resourceStone}
            onChange={(e) => setResourceStone(Number(e.target.value))}
          />
          <Input
            type="number"
            placeholder="Gold"
            value={resourceGold}
            onChange={(e) => setResourceGold(Number(e.target.value))}
          />
        </CardContent>
      </Card>

      {/* Event Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Event Rewards</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Switch
            checked={includeEventRewards}
            onCheckedChange={setIncludeEventRewards}
          />
          <Label>Include rewards from events</Label>
        </CardContent>

        {includeEventRewards && (
          <CardContent>
            <RewardsSummary events={selectedEvents} />
          </CardContent>
        )}
      </Card>

      <Button disabled>
        Calculate (next step)
      </Button>
    </div>
  )
}
