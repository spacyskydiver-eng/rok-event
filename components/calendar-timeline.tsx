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
const OPTIMAL_INDICATORS = {
  TRAINING_POINTS: {
    label: 'Training',
    color: 'bg-red-500',
    icon: '⚔️',
  },
  BUILDING_POINTS: {
    label: 'Building',
    color: 'bg-blue-500',
    icon: '🏗️',
  },
  RESEARCH_POINTS: {
    label: 'Research',
    color: 'bg-purple-500',
    icon: '📜',
  },
} as const
const DAY_WIDTH = 56
const ROW_HEIGHT = 50
const HEADER_HEIGHT = 60


export function CalendarTimeline({ events, categories, bundles }: CalendarTimelineProps) {
const { toggleEvent, isSelected } = useEventSelection()
const [activeDayInfo, setActiveDayInfo] = useState<{
  day: number
  events: CalendarEventWithMeta[]
} | null>(null)



  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(categories.map(c => c.id))
  )
  const [showBundles, setShowBundles] = useState(true)
  const [showOptimal, setShowOptimal] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventWithMeta | null>(null)
  const [kingdomStartDate, setKingdomStartDate] = useState<string>('')
  const [firstCaoWheelDate, setFirstCaoWheelDate] = useState<string>('') // YYYY-MM-DD (UTC)

  
  



  

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const [scrollPosition, setScrollPosition] = useState(0)


function toUtcMidnightMs(dateStr: string) {
  // dateStr must be "YYYY-MM-DD" from <input type="date">
  return Date.parse(`${dateStr}T00:00:00Z`)
}



