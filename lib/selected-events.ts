import { create } from 'zustand'
import type { CalendarEventWithMeta } from '@/lib/types'

interface SelectedEventsState {
  events: CalendarEventWithMeta[]
  toggleEvent: (event: CalendarEventWithMeta) => void
  clear: () => void
}

export const useSelectedEvents = create<SelectedEventsState>((set, get) => ({
  events: [],

  toggleEvent: (event: CalendarEventWithMeta) => {
    const exists = get().events.some(e => e.id === event.id)

    set({
      events: exists
        ? get().events.filter(e => e.id !== event.id)
        : [...get().events, event],
    })
  },

  clear: () => set({ events: [] }),
}))
