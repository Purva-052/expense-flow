/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from "zustand";

interface StoreState<T> {
  // 👇 UPDATE: Added "view_profile" to the list of allowed strings
  open: "add" | "edit" | "delete" | "view" | "view_profile" | null;

  // 👇 UPDATE: Updated the setter type as well
  setOpen: (
    open: "add" | "edit" | "delete" | "view" | "view_profile" | null
  ) => void;

  currentRow: T | null;
  setCurrentRow: (row: T | null) => void;
}

export const useUsersStore = create<StoreState<any>>((set) => ({
  open: null,
  setOpen: (open) => set({ open }),
  currentRow: null,
  setCurrentRow: (row) => set({ currentRow: row }),
}));