// ===== Wheel of Fortune generation (anchored by first Cao wheel) =====
const wheelEvents: CalendarEvent[] = (() => {
  // If we don’t have both, don’t render wheels.
  if (!kingdomStartDate || !firstCaoWheelDate) return []

  const kingdomStartMs = toUtcMidnightMs(kingdomStartDate)
  const firstMs = toUtcMidnightMs(firstCaoWheelDate)

  if (Number.isNaN(kingdomStartMs) || Number.isNaN(firstMs)) return []



  // Convert the anchor date to a kingdom day number
  const day1Based =
  Math.floor((firstMs - kingdomStartMs) / 86400000) + 1


  if (day1Based < 1 || day1Based > TOTAL_DAYS) return []

  const result: CalendarEvent[] = []

  // i=0 is Cao (anchor). i=1 is Richard (next wheel), then continue every 14 days.
  for (let i = 0; i < 20; i++) {
    const start_day = day1Based + i * 14
    const end_day = start_day + 2

    if (start_day > TOTAL_DAYS) break

    result.push({
      id: `wheel-${i}-${start_day}`,
      name:
        i === 0
          ? "Wheel of Fortune (Cao Cao)"
          : i === 1
            ? "Wheel of Fortune (Richard)"
            : "Wheel of Fortune",
      start_day,
      end_day: Math.min(end_day, TOTAL_DAYS),
      description:
        i === 0
          ? "Anchored to your first Cao Cao Wheel date."
          : "Generated every 14 days from your first Cao Cao Wheel.",
      category_id: null,
      created_by: "local",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as CalendarEvent)
  }

  return result
})()



// ===== Optimal Training Days (auto-detected) =====
const optimalDays: Record<
  number,
  { tag: keyof typeof OPTIMAL_INDICATORS; events: CalendarEventWithMeta[] }[]
> = {}

for (const tag of Object.keys(OPTIMAL_INDICATORS) as (keyof typeof OPTIMAL_INDICATORS)[]) {
  const taggedEvents = events.filter(e => e.tags?.includes(tag))

  for (let i = 0; i < taggedEvents.length; i++) {
    for (let j = i + 1; j < taggedEvents.length; j++) {
      const a = taggedEvents[i]
      const b = taggedEvents[j]

      const start = Math.max(a.start_day, b.start_day)
      const end = Math.min(a.end_day, b.end_day)

      if (start <= end) {
        for (let day = start; day <= end; day++) {
          if (!optimalDays[day]) optimalDays[day] = []
          optimalDays[day].push({ tag, events: [a, b] })
        }
      }
    }
  }
}



// ===== Filtered Events =====
const filteredEvents = [...events, ...wheelEvents].filter(
  event => !event.category_id || selectedCategories.has(event.category_id)
)




  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedCategories(new Set(categories.map(c => c.id)))
  }

  const deselectAll = () => {
    setSelectedCategories(new Set())
  }

  // Calculate row positions for stacked events
  const calculateEventRows = () => {
    const sortedEvents = [...filteredEvents].sort((a, b) => a.start_day - b.start_day)
    const rows: { event: CalendarEvent; row: number }[] = []
    const rowEnds: number[] = []

    for (const event of sortedEvents) {
      let assignedRow = -1
      for (let i = 0; i < rowEnds.length; i++) {
        if (rowEnds[i] < event.start_day) {
          assignedRow = i
          rowEnds[i] = event.end_day
          break
        }
      }
      if (assignedRow === -1) {
        assignedRow = rowEnds.length
        rowEnds.push(event.end_day)
      }
      rows.push({ event, row: assignedRow })
    }

    return { rows, totalRows: Math.max(rowEnds.length, 1) }
  }

  const { rows, totalRows } = calculateEventRows()

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(TOTAL_DAYS * DAY_WIDTH - scrollContainerRef.current.clientWidth, scrollPosition + scrollAmount)
      
      scrollContainerRef.current.scrollTo({ left: newPosition, behavior: 'smooth' })
      setScrollPosition(newPosition)
    }
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      const handleScroll = () => setScrollPosition(container.scrollLeft)
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const getCategoryColor = (categoryId: string | null) => {
    

    if (!categoryId) return '#6b7280'
    const category = categories.find(c => c.id === categoryId)
    return category?.color || '#6b7280'
  }
  




  return (
    <div className="flex flex-col gap-4">

{/* Kingdom start date */}
<div className="flex flex-col gap-2 p-4 bg-card rounded-lg border border-border">
  <span className="text-sm font-semibold text-foreground">
    Kingdom start date (UTC)
  </span>

  <input
    type="date"
    className="h-9 rounded-md border border-border bg-background px-3 text-sm"
    value={kingdomStartDate}
    onChange={(e) => setKingdomStartDate(e.target.value)}
  />
</div>

{/* Wheel of Fortune Setup (client-side only) */}
<div className="flex flex-col gap-2 p-4 bg-card rounded-lg border border-border">
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-foreground">
        Wheel of Fortune (Cao Cao) setup
      </span>
      <span className="text-xs text-muted-foreground">
        Best option: enter the first date your kingdom got the Cao Cao Wheel (UTC). This anchors all future Wheels.
      </span>
    </div>

    <label className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">First Cao Cao Wheel date (UTC)</span>
      <input
        type="date"
        className="h-9 rounded-md border border-border bg-background px-3 text-sm"
        value={firstCaoWheelDate}
        onChange={(e) => setFirstCaoWheelDate(e.target.value)}
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
        <Button variant="outline" size="sm" onClick={deselectAll} className="text-xs bg-transparent">
          None
        </Button>
        <div className="w-px h-6 bg-border mx-2" />

<Button
  variant={showBundles ? "default" : "outline"}
  size="sm"
  onClick={() => setShowBundles(prev => !prev)}
  className="text-xs"
>
  🛒 Bundles
</Button>
<Button
  variant={showOptimal ? "default" : "outline"}
  size="sm"
  onClick={() => setShowOptimal(prev => !prev)}
  className="text-xs"
>
  ⭐ Optimal
</Button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              selectedCategories.has(category.id)
                ? "ring-2 ring-offset-2 ring-offset-background"
                : "opacity-50"
            )}
            style={{ 
              backgroundColor: `${category.color}20`,
              color: category.color,
              borderColor: category.color,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: category.color }}
            />
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
            <div 
              className="sticky top-0 z-10 flex bg-card border-b border-border"
              style={{ height: HEADER_HEIGHT }}
            >
              {Array.from({ length: TOTAL_DAYS }, (_, i) => {
                const day = i + 1
                const isWeekStart = day % 7 === 1
                return (
                  <div
                    key={day}
                    className={cn(
                      "flex flex-col items-center justify-center text-xs border-r border-border",
                      isWeekStart && "bg-muted/50"
                    )}
                    style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH }}
                  >
                    <span className="font-semibold text-foreground">{day}</span>
{kingdomStartDate && (
  <span className="text-[10px] text-muted-foreground">
    {new Date(Date.parse(`${kingdomStartDate}T00:00:00Z`) + (day - 1) * 86400000)
      .toLocaleDateString('en-GB', { timeZone: 'UTC', day: '2-digit', month: 'short' })}
  </span>
)}
                    <span className="text-muted-foreground text-[10px]">Day</span>
                    {showOptimal && optimalDays[day] && (
  <div className="mt-1 flex gap-1">
    {optimalDays[day].map((opt, i) => {
      const cfg = OPTIMAL_INDICATORS[opt.tag]
      return (
        <button
          key={i}
          onClick={() =>
            setActiveDayInfo({
              day,
              events: opt.events,
            })
          }
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center text-white text-[11px] shadow-md",
            cfg.color
          )}
        >
          {cfg.icon}
        </button>
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
      totalRows * ROW_HEIGHT +
      (showBundles ? bundles.length * (ROW_HEIGHT - 10) : 0) +
      40
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
                      className={cn(
                        "border-r border-border/50 h-full",
                        isWeekStart && "bg-muted/20"
                      )}
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

  return (
    <div
      key={event.id}
      className={cn(
        "absolute rounded-md cursor-pointer transition-all duration-200",
        isSelected(event.id) &&
          "ring-4 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)]"
      )}
      style={{
        left,
        top,
        width: width - 4,
        height: ROW_HEIGHT - 8,
        backgroundColor: color,
        marginLeft: 2
      }}
      onClick={() => toggleEvent(event)}
    >
      <div className="px-2 py-1 h-full flex items-center overflow-hidden">
        <span className="text-xs font-medium text-white truncate">
          {event.name}
        </span>
      </div>
    </div>
  )
})}


              {/* Bundle Bars */}
{showBundles && bundles.map((bundle, index) => {
  const left = (bundle.start_day - 1) * DAY_WIDTH
  const width = (bundle.end_day - bundle.start_day + 1) * DAY_WIDTH

  // place bundles below all event rows
  const top = totalRows * ROW_HEIGHT + index * (ROW_HEIGHT - 10) + 20

  return (
    <div
      key={`bundle-${bundle.id}`}
      className="
  absolute rounded-md border border-border
  bg-muted/70 cursor-pointer
  transition-all duration-200
  hover:bg-muted
  hover:scale-[1.02]
"      style={{
        left,
        top,
        width: width - 4,
        height: ROW_HEIGHT - 14,
        marginLeft: 2
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

      <h3 className="text-xl font-semibold mb-2">
        {selectedEvent.name}
      </h3>

      <p className="text-sm text-muted-foreground mb-4">
        Days {selectedEvent.start_day} – {selectedEvent.end_day}
      </p>

      {selectedEvent.description && (
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {selectedEvent.description}
        </div>
      )}
    </div>
  </div>
)}

      </div>
<div className="mt-4">
  <RewardsSummary events={events.filter(e => isSelected(e.id))} />
</div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>Showing {filteredEvents.length} of {events.length} events</span>
        <span>Scroll or use arrows to navigate the timeline</span>
      </div>
      {activeDayInfo && (
  <div
    className="fixed inset-0 z-50"
    onClick={() => setActiveDayInfo(null)}
  >
    <div
      className="absolute bg-card border border-border rounded-lg shadow-xl p-4 text-sm"
      style={{
        top: '120px',
        left: `${activeDayInfo.day * DAY_WIDTH}px`
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className="font-semibold mb-2 flex items-center gap-2">
        ⭐ Optimal Window
      </div>

      <div className="text-xs text-muted-foreground mb-2">
        Day {activeDayInfo.day}
      </div>

      <ul className="space-y-1">
        {Array.from(
          new Map(activeDayInfo.events.map(e => [e.id, e])).values()
        ).map(e => (
          <li key={e.id} className="text-xs">
            • {e.name}
          </li>
        ))}
      </ul>
    </div>
  </div>
)}

    </div>
  )
}
