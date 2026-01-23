export interface DailyReport {
  id: number;
  reportingDate: string;
  employee: {
    id: number;
    fullName: string;
    email: string;
  };
  project: {
    id: number;
    name: string;
  };
  task: {
    id: number;
    taskName: string;
  };
  taskDescription: string;
  timeSpent: string;
  createdBy: number;
  createdByUser: {
    id: number;
    fullName: string;
    email: string;
  };
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  milestone?: {
    id?: number;
    name: string;
  };
  remark?: string;
}
