import { create } from 'zustand'
import type { CalendarEventWithMeta } from '@/lib/types'

interface SelectedEventsState {
  events: CalendarEventWithMeta[]
  toggleEvent: (event: CalendarEventWithMeta) => void
  setEvents: (events: CalendarEventWithMeta[]) => void
  prunePastEvents: (currentDay: number) => void
  clear: () => void
}

export const useSelectedEvents = create<SelectedEventsState>((set, get) => ({
  events: [],

  toggleEvent: (event) => {
    const exists = get().events.some(e => e.id === event.id)
    set({
      events: exists
        ? get().events.filter(e => e.id !== event.id)
        : [...get().events, event],
    })
  },

  setEvents: (events) => set({ events }),

  prunePastEvents: (currentDay) => {
    // Remove events that are fully finished before "today"
    set({
      events: get().events.filter(e => (e.end_day ?? 0) >= currentDay),
    })
  },

  clear: () => set({ events: [] }),
}))

