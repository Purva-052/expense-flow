/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';

interface HoursLogProps {
  projectId: string | number;
  milestoneId?: string | number;
  taskId?: string | number;
  taskName?: string;
  taskStatus?: string;
  milestoneStatus?: string;
  reportId?: string | number;
  initialData?: {
    date: string | Date;
    description: string;
    timeSpent: string;
  };
  onSuccess?: () => void;
}

interface HoursLogStore {
  isOpen: boolean;
  props: HoursLogProps | null;
  openDialog: (props: HoursLogProps) => void;
  closeDialog: () => void;
}

export const useHoursLogStore = create<HoursLogStore>((set) => ({
  isOpen: false,
  props: null,
  openDialog: (props) => set({ isOpen: true, props }),
  closeDialog: () => set({ isOpen: false, props: null }),
}));
