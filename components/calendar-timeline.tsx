'use client'

import { useState, useRef, useEffect } from 'react'
import type {
  CalendarEvent,
  CalendarEventWithMeta,
  EventCategory,
  Bundle
} from '@/lib/types'
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
    glow: 'shadow-[0_0_14px_rgba(239,68,68,0.9)]',
  },
  BUILDING_POINTS: {
    label: 'Building',
    dot: 'bg-blue-500',
    glow: 'shadow-[0_0_14px_rgba(59,130,246,0.9)]',
  },
  RESEARCH_POINTS: {
    label: 'Research',
    dot: 'bg-purple-500',
    glow: 'shadow-[0_0_14px_rgba(168,85,247,0.9)]',
  },
} as const

export function CalendarTimeline({ events, categories, bundles }: CalendarTimelineProps) {
  const { toggleEvent, isSelected } = useEventSelection()

  const [activeDayInfo, setActiveDayInfo] = useState<{
    day: number
    tag: keyof typeof OPTIMAL_INDICATORS
    events: CalendarEventWithMeta[]
  } | null>(null)

  const [selectedCategories, setSelectedCategories] = useState(
    new Set(categories.map(c => c.id))
  )
  const [showBundles, setShowBundles] = useState(true)
  const [showOptimal, setShowOptimal] = useState(true)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  // ===== OPTIMAL DAY DETECTION =====
  const optimalDays: Record<
    number,
    { tag: keyof typeof OPTIMAL_INDICATORS; events: CalendarEventWithMeta[] }[]
  > = {}

  for (const tag of Object.keys(OPTIMAL_INDICATORS) as (keyof typeof OPTIMAL_INDICATORS)[]) {
    const tagged = events.filter(e => e.tags?.includes(tag))

    for (let i = 0; i < tagged.length; i++) {
      for (let j = i + 1; j < tagged.length; j++) {
        const a = tagged[i]
        const b = tagged[j]

        const start = Math.max(a.start_day, b.start_day)
        const end = Math.min(a.end_day, b.end_day)

        if (start <= end) {
          for (let day = start; day <= end; day++) {
            optimalDays[day] ??= []
            optimalDays[day].push({ tag, events: [a, b] })
          }
        }
      }
    }
  }

  const filteredEvents = events.filter(
    e => !e.category_id || selectedCategories.has(e.category_id)
  )

  const calculateEventRows = () => {
    const sorted = [...filteredEvents].sort((a, b) => a.start_day - b.start_day)
    const rows: { event: CalendarEvent; row: number }[] = []
    const rowEnds: number[] = []

    for (const event of sorted) {
      let row = rowEnds.findIndex(end => end < event.start_day)
      if (row === -1) row = rowEnds.length
      rowEnds[row] = event.end_day
      rows.push({ event, row })
    }

    return { rows, totalRows: Math.max(rowEnds.length, 1) }
  }

  const { rows, totalRows } = calculateEventRows()

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const delta = 400
    const next =
      dir === 'left'
        ? Math.max(0, scrollPosition - delta)
        : scrollPosition + delta
    scrollContainerRef.current.scrollTo({ left: next, behavior: 'smooth' })
    setScrollPosition(next)
  }

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const onScroll = () => setScrollPosition(el.scrollLeft)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="flex flex-col gap-4">

      {/* FILTERS */}
      <div className="flex gap-2 p-4 bg-card rounded-lg border border-border">
        <Button size="sm" onClick={() => setShowBundles(v => !v)}>
          🛒 Bundles
        </Button>
        <Button size="sm" onClick={() => setShowOptimal(v => !v)}>
          ⭐ Optimal
        </Button>
      </div>

      {/* TIMELINE */}
      <div className="relative bg-slate-800/80 rounded-lg border border-slate-700">
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
          <Button size="icon" onClick={() => scroll('left')}>
            <ChevronLeft />
          </Button>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
          <Button size="icon" onClick={() => scroll('right')}>
            <ChevronRight />
          </Button>
        </div>

        <div ref={scrollContainerRef} className="overflow-x-auto">
          <div style={{ width: TOTAL_DAYS * DAY_WIDTH }}>

            {/* DAY HEADER */}
            <div className="sticky top-0 flex bg-card border-b">
              {Array.from({ length: TOTAL_DAYS }, (_, i) => {
                const day = i + 1
                return (
                  <div
                    key={day}
                    className="flex flex-col items-center text-xs border-r"
                    style={{ width: DAY_WIDTH }}
                  >
                    <span className="font-semibold">{day}</span>
                    {showOptimal && optimalDays[day] && (
                      <div className="mt-1 flex gap-1">
                        {optimalDays[day].map((opt, idx) => {
                          const cfg = OPTIMAL_INDICATORS[opt.tag]
                          return (
                            <button
                              key={idx}
                              onClick={() =>
                                setActiveDayInfo({
                                  day,
                                  tag: opt.tag,
                                  events: opt.events,
                                })
                              }
                              className={cn(
                                'w-2.5 h-2.5 rounded-full animate-pulse transition-all',
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

            {/* EVENTS */}
            <div
              className="relative"
              style={{ height: totalRows * ROW_HEIGHT + 40 }}
            >
              {rows.map(({ event, row }) => {
                const left = (event.start_day - 1) * DAY_WIDTH
                const width = (event.end_day - event.start_day + 1) * DAY_WIDTH
                return (
                  <div
                    key={event.id}
                    onClick={() => toggleEvent(event)}
                    className={cn(
                      'absolute rounded-md px-2 py-1 text-xs text-white cursor-pointer',
                      isSelected(event.id) &&
                        'ring-4 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]'
                    )}
                    style={{
                      left,
                      top: row * ROW_HEIGHT + 8,
                      width: width - 4,
                      height: ROW_HEIGHT - 12,
                      backgroundColor: '#22c55e',
                    }}
                  >
                    {event.name}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {activeDayInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setActiveDayInfo(null)}
        >
          <div
            className="bg-card rounded-xl p-6 w-[360px] shadow-2xl"
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

            <p className="text-xs text-muted-foreground mb-4">
              Day {activeDayInfo.day}
            </p>

            <ul className="text-sm space-y-1">
              {Array.from(
                new Map(activeDayInfo.events.map(e => [e.id, e])).values()
              ).map(e => (
                <li key={e.id}>• {e.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <RewardsSummary events={events.filter(e => isSelected(e.id))} />
    </div>
  )
}