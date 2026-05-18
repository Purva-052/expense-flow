import { create } from "zustand";

type ProductInquiryType = "add" | "edit" | "delete" | "view" | "comment" | null;

interface ProductInquiryStore {
  open: ProductInquiryType;
  currentRow: any;
  silencedInquiries: string[];
  setOpen: (open: ProductInquiryType) => void;
  setCurrentRow: (row: any) => void;
  silenceInquiry: (id: string) => void;
  unsilenceInquiry: (id: string) => void;
}

export const useProductInquiryStore = create<ProductInquiryStore>((set) => ({
  open: null,
  currentRow: null,
  silencedInquiries: [],
  setOpen: (open) => set({ open }),
  setCurrentRow: (currentRow) => set({ currentRow }),
  silenceInquiry: (id) =>
    set((state) => ({
      silencedInquiries: state.silencedInquiries.includes(id)
        ? state.silencedInquiries
        : [...state.silencedInquiries, id],
    })),
  unsilenceInquiry: (id) =>
    set((state) => ({
      silencedInquiries: state.silencedInquiries.filter((x) => x !== id),
    })),
}));
