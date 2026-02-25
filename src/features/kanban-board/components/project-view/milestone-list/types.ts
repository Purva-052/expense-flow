export interface MilestoneTask {
  id?: number;
  taskId?: number;
  taskName: string;
  estimatedTime: string;
  actualTime: string;
  weightageHours?: string;
  status?: string;
  comment?: string | null;
}

export interface Milestone {
  id: number;
  name: string;
  estimatedTime: string;
  weightageHours?: string;
  tasks: MilestoneTask[];
  status?: string;
}
