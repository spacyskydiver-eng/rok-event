'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import RewardsSummary from '@/components/rewards-summary'
import { getKingdomSettings, getCalculatorInventory, saveCalculatorInventory } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SaveNotice } from '@/components/save-notice'
import { useUserState } from '@/lib/user-state'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { CalendarEventWithMeta } from '@/lib/types'
import { getEvents } from '@/lib/actions'
import TechTree from '@/components/tech-tree/TechTree'
import { economyTree } from '@/lib/tech-tree/economy'
import { militaryTree } from '@/lib/tech-tree/military'





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

function clampNum(n: unknown) {
  const x = Number(n)
  return Number.isFinite(x) && x > 0 ? x : 0
}


function utcDayNumberFromStart(startDateYYYYMMDD: string) {
  const [y, m, d] = startDateYYYYMMDD.split('-').map(Number)
  const start = Date.UTC(y, m - 1, d, 0, 0, 0)
  const now = Date.now()
  const diffDays = Math.floor((now - start) / 86400000)
  return diffDays + 1
}

function aggregateEventRewards(events: any[]) {
  const speedups: Speedups = { universal: 0, building: 0, research: 0, training: 0 }
  const resources: Resources = { food: 0, wood: 0, stone: 0, gold: 0 }
  const other: Record<string, number> = {}

  for (const e of events) {
    for (const item of e?.rewards?.items ?? []) {
      const amt = clampNum(item.amount)
      const t = String(item.type || '')

      if (t === 'speedup_universal_minutes') speedups.universal += amt
      else if (t === 'speedup_building_minutes') speedups.building += amt
      else if (t === 'speedup_research_minutes') speedups.research += amt
      else if (t === 'speedup_training_minutes') speedups.training += amt
      else if (t === 'resource_food') resources.food += amt
      else if (t === 'resource_wood') resources.wood += amt
      else if (t === 'resource_stone') resources.stone += amt
      else if (t === 'resource_gold') resources.gold += amt
      else other[t] = (other[t] ?? 0) + amt
    }
  }

  return { speedups, resources, other }
}

/* =========================================================
   Guided Goals (Step 3 UI) — RokHub-ish structure (not copy)
   - Tabs for: Research / Buildings / Training
   - Node cards with slider progress
   - Persists using your existing `goals` in Zustand
========================================================= */

type GoalTab = 'research' | 'buildings' | 'training'

type GuidedNode = {
  id: string
  title: string
  subtitle?: string
  max: number
}

const RESEARCH_NODES: GuidedNode[] = [
  { id: 'economy_iron_working', title: 'Iron Working', subtitle: 'Economy Tech', max: 5 },
  { id: 'economy_improved_fletching', title: 'Improved Fletching', subtitle: 'Economy Tech', max: 5 },
  { id: 'economy_horsemanship', title: 'Horsemanship', subtitle: 'Economy Tech', max: 5 },
  { id: 'economy_tracking', title: 'Tracking', subtitle: 'Economy Tech', max: 5 },
  { id: 'economy_pathfinding', title: 'Pathfinding', subtitle: 'Economy Tech', max: 5 },
]

const BUILDING_NODES: GuidedNode[] = [
  { id: 'building_city_hall', title: 'City Hall', subtitle: 'Main Building', max: 25 },
  { id: 'building_academy', title: 'Academy', subtitle: 'Research', max: 25 },
  { id: 'building_barracks', title: 'Barracks', subtitle: 'Training', max: 25 },
]

const TRAINING_NODES: GuidedNode[] = [
  { id: 'training_t3', title: 'Unlock T3', subtitle: 'Troops', max: 1 },
  { id: 'training_t4', title: 'Unlock T4', subtitle: 'Troops', max: 1 },
  { id: 'training_t5', title: 'Unlock T5', subtitle: 'Troops', max: 1 },
]

function getGoalNumber(goals: any, key: string) {
  const v = goals?.guided?.[key]
  return Number.isFinite(Number(v)) ? Number(v) : 0
}

