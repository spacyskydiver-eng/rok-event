'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Bundle, CalendarEvent, CalendarEventWithMeta, EventCategory } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEventSelection } from '@/components/event-selection-context'
import RewardsSummary from '@/components/rewards-summary'

interface CalendarTimelineProps {
  events: CalendarEventWithMeta[]
  categories: EventCategory[]
  bundles: Bundle[]
}

const TOTAL_DAYS = 130
const DAY_WIDTH = 56
const ROW_HEIGHT = 50
const HEADER_HEIGHT = 60

const OPTIMAL_INDICATORS = {
  TRAINING_POINTS: {
    label: 'Training',
    dot: 'bg-red-500',
    glow: 'shadow-[0_0_10px_rgba(239,68,68,0.9)]',
  },
  BUILDING_POINTS: {
    label: 'Building',
    dot: 'bg-blue-500',
    glow: 'shadow-[0_0_10px_rgba(59,130,246,0.9)]',
  },
  RESEARCH_POINTS: {
    label: 'Research',
    dot: 'bg-purple-500',
    glow: 'shadow-[0_0_10px_rgba(168,85,247,0.9)]',
  },
} as const

type OptimalTag = keyof typeof OPTIMAL_INDICATORS

export function CalendarTimeline({ events, categories, bundles }: CalendarTimelineProps) {
  const { toggleEvent, isSelected } = useEventSelection()

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(categories.map(c => c.id))
  )

  const [showBundles, setShowBundles] = useState(true)
  const [showOptimal, setShowOptimal] = useState(true)

  const [selectedEvent, setSelectedEvent] = useState<CalendarEventWithMeta | null>(null)

  const [activeDayInfo, setActiveDayInfo] = useState<{
    day: number
    tag: OptimalTag
    events: CalendarEventWithMeta[]
  } | null>(null)

  const [kingdomStartDate, setKingdomStartDate] = useState<string>('')
  const [firstCaoWheelDate, setFirstCaoWheelDate] = useState<string>('') // YYYY-MM-DD (UTC)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  function toUtcMidnightMs(dateStr: string) {
    return Date.parse(`${dateStr}T00:00:00Z`)
  }

  // ===== Wheel of Fortune generation (anchored by first Cao wheel) =====
  const wheelEvents: CalendarEvent[] = useMemo(() => {
    if (!kingdomStartDate || !firstCaoWheelDate) return []

    const kingdomStartMs = toUtcMidnightMs(kingdomStartDate)
    const firstMs = toUtcMidnightMs(firstCaoWheelDate)
    if (Number.isNaN(kingdomStartMs) || Number.isNaN(firstMs)) return []

    const day1Based = Math.floor((firstMs - kingdomStartMs) / 86400000) + 1
    if (day1Based < 1 || day1Based > TOTAL_DAYS) return []

    const result: CalendarEvent[] = []
    for (let i = 0; i < 20; i++) {
      const start_day = day1Based + i * 14
      const end_day = start_day + 2
      if (start_day > TOTAL_DAYS) break

      result.push({
        id: `wheel-${i}-${start_day}`,
        name:
          i === 0
            ? 'Wheel of Fortune (Cao Cao)'
            : i === 1
              ? 'Wheel of Fortune (Richard)'
              : 'Wheel of Fortune',
        start_day,
        end_day: Math.min(end_day, TOTAL_DAYS),
        description:
          i === 0
            ? 'Anchored to your first Cao Cao Wheel date.'
            : 'Generated every 14 days from your first Cao Cao Wheel.',
        category_id: null,
        created_by: 'local',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    return result
  }, [kingdomStartDate, firstCaoWheelDate])

  // ===== Optimal windows (auto-detected overlaps per tag) =====
  const optimalDays = useMemo(() => {
    const out: Record<number, { tag: OptimalTag; events: CalendarEventWithMeta[] }[]> = {}

    const tags = Object.keys(OPTIMAL_INDICATORS) as OptimalTag[]
    for (const tag of tags) {
      const taggedEvents = events.filter(e => e.tags?.includes(tag))

      for (let i = 0; i < taggedEvents.length; i++) {
        for (let j = i + 1; j < taggedEvents.length; j++) {
          const a = taggedEvents[i]
          const b = taggedEvents[j]

          const start = Math.max(a.start_day, b.start_day)
          const end = Math.min(a.end_day, b.end_day)

          if (start <= end) {
            for (let day = start; day <= end; day++) {
              if (!out[day]) out[day] = []
              out[day].push({ tag, events: [a, b] })
            }
          }
        }
      }
    }

    return out
  }, [events])

  // ===== Filtered Events =====
  const filteredEvents = useMemo(() => {
    return [...events, ...wheelEvents].filter(
      e => !e.category_id || selectedCategories.has(e.category_id)
    )
  }, [events, wheelEvents, selectedCategories])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }

  const selectAll = () => setSelectedCategories(new Set(categories.map(c => c.id)))
  const deselectAll = () => setSelectedCategories(new Set())

  const calculateEventRows = () => {
    const sorted = [...filteredEvents].sort((a, b) => a.start_day - b.start_day)
    const rows: { event: CalendarEventWithMeta | CalendarEvent; row: number }[] = []
    const rowEnds: number[] = []

    for (const event of sorted) {
      let assigned = -1
      for (let i = 0; i < rowEnds.length; i++) {
        if (rowEnds[i] < event.start_day) {
          assigned = i
          rowEnds[i] = event.end_day
          break
        }
      }
      if (assigned === -1) {
        assigned = rowEnds.length
        rowEnds.push(event.end_day)
      }
      rows.push({ event, row: assigned })
    }

    return { rows, totalRows: Math.max(rowEnds.length, 1) }
  }

  const { rows, totalRows } = calculateEventRows()

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current
    if (!el) return
    const scrollAmount = 400
    const newPos =
      direction === 'left'
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(TOTAL_DAYS * DAY_WIDTH - el.clientWidth, scrollPosition + scrollAmount)

    el.scrollTo({ left: newPos, behavior: 'smooth' })
    setScrollPosition(newPos)
  }

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const onScroll = () => setScrollPosition(el.scrollLeft)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const getCategoryColor = (categoryId: string | null) => {
    if (!categoryId) return '#6b7280'
    const category = categories.find(c => c.id === categoryId)
    return category?.color || '#6b7280'
  }

  // Helper: modal list unique events
  const uniqueEvents = (list: CalendarEventWithMeta[]) =>
    Array.from(new Map(list.map(e => [e.id, e])).values())

  return (
    <div className="flex flex-col gap-4">
      {/* Kingdom start date */}
      <div className="flex flex-col gap-2 p-4 bg-card rounded-lg border border-border">
        <span className="text-sm font-semibold text-foreground">Kingdom start date (UTC)</span>
        <input
          type="date"
          className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          value={kingdomStartDate}
          onChange={e => setKingdomStartDate(e.target.value)}
        />
      </div>

      {/* Wheel of Fortune Setup */}
      <div className="flex flex-col gap-2 p-4 bg-card rounded-lg border border-border">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              Wheel of Fortune (Cao Cao) setup
            </span>
            <span className="text-xs text-muted-foreground">
              Enter the first date your kingdom got the Cao Cao Wheel (UTC). This anchors all future Wheels.
            </span>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">First Cao Cao Wheel date (UTC)</span>
            <input
              type="date"
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              value={firstCaoWheelDate}
              onChange={e => setFirstCaoWheelDate(e.target.value)}
            />
          </label>
        </div>

        {!kingdomStartDate && (
          <div className="text-xs text-amber-300/90">
            Set your Kingdom start date above to place Wheel events correctly on the Day 1–130 timeline.
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-card rounded-lg border border-border">
        <span className="text-sm font-medium text-muted-foreground mr-2">Filters:</span>

        <Button variant="outline" size="sm" onClick={selectAll} className="text-xs bg-transparent">
          All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={deselectAll}
          className="text-xs bg-transparent"
        >
          None
        </Button>

        <div className="w-px h-6 bg-border mx-2" />

        <Button
          variant={showBundles ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowBundles(v => !v)}
          className="text-xs"
        >
          🛒 Bundles
        </Button>

        <Button
          variant={showOptimal ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowOptimal(v => !v)}
          className="text-xs"
        >
          ⭐ Optimal
        </Button>

        {/* ✅ CATEGORY BUTTONS (RESTORED) */}
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              selectedCategories.has(category.id)
                ? 'ring-2 ring-offset-2 ring-offset-background'
                : 'opacity-50'
            )}
            style={{
              backgroundColor: `${category.color}20`,
              color: category.color,
              borderColor: category.color,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
            {category.name}
          </button>
        ))}

        {categories.length === 0 && (
          <span className="text-xs text-muted-foreground">No categories yet. Add some in the admin panel.</span>
        )}
      </div>

      {/* Timeline */}
      <div className="relative bg-slate-800/80 backdrop-blur rounded-lg border border-slate-700">
        {/* Navigation Buttons */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => scroll('left')}
            disabled={scrollPosition <= 0}
            className="h-10 w-10 rounded-full shadow-lg"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => scroll('right')}
            className="h-10 w-10 rounded-full shadow-lg"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
          style={{ scrollbarWidth: 'thin' }}
        >
          <div style={{ width: TOTAL_DAYS * DAY_WIDTH, minHeight: HEADER_HEIGHT + totalRows * ROW_HEIGHT + 20 }}>
            {/* Day Headers */}
            <div className="sticky top-0 z-10 flex bg-card border-b border-border" style={{ height: HEADER_HEIGHT }}>
              {Array.from({ length: TOTAL_DAYS }, (_, i) => {
                const day = i + 1
                const isWeekStart = day % 7 === 1

                return (
                  <div
                    key={day}
                    className={cn(
                      'flex flex-col items-center justify-center text-xs border-r border-border',
                      isWeekStart && 'bg-muted/50'
                    )}
                    style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH }}
                  >
                    <span className="font-semibold text-foreground">{day}</span>

                    {kingdomStartDate && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(Date.parse(`${kingdomStartDate}T00:00:00Z`) + (day - 1) * 86400000).toLocaleDateString(
                          'en-GB',
                          { timeZone: 'UTC', day: '2-digit', month: 'short' }
                        )}
                      </span>
                    )}

                    <span className="text-muted-foreground text-[10px]">Day</span>

                    {/* ✅ OPTIMAL DOTS (CLEAN, GLOW ON HOVER ONLY) */}
                    {showOptimal && optimalDays[day] && (
                      <div className="mt-1 flex items-center justify-center gap-1">
                        {optimalDays[day].map((opt, idx) => {
                          const cfg = OPTIMAL_INDICATORS[opt.tag]
                          return (
                            <button
                              key={`${opt.tag}-${idx}`}
                              onClick={() =>
                                setActiveDayInfo({
                                  day,
                                  tag: opt.tag,
                                  events: opt.events,
                                })
                              }
                              aria-label={`Optimal ${cfg.label} window on day ${day}`}
                              className={cn(
                                'w-2.5 h-2.5 rounded-full',
                                'transition-transform duration-150',
                                'hover:scale-150',
                                cfg.dot,
                                'hover:' + cfg.glow
                              )}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Events Grid */}
            <div
              className="relative"
              style={{
                height:
                  totalRows * ROW_HEIGHT + (showBundles ? bundles.length * (ROW_HEIGHT - 10) : 0) + 40,
              }}
            >
              {/* Grid Lines */}
              <div className="absolute inset-0 flex">
                {Array.from({ length: TOTAL_DAYS }, (_, i) => {
                  const day = i + 1
                  const isWeekStart = day % 7 === 1
                  return (
                    <div
                      key={day}
                      className={cn('border-r border-border/50 h-full', isWeekStart && 'bg-muted/20')}
                      style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH }}
                    />
                  )
                })}
              </div>

              {/* Event Bars */}
              {rows.map(({ event, row }) => {
                const left = (event.start_day - 1) * DAY_WIDTH
                const width = (event.end_day - event.start_day + 1) * DAY_WIDTH
                const top = row * ROW_HEIGHT + 10
                const color = getCategoryColor(event.category_id)

                const isMeta = (e: CalendarEventWithMeta | CalendarEvent): e is CalendarEventWithMeta =>
                  typeof (e as CalendarEventWithMeta).created_by === 'string'

                return (
                  <div
                    key={event.id}
                    className={cn(
                      'absolute rounded-md cursor-pointer transition-all duration-200 ease-out',
                      'hover:scale-[1.03] hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)]',
                      isSelected(event.id) &&
                        'ring-4 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]'
                    )}
                    style={{
                      left,
                      top,
                      width: width - 4,
                      height: ROW_HEIGHT - 8,
                      backgroundColor: color,
                      marginLeft: 2,
                    }}
                    onClick={() => {
                      // Wheel events aren't CalendarEventWithMeta. Only toggle real events.
                      if (isMeta(event)) toggleEvent(event)
                      else setSelectedEvent(event as any)
                    }}
                  >
                    <div className="px-2 py-1 h-full flex items-center overflow-hidden">
                      <span className="text-xs font-medium text-white truncate drop-shadow-sm">
                        {event.name}
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* Bundle Bars */}
              {showBundles &&
                bundles.map((bundle, index) => {
                  const left = (bundle.start_day - 1) * DAY_WIDTH
                  const width = (bundle.end_day - bundle.start_day + 1) * DAY_WIDTH
                  const top = totalRows * ROW_HEIGHT + index * (ROW_HEIGHT - 10) + 20

                  return (
                    <div
                      key={`bundle-${bundle.id}`}
                      className={cn(
                        'absolute rounded-md border border-border',
                        'bg-muted/70 cursor-pointer transition-all duration-200',
                        'hover:bg-muted hover:scale-[1.02]'
                      )}
                      style={{
                        left,
                        top,
                        width: width - 4,
                        height: ROW_HEIGHT - 14,
                        marginLeft: 2,
                      }}
                      title={bundle.name}
                    >
                      <div className="px-2 py-1 h-full flex items-center overflow-hidden">
                        <span className="text-[11px] font-medium text-muted-foreground truncate">
                          🛒 {bundle.name}
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Event Modal */}
        {selectedEvent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-card rounded-xl shadow-2xl max-w-lg w-full p-6 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>

              <h3 className="text-xl font-semibold mb-2">{selectedEvent.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Days {selectedEvent.start_day} – {selectedEvent.end_day}
              </p>

              {selectedEvent.description && (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rewards Summary */}
      <div className="mt-4">
        <RewardsSummary events={events.filter(e => isSelected(e.id))} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>
          Showing {filteredEvents.length} of {events.length} events
        </span>
        <span>Scroll or use arrows to navigate the timeline</span>
      </div>

      {/* Optimal Modal */}
      {activeDayInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setActiveDayInfo(null)}
        >
          <div
            className="bg-card border border-border rounded-xl shadow-2xl p-6 w-[380px] animate-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  'w-3 h-3 rounded-full',
                  OPTIMAL_INDICATORS[activeDayInfo.tag].dot,
                  OPTIMAL_INDICATORS[activeDayInfo.tag].glow
                )}
              />
              <h3 className="font-semibold text-lg">
                Optimal {OPTIMAL_INDICATORS[activeDayInfo.tag].label} Window
              </h3>
            </div>

            <p className="text-xs text-muted-foreground mb-4">Day {activeDayInfo.day}</p>

            <ul className="space-y-1 text-sm">
              {uniqueEvents(activeDayInfo.events).map(e => (
                <li key={e.id}>• {e.name}</li>
              ))}
            </ul>

            <div className="mt-5 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setActiveDayInfo(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
