/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from 'zustand'

interface StoreState<T> {
  open: any
  setOpen: (open: any) => void
  currentRow: T | null
  setCurrentRow: (row: T | null) => void
}

// Create the Zustand store for Operators
export const useProjectModuleStore = create<StoreState<any>>((set) => ({
  open: null,
  setOpen: (open) => set({ open }),
  currentRow: null,
  setCurrentRow: (row) => set({ currentRow: row }),
}))