export default function CalculatorPage() {
    const [techGoals, setTechGoals] = useState<Record<string, number>>({})
  const {
    kingdomStartDate,
    speedups,
    resources,
    goals,
    setGoals,
    setKingdomStartDate,
    setSpeedups,
    setResources,
  } = useUserState()
  const [activeTree, setActiveTree] =
  useState<'economy' | 'military'>('economy')
  const [includeEventRewards, setIncludeEventRewards] = useState(true)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSignInGate, setShowSignInGate] = useState(false)
  const [currentDay, setCurrentDay] = useState<number | null>(null)
  const [events, setEvents] = useState<CalendarEventWithMeta[]>([])

  // Guided goals UI state (local UI only, persisted values live in zustand)
  const [goalTab, setGoalTab] = useState<GoalTab>('research')
  const [showRawGoalTargets, setShowRawGoalTargets] = useState(false)

  useEffect(() => {
    if (!kingdomStartDate) {
      setCurrentDay(null)
      return
    }
    const day = utcDayNumberFromStart(kingdomStartDate)
    setCurrentDay(day)
  }, [kingdomStartDate])

  useEffect(() => {
    let cancelled = false

    async function bootSignedIn() {
      try {
        const inv = await getCalculatorInventory()
        if (cancelled) return

        if (!inv) {
          setIsSignedIn(false)
          return
        }

        setIsSignedIn(true)

        const ks = await getKingdomSettings()
        if (cancelled) return

        const serverStart = ks?.kingdom_start_date ?? null
        if (serverStart) setKingdomStartDate(serverStart)

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
      } catch (e) {
        console.error('Calculator boot error:', e)
        setIsSignedIn(false)
      }
    }

    bootSignedIn()
    return () => {
      cancelled = true
    }
  }, [setKingdomStartDate, setSpeedups, setResources])

  const eligibleEvents = useMemo(() => {
    if (!currentDay) return events
    return events.filter((e) => {
      if ((e.end_day ?? 0) < currentDay) return false
      return true
    })
  }, [events, currentDay])

  const eventRewards = useMemo(() => {
    return aggregateEventRewards(eligibleEvents)
  }, [eligibleEvents])

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
      },
    }
  }, [speedups, resources, includeEventRewards, eventRewards])

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

