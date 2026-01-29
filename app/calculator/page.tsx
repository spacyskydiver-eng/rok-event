'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import RewardsSummary from '@/components/rewards-summary'
import { useSelectedEvents } from '@/lib/selected-events'
import { getKingdomSettings, getCalculatorInventory, saveCalculatorInventory } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Speedups = {
  universal: number
  building: number
  research: number
  training: number
}

type Resources = {
  food: number
  wood: number
  stone: number
  gold: number
}

function clampNum(n: any) {
  const x = Number(n)
  return Number.isFinite(x) && x > 0 ? x : 0
}

function utcDayNumberFromStart(startDateYYYYMMDD: string) {
  // startDateYYYYMMDD: "YYYY-MM-DD"
  // Day 1 = start date
  const [y, m, d] = startDateYYYYMMDD.split('-').map(Number)
  const start = Date.UTC(y, m - 1, d, 0, 0, 0)
  const now = Date.now()
  const diffDays = Math.floor((now - start) / 86400000)
  return diffDays + 1
}

function aggregateEventRewards(events: any[]) {
  const speedups: Speedups = { universal: 0, building: 0, research: 0, training: 0 }
  const resources: Resources = { food: 0, wood: 0, stone: 0, gold: 0 }

  // Keep everything else too (gems, keys, sculptures, etc.)
  const other: Record<string, number> = {}

  for (const e of events) {
    for (const item of e?.rewards?.items ?? []) {
      const amt = clampNum(item.amount)
      const t = String(item.type || '')

      // Speedups (minutes)
      if (t === 'speedup_universal_minutes') speedups.universal += amt
      else if (t === 'speedup_building_minutes') speedups.building += amt
      else if (t === 'speedup_research_minutes') speedups.research += amt
      else if (t === 'speedup_training_minutes') speedups.training += amt

      // Resources
      else if (t === 'resource_food') resources.food += amt
      else if (t === 'resource_wood') resources.wood += amt
      else if (t === 'resource_stone') resources.stone += amt
      else if (t === 'resource_gold') resources.gold += amt

      // Other rewards (still counted, just not applied into inv fields)
      else other[t] = (other[t] ?? 0) + amt
    }
  }

  return { speedups, resources, other }
}

