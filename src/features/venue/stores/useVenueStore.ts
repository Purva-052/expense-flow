/* eslint-disable @typescript-eslint/no-explicit-any */
// stores/useVenueStore.ts
import { create } from 'zustand'

interface StoreState<T> {
  open: any
  setOpen: (open: any) => void
  currentRow: T | null
  setCurrentRow: (row: T | null) => void
}

// Create the Zustand store for Operators
export const useVenueStore = create<StoreState<any>>((set) => ({
  open: null,
  setOpen: (open) => set({ open }),
  currentRow: null,
  setCurrentRow: (row) => set({ currentRow: row }),
}))
