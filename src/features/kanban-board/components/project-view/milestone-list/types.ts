export interface MilestoneTask {
  id?: number;
  taskName: string;
  estimatedTime: string;
  actualTime: string;
  status?: string;
  comment?: string | null;
}

export interface Milestone {
  id: number;
  name: string;
  estimatedTime: string;
  tasks: MilestoneTask[];
  status?: string;
}