export default function CalculatorPage() {
  const selectedEvents = useSelectedEvents(s => s.events)
  const prunePastEvents = useSelectedEvents(s => s.prunePastEvents)

  const [includeEventRewards, setIncludeEventRewards] = useState(true)

  const [speedups, setSpeedups] = useState<Speedups>({
    universal: 0,
    building: 0,
    research: 0,
    training: 0,
  })

  const [resources, setResources] = useState<Resources>({
    food: 0,
    wood: 0,
    stone: 0,
    gold: 0,
  })

  const [kingdomStartDate, setKingdomStartDate] = useState<string | null>(null)
  const [currentDay, setCurrentDay] = useState<number | null>(null)

  const [isSignedIn, setIsSignedIn] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load Kingdom Start Date + Calculator Inventory (if signed in)
  useEffect(() => {
    let cancelled = false

    async function boot() {
      try {
        const ks = await getKingdomSettings()
        if (cancelled) return

        const start = ks?.kingdom_start_date ?? null
        setKingdomStartDate(start)

        if (start) {
          const day = utcDayNumberFromStart(start)
          setCurrentDay(day)
          // ✅ auto-remove passed events from selection
          prunePastEvents(day)
        } else {
          setCurrentDay(null)
        }

        const inv = await getCalculatorInventory()
        if (cancelled) return

        if (inv) {
          setIsSignedIn(true)
          setSpeedups({
            universal: clampNum(inv.speed_universal_minutes),
            building: clampNum(inv.speed_building_minutes),
            research: clampNum(inv.speed_research_minutes),
            training: clampNum(inv.speed_training_minutes),
          })
          setResources({
            food: clampNum(inv.resource_food),
            wood: clampNum(inv.resource_wood),
            stone: clampNum(inv.resource_stone),
            gold: clampNum(inv.resource_gold),
          })
        } else {
          setIsSignedIn(false)
        }
      } catch (e) {
        console.error('Calculator boot error:', e)
      }
    }

    boot()
    return () => { cancelled = true }
  }, [prunePastEvents])

  // Use selected events, but ignore past ones if we have a current day
  const eligibleSelectedEvents = useMemo(() => {
    if (!currentDay) return selectedEvents
    return selectedEvents.filter(e => (e.end_day ?? 0) >= currentDay)
  }, [selectedEvents, currentDay])

  const eventRewards = useMemo(() => {
    return aggregateEventRewards(eligibleSelectedEvents)
  }, [eligibleSelectedEvents])

  const effectiveTotals = useMemo(() => {
    const baseSpeed = { ...speedups }
    const baseRes = { ...resources }

    if (!includeEventRewards) {
      return { speedups: baseSpeed, resources: baseRes }
    }

    return {
      speedups: {
        universal: baseSpeed.universal + eventRewards.speedups.universal,
        building: baseSpeed.building + eventRewards.speedups.building,
        research: baseSpeed.research + eventRewards.speedups.research,
        training: baseSpeed.training + eventRewards.speedups.training,
      },
      resources: {
        food: baseRes.food + eventRewards.resources.food,
        wood: baseRes.wood + eventRewards.resources.wood,
        stone: baseRes.stone + eventRewards.resources.stone,
        gold: baseRes.gold + eventRewards.resources.gold,
      }
    }
  }, [speedups, resources, includeEventRewards, eventRewards])

  // Auto-save inventory when signed in (debounced-ish)
  useEffect(() => {
    if (!isSignedIn) return

    const t = setTimeout(async () => {
      try {
        setSaving(true)
        await saveCalculatorInventory({
          speed_universal_minutes: clampNum(speedups.universal),
          speed_building_minutes: clampNum(speedups.building),
          speed_research_minutes: clampNum(speedups.research),
          speed_training_minutes: clampNum(speedups.training),
          resource_food: clampNum(resources.food),
          resource_wood: clampNum(resources.wood),
          resource_stone: clampNum(resources.stone),
          resource_gold: clampNum(resources.gold),
        })
      } catch (e) {
        console.error('Save inventory failed:', e)
      } finally {
        setSaving(false)
      }
    }, 600)

    return () => clearTimeout(t)
  }, [isSignedIn, speedups, resources])

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Calendar
        </Link>

        {isSignedIn && (
          <div className="text-xs text-muted-foreground">
            {saving ? 'Saving…' : 'Saved'}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Progression Calculator</h1>
        <p className="text-muted-foreground">
          Calculate whether your current inventory — plus upcoming event rewards — is enough to reach your goals.
        </p>

        {kingdomStartDate ? (
          <p className="text-xs text-muted-foreground">
            Kingdom Start Date: <span className="text-foreground">{kingdomStartDate}</span>
            {currentDay ? <> • Today is <span className="text-foreground">Day {currentDay}</span></> : null}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            No kingdom start date set — calculator will assume all events are available.
          </p>
        )}
      </div>

      {/* Inventory */}
      <Card className="border-white/10 bg-black/30 shadow-[0_0_60px_rgba(255,255,255,0.05)]">
        <CardHeader>
          <CardTitle>Your Current Inventory</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="font-medium">Speedups (minutes)</div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label>Universal</Label>
                <Input
                  type="number"
                  value={speedups.universal}
                  onChange={e => setSpeedups(s => ({ ...s, universal: clampNum(e.target.value) }))}
                />
              </div>

              <div className="space-y-1">
                <Label>Building</Label>
                <Input
                  type="number"
                  value={speedups.building}
                  onChange={e => setSpeedups(s => ({ ...s, building: clampNum(e.target.value) }))}
                />
              </div>

              <div className="space-y-1">
                <Label>Research</Label>
                <Input
                  type="number"
                  value={speedups.research}
                  onChange={e => setSpeedups(s => ({ ...s, research: clampNum(e.target.value) }))}
                />
              </div>

              <div className="space-y-1">
                <Label>Training</Label>
                <Input
                  type="number"
                  value={speedups.training}
                  onChange={e => setSpeedups(s => ({ ...s, training: clampNum(e.target.value) }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium">Resources</div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label>Food</Label>
                <Input
                  type="number"
                  value={resources.food}
                  onChange={e => setResources(r => ({ ...r, food: clampNum(e.target.value) }))}
                />
              </div>

              <div className="space-y-1">
                <Label>Wood</Label>
                <Input
                  type="number"
                  value={resources.wood}
                  onChange={e => setResources(r => ({ ...r, wood: clampNum(e.target.value) }))}
                />
              </div>

              <div className="space-y-1">
                <Label>Stone</Label>
                <Input
                  type="number"
                  value={resources.stone}
                  onChange={e => setResources(r => ({ ...r, stone: clampNum(e.target.value) }))}
                />
              </div>

              <div className="space-y-1">
                <Label>Gold</Label>
                <Input
                  type="number"
                  value={resources.gold}
                  onChange={e => setResources(r => ({ ...r, gold: clampNum(e.target.value) }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Event Rewards */}
      <Card className="border-white/10 bg-black/30">
        <CardHeader>
          <CardTitle>Event Rewards</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch checked={includeEventRewards} onCheckedChange={setIncludeEventRewards} />
            <Label>Include rewards from calendar events</Label>
          </div>

          {includeEventRewards && (
            <div className="space-y-4">
              <RewardsSummary events={eligibleSelectedEvents as any} />

              <div className="text-xs text-muted-foreground">
                {currentDay
                  ? `Events ending before Day ${currentDay} are automatically ignored.`
                  : `Set a kingdom start date to automatically ignore past events.`}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Effective totals */}
      <Card className="border-white/10 bg-black/30 shadow-[0_0_80px_rgba(245,158,11,0.08)]">
        <CardHeader>
          <CardTitle>Effective Totals</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <div className="font-medium text-muted-foreground">Speedups (minutes)</div>
            <div className="flex justify-between"><span>Universal</span><span>{effectiveTotals.speedups.universal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Building</span><span>{effectiveTotals.speedups.building.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Research</span><span>{effectiveTotals.speedups.research.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Training</span><span>{effectiveTotals.speedups.training.toLocaleString()}</span></div>
          </div>

          <div className="space-y-2">
            <div className="font-medium text-muted-foreground">Resources</div>
            <div className="flex justify-between"><span>Food</span><span>{effectiveTotals.resources.food.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Wood</span><span>{effectiveTotals.resources.wood.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Stone</span><span>{effectiveTotals.resources.stone.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Gold</span><span>{effectiveTotals.resources.gold.toLocaleString()}</span></div>
          </div>
        </CardContent>
      </Card>

      <Button disabled className="opacity-70">
        Calculate Goals (next step)
      </Button>
    </div>
  )
}
