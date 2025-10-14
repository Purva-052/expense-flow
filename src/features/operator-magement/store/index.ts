// src/features/operators/store.ts

import { create } from 'zustand';
import { Operator } from '../types';

// Define the dialog types
export type DialogType = 'add' | 'edit' | 'delete' | null;

// Define the generic store interface
interface StoreState<T> {
    open: DialogType;
    setOpen: (open: DialogType) => void;
    currentRow: T | null;
    setCurrentRow: (row: T | null) => void;
}

// Create the Zustand store for Operators
export const useOperatorStore = create<StoreState<Operator>>((set) => ({
    open: null,
    setOpen: (open) => set({ open }),
    currentRow: null,
    setCurrentRow: (row) => set({ currentRow: row }),
}));