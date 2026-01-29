import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  // Calendar
  kingdomStartDate: string | null
  firstCaoWheelDate: string | null

  // Calculator inventory
  speedups: {
    universal: number
    building: number
    research: number
    training: number
  }

  resources: {
    food: number
    wood: number
    stone: number
    gold: number
  }

  // Actions
  setKingdomStartDate: (d: string | null) => void
  setFirstCaoWheelDate: (d: string | null) => void
  setSpeedups: (s: Partial<UserState['speedups']>) => void
  setResources: (r: Partial<UserState['resources']>) => void
  resetAll: () => void
}

export const useUserState = create<UserState>()(
  persist(
    (set) => ({
      kingdomStartDate: null,
      firstCaoWheelDate: null,

      speedups: {
        universal: 0,
        building: 0,
        research: 0,
        training: 0,
      },

      resources: {
        food: 0,
        wood: 0,
        stone: 0,
        gold: 0,
      },

      setKingdomStartDate: (d) => set({ kingdomStartDate: d }),
      setFirstCaoWheelDate: (d) => set({ firstCaoWheelDate: d }),

      setSpeedups: (s) =>
        set((state) => ({
          speedups: { ...state.speedups, ...s },
        })),

      setResources: (r) =>
        set((state) => ({
          resources: { ...state.resources, ...r },
        })),

      resetAll: () =>
        set({
          kingdomStartDate: null,
          firstCaoWheelDate: null,
          speedups: { universal: 0, building: 0, research: 0, training: 0 },
          resources: { food: 0, wood: 0, stone: 0, gold: 0 },
        }),
    }),
    {
      name: 'rok-user-state', // localStorage key
    }
  )
)
