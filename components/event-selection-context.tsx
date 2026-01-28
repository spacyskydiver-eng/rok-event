'use client'

import { createContext, useContext, useState } from 'react'
import { CalendarEventWithMeta } from '@/lib/types'

type SelectionContextType = {
  selectedEvents: CalendarEventWithMeta[]
  toggleEvent: (event: CalendarEventWithMeta) => void
  isSelected: (eventId: string) => boolean
  clearSelection: () => void
}

const EventSelectionContext = createContext<SelectionContextType | null>(null)

export function EventSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedEvents, setSelectedEvents] = useState<CalendarEventWithMeta[]>([])

  function toggleEvent(event: CalendarEventWithMeta) {
    setSelectedEvents(prev => {
      const exists = prev.find(e => e.id === event.id)
      if (exists) {
        return prev.filter(e => e.id !== event.id)
      }
      return [...prev, event]
    })
  }

  function isSelected(eventId: string) {
    return selectedEvents.some(e => e.id === eventId)
  }

  function clearSelection() {
    setSelectedEvents([])
  }

  return (
    <EventSelectionContext.Provider
      value={{ selectedEvents, toggleEvent, isSelected, clearSelection }}
    >
      {children}
    </EventSelectionContext.Provider>
  )
}

export function useEventSelection() {
  const ctx = useContext(EventSelectionContext)
  if (!ctx) {
    throw new Error('useEventSelection must be used inside EventSelectionProvider')
  }
  return ctx
}
