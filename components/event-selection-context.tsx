'use client'

import { createContext, useContext, useState } from 'react'
import { CalendarEventWithMeta } from '@/lib/types'

type Ctx = {
  selectedEvents: CalendarEventWithMeta[]
  toggleEvent: (e: CalendarEventWithMeta) => void
  isSelected: (id: string) => boolean
}

const EventSelectionContext = createContext<Ctx | null>(null)

export function EventSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedEvents, setSelectedEvents] = useState<CalendarEventWithMeta[]>([])

  function toggleEvent(event: CalendarEventWithMeta) {
    setSelectedEvents(prev =>
      prev.some(e => e.id === event.id)
        ? prev.filter(e => e.id !== event.id)
        : [...prev, event]
    )
  }

  function isSelected(id: string) {
    return selectedEvents.some(e => e.id === id)
  }

  return (
    <EventSelectionContext.Provider value={{ selectedEvents, toggleEvent, isSelected }}>
      {children}
    </EventSelectionContext.Provider>
  )
}

export function useEventSelection() {
  const ctx = useContext(EventSelectionContext)
  if (!ctx) throw new Error('Missing EventSelectionProvider')
  return ctx
}

