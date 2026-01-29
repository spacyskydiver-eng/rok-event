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

  const [universalSpeedMinutes, setUniversalSpeedMinutes] = useState(0)
  const [food, setFood] = useState(0)
  const [wood, setWood] = useState(0)
  const [stone, setStone] = useState(0)
  const [gold, setGold] = useState(0)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

      {/* PAGE INTRO */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Progression Calculator</h1>
        <p className="text-muted-foreground max-w-2xl">
          Plan your Rise of Kingdoms progression using your current resources
          and rewards from upcoming events.
        </p>
      </div>

      {/* PLAYER RESOURCES */}
      <Card>
        <CardHeader>
          <CardTitle>Your Current Resources</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            type="number"
            placeholder="Universal Speedups (minutes)"
            value={universalSpeedMinutes}
            onChange={e => setUniversalSpeedMinutes(Number(e.target.value))}
          />
          <Input
            type="number"
            placeholder="Food"
            value={food}
            onChange={e => setFood(Number(e.target.value))}
          />
          <Input
            type="number"
            placeholder="Wood"
            value={wood}
            onChange={e => setWood(Number(e.target.value))}
          />
          <Input
            type="number"
            placeholder="Stone"
            value={stone}
            onChange={e => setStone(Number(e.target.value))}
          />
          <Input
            type="number"
            placeholder="Gold"
            value={gold}
            onChange={e => setGold(Number(e.target.value))}
          />
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
