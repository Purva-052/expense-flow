// --- MODIFICATION: Using your specific enum values for the type ---
export enum ProjectPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}


/* eslint-disable @typescript-eslint/no-explicit-any */
export type Developer = {
  id: string
  fullName: string
  role:string
  email:string
  technology: any
  assignedProjectIds: string[]
  removalSchedule?: Record<string, string> // projectId -> ISO date
  isCurrentProject?: boolean
}

export type Project = {
  id: string
  name: string
  expectedCompletionDate: string
  assignedDeveloperIds: string[]
  currentStatus:any
  priority: ProjectPriority; // Use the enum here
}

export type ScheduleItem = {
  developerId: string
  projectId: string
  removeAt: string // ISO date
}

export type BoardData = {
  projects: Project[]
  developers: Developer[]
}
