import { create } from "zustand";

type ProductInquiryType = "add" | "edit" | "delete" | "view" | "comment" | null;

interface ProductInquiryStore {
  open: ProductInquiryType;
  currentRow: any;
  setOpen: (open: ProductInquiryType) => void;
  setCurrentRow: (row: any) => void;
}

export const useProductInquiryStore = create<ProductInquiryStore>((set) => ({
  open: null,
  currentRow: null,
  setOpen: (open) => set({ open }),
  setCurrentRow: (currentRow) => set({ currentRow }),
}));