const onCalculateGoalsClick = () => {
  if (!isSignedIn) {
    setShowSignInGate(true)
    return
  }

  const result = {
    research: goals.researchSpeedups - effectiveTotals.speedups.research,
    building: goals.buildingSpeedups - effectiveTotals.speedups.building,
    training: goals.trainingSpeedups - effectiveTotals.speedups.training,
  }

  console.log('Goal result:', {
    missing: {
      research: Math.max(0, result.research),
      building: Math.max(0, result.building),
      training: Math.max(0, result.training),
    },
    surplus: {
      research: Math.max(0, -result.research),
      building: Math.max(0, -result.building),
      training: Math.max(0, -result.training),
    },
  })
}

  useEffect(() => {
    let cancelled = false

    async function loadEvents() {
      try {
        const data = await getEvents()
        if (!cancelled && Array.isArray(data)) {
          setEvents(data)
        }
      } catch (e) {
        console.error('Failed to load events:', e)
      }
    }

    loadEvents()
    return () => {
      cancelled = true
    }
  }, [])

  const nodesForTab: GuidedNode[] =
    goalTab === 'research' ? RESEARCH_NODES : goalTab === 'buildings' ? BUILDING_NODES : TRAINING_NODES

  const setGuidedNode = (id: string, value: number) => {
    setGoals({
      guided: {
        ...(goals as any)?.guided,
        [id]: value,
      },
    } as any)
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {!isSignedIn && (
        <div className="mb-2">
          <SaveNotice />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Calendar
        </Link>

        {isSignedIn && (
          <div className="text-xs text-muted-foreground">{saving ? 'Saving…' : 'Saved'}</div>
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
            {currentDay ? (
              <>
                {' '}
                • Today is <span className="text-foreground">Day {currentDay}</span>
              </>
            ) : null}
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
                  onChange={(e) => setSpeedups({ universal: clampNum(e.target.value) })}
                />
              </div>

              <div className="space-y-1">
                <Label>Building</Label>
                <Input
                  type="number"
                  value={speedups.building}
                  onChange={(e) => setSpeedups({ building: clampNum(e.target.value) })}
                />
              </div>

              <div className="space-y-1">
                <Label>Research</Label>
                <Input
                  type="number"
                  value={speedups.research}
                  onChange={(e) => setSpeedups({ research: clampNum(e.target.value) })}
                />
              </div>

              <div className="space-y-1">
                <Label>Training</Label>
                <Input
                  type="number"
                  value={speedups.training}
                  onChange={(e) => setSpeedups({ training: clampNum(e.target.value) })}
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
                  onChange={(e) => setResources({ food: clampNum(e.target.value) })}
                />
              </div>

              <div className="space-y-1">
                <Label>Wood</Label>
                <Input
                  type="number"
                  value={resources.wood}
                  onChange={(e) => setResources({ wood: clampNum(e.target.value) })}
                />
              </div>

              <div className="space-y-1">
                <Label>Stone</Label>
                <Input
                  type="number"
                  value={resources.stone}
                  onChange={(e) => setResources({ stone: clampNum(e.target.value) })}
                />
              </div>

              <div className="space-y-1">
                <Label>Gold</Label>
                <Input
                  type="number"
                  value={resources.gold}
                  onChange={(e) => setResources({ gold: clampNum(e.target.value) })}
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
              <RewardsSummary events={eligibleEvents as any} />

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
            <div className="flex justify-between">
              <span>Universal</span>
              <span>{effectiveTotals.speedups.universal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Building</span>
              <span>{effectiveTotals.speedups.building.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Research</span>
              <span>{effectiveTotals.speedups.research.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Training</span>
              <span>{effectiveTotals.speedups.training.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium text-muted-foreground">Resources</div>
            <div className="flex justify-between">
              <span>Food</span>
              <span>{effectiveTotals.resources.food.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Wood</span>
              <span>{effectiveTotals.resources.wood.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Stone</span>
              <span>{effectiveTotals.resources.stone.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Gold</span>
              <span>{effectiveTotals.resources.gold.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Economy Tech Tree */}
<Card className="border-white/10 bg-black/30">
  <CardContent className="p-6">

<div className="flex gap-3 mb-4">
  <button
    onClick={() => setActiveTree('economy')}
    className={
      activeTree === 'economy'
        ? 'rounded-lg px-4 py-2 bg-blue-500/30 ring-2 ring-blue-400 shadow-[0_0_20px_rgba(80,200,255,0.8)]'
        : 'rounded-lg px-4 py-2 bg-white/5 opacity-60'
    }
  >
    Economy
  </button>

  <button
    onClick={() => setActiveTree('military')}
    className={
      activeTree === 'military'
        ? 'rounded-lg px-4 py-2 bg-red-500/30 ring-2 ring-red-400 shadow-[0_0_20px_rgba(255,100,100,0.8)]'
        : 'rounded-lg px-4 py-2 bg-white/5 opacity-60'
    }
  >
    Military
  </button>
</div>


<TechTree
  title={activeTree === 'economy'
    ? 'Economic Technology'
    : 'Military Technology'}
  nodes={activeTree === 'economy'
    ? economyTree
    : []}
/>

  </CardContent>
</Card>


      {/* =========================================================
          Manual Goal Targets (kept, but collapsible now)
          (You already had this — we keep it for now)
      ========================================================= */}
      {showRawGoalTargets && (
        <Card className="border-white/10 bg-black/30 shadow-[0_0_60px_rgba(59,130,246,0.08)]">
          <CardHeader>
            <CardTitle>Goal Targets (Manual)</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Label>Target City Hall Level (optional)</Label>
              <Input
                type="number"
                min={1}
                max={25}
                value={goals.cityHallLevel ?? ''}
                onChange={(e) =>
                  setGoals({
                    cityHallLevel: e.target.value ? clampNum(e.target.value) : null,
                  })
                }
                placeholder="e.g. 25"
              />
            </div>

            <div className="space-y-2">
              <div className="font-medium">Required Speedups (minutes)</div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>Research</Label>
                  <Input
                    type="number"
                    value={goals.researchSpeedups}
                    onChange={(e) => setGoals({ researchSpeedups: clampNum(e.target.value) })}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Building</Label>
                  <Input
                    type="number"
                    value={goals.buildingSpeedups}
                    onChange={(e) => setGoals({ buildingSpeedups: clampNum(e.target.value) })}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Training</Label>
                  <Input
                    type="number"
                    value={goals.trainingSpeedups}
                    onChange={(e) => setGoals({ trainingSpeedups: clampNum(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={onCalculateGoalsClick} className="w-full">
        Calculate Goals
      </Button>

      <Dialog open={showSignInGate} onOpenChange={setShowSignInGate}>
        <DialogContent className="border-white/10 bg-black/70 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Sign in to unlock Goals</DialogTitle>
            <DialogDescription>
              This feature is <span className="text-foreground font-medium">free</span> — signing in just lets us
              save your plan and keep it synced across devices.
              <br />
              <span className="text-xs text-muted-foreground">
                No spam. No payment. No weird stuff — just progress tracking.
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSignInGate(false)}>
              Not now
            </Button>
            <Button asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
